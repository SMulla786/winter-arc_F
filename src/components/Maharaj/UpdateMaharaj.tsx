/*eslint-disable*/
import React, {useEffect, useMemo} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {updatemaharajSchema} from '@/lib/validation/maharajSchema';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useGetDishUpdate,
  useGetMaharajData,
  useUpdateMaharaj,
} from '@/lib/react-query/queriesAndMutations/cateror/maharaj';
import {useGetDishCategories} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useNavigate, useLocation} from '@tanstack/react-router';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import CustomMultiSelectDropdown from '../Forms/SearchDropDown/CustomMultiSelectDropdown';
import {Loader} from '../Loader/Loader';

type FormValues = z.infer<typeof updatemaharajSchema>;

interface Props {
  id: string;
}

const UpdateMaharaj: React.FC<Props> = ({id}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the source from navigation state (default to undefined if not present)
  const fromSource = (location.state as any)?.from || 'inhouse';

  const methods = useForm<FormValues>({
    resolver: zodResolver(updatemaharajSchema),
    defaultValues: {
      dishes: [],
      categories: [],
    },
  });

  const {mutateAsync: updateMaharaj, isPending} = useUpdateMaharaj();
  const {data: maharajData, isLoading: maharajLoading} = useGetMaharajData(id);
  const {data: dishes, isLoading: dishLoading} = useGetDishUpdate(id);
  const {data: categories, isLoading: catLoading} = useGetDishCategories();

  console.log('maharajData', maharajData);

  const selectedCategory = methods.watch('categories')?.[0];
  const selectedDishes = methods.watch('dishes') || [];

  // Extract the actual maharaj data (handle both with and without data wrapper)
  const maharaj = useMemo(() => {
    if (!maharajData) return null;
    // Check if data is wrapped in a 'data' property
    return maharajData.data || maharajData;
  }, [maharajData]);

  // Extract existing categories from CaterorDish array
  const existingCategories = useMemo(() => {
    if (!maharaj?.CaterorDish) return [];

    // Get unique categories by name (since we don't have category ID)
    const uniqueCategories = new Map();
    maharaj.CaterorDish.forEach((item: any) => {
      if (item.category?.name) {
        // Use category name as key since we don't have ID
        const categoryKey = item.category.name.toLowerCase();
        if (!uniqueCategories.has(categoryKey)) {
          uniqueCategories.set(categoryKey, {
            name: item.category.name,
            // We'll need to find matching category ID from categories list
          });
        }
      }
    });

    return Array.from(uniqueCategories.values()).map((cat) => cat.name);
  }, [maharaj]);

  // Get dish IDs from CaterorDish (if dishes have IDs in your data structure)
  const existingDishIds = useMemo(() => {
    if (!maharaj?.CaterorDish) return [];

    // If your CaterorDish items have dish IDs, extract them
    return maharaj.CaterorDish.map((item: any) => item.id).filter(
      (id: string) => id,
    );
  }, [maharaj]);

  // Format category options - MOVE THIS BEFORE EARLY RETURN
  const categoryOptions = useMemo(() => {
    return (
      categories?.data?.categories?.map((cat: any) => ({
        label: cat.name,
        value: cat.id,
      })) || []
    );
  }, [categories]);

  // Selected dish options - MOVE THIS BEFORE EARLY RETURN
  const selectedDishOptions = useMemo(() => {
    if (!dishes) return [];
    return (
      dishes
        ?.filter((dish: any) => selectedDishes.includes(dish.id))
        .map((dish: any) => ({
          label: dish.name,
          value: dish.id,
        })) || []
    );
  }, [dishes, selectedDishes]);

  // Available dish options - MOVE THIS BEFORE EARLY RETURN
  const availableDishOptions = useMemo(() => {
    if (!dishes) return [];
    return (
      dishes
        ?.filter((dish: any) => {
          if (!selectedCategory) return !selectedDishes.includes(dish.id);
          return (
            dish.categoryId === selectedCategory &&
            !selectedDishes.includes(dish.id)
          );
        })
        .map((dish: any) => ({
          label: dish.name,
          value: dish.id,
        })) || []
    );
  }, [dishes, selectedCategory, selectedDishes]);

  // Merged dish options - MOVE THIS BEFORE EARLY RETURN
  const mergedDishOptions = useMemo(() => {
    return [...selectedDishOptions, ...availableDishOptions];
  }, [selectedDishOptions, availableDishOptions]);

  // Selected category name - MOVE THIS BEFORE EARLY RETURN
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory || !categories?.data?.categories) return null;
    const found = categories.data.categories.find(
      (cat: any) => cat.id === selectedCategory,
    );
    return found?.name;
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (maharaj && Array.isArray(dishes)) {
      // Try to find category IDs that match the existing category names
      const matchedCategoryIds = [];
      if (existingCategories.length > 0 && categories?.data?.categories) {
        const allCategories = categories.data.categories;
        for (const existingCatName of existingCategories) {
          const matchedCat = allCategories.find(
            (cat: any) =>
              cat.name.toLowerCase() === existingCatName.toLowerCase(),
          );
          if (matchedCat) {
            matchedCategoryIds.push(matchedCat.id);
          }
        }
      }

      methods.reset({
        fullname: maharaj.fullname || '',
        email: maharaj.email || '',
        phoneNumber: maharaj.phoneNumber || '',
        address: maharaj.address || '',
        specialization: Array.isArray(maharaj.specialization)
          ? maharaj.specialization.join(', ')
          : maharaj.specialization || '',
        experience: maharaj.experience || '',
        dishes: existingDishIds.length ? existingDishIds : [],
        categories: matchedCategoryIds.length ? matchedCategoryIds : [],
      });
    }
  }, [
    maharaj,
    dishes,
    categories,
    methods,
    existingCategories,
    existingDishIds,
  ]);

  const onSubmit = async (data: FormValues) => {
    try {
      const specializationArray =
        typeof data.specialization === 'string'
          ? data.specialization.split(',').map((s) => s.trim())
          : data.specialization;

      const formattedDishes = (data.dishes || []).map((id: string) => ({id}));

      await updateMaharaj({
        id,
        data: {
          ...data,
          specialization: specializationArray,
          dishes: formattedDishes,
        },
      });

      // Navigate back to foodvendor with state to set the active tab
      navigate({
        to: '/foodvendor',
        state: {activeTab: fromSource}, // Pass the source as activeTab
      });
    } catch (error) {
      console.error('Failed to update maharaj:', error);
    }
  };

  // Check loading state - AFTER all hooks
  if (dishLoading || catLoading || maharajLoading) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <div className="mb-4">
        <button
          onClick={() =>
            navigate({
              to: '/foodvendor',
              state: {activeTab: fromSource},
            })
          }
          className="dark:text-gray-200 px-2 py-0 text-xl font-bold transition"
        >
          ← Back
        </button>
      </div>

      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Maharaj
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="fullname"
              label="Full Name"
              placeholder="Enter your Full Name"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter the Phone Number"
            />
          </div>

          <div className="col-span-12 md:col-span-full">
            <GenericTextArea
              name="address"
              label="Residential Address"
              placeholder="Enter the Residential Address"
            />
          </div>

          {/* Single Category Dropdown */}
          <div className="col-span-12 md:col-span-4">
            <CustomMultiSelectDropdown
              name="categories"
              label="Dish Category"
              options={categoryOptions}
              singleSelect
            />
          </div>

          {/* Dishes dropdown linked to selected category */}
          <div className="col-span-12 md:col-span-4">
            <CustomMultiSelectDropdown
              name="dishes"
              label="Dishes"
              options={mergedDishOptions}
              placeholder={
                selectedCategory ? 'Select Dishes' : 'Select a category first'
              }
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateMaharaj;
