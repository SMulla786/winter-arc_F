/* eslint-disable */
import React, {useEffect, useMemo, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import {maharajSchema} from '@/lib/validation/maharajSchema';
import {
  useCreateMaharaj,
  useGetMaharajDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/maharaj';
import {useGetDishCategories} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useModal} from '@/context/ModalContext';
import {caterorId} from '@/lib/contants';
import {Loader} from '../Loader/Loader';

import GenericInputField from '../Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericButton from '../Forms/Buttons/GenericButton';
import CustomMultiSelectDropdown from '../Forms/SearchDropDown/CustomMultiSelectDropdown';

type FormValues = z.infer<typeof maharajSchema>;

const Maharaj: React.FC = () => {
  const {openModal} = useModal();

  const methods = useForm<FormValues>({
    resolver: zodResolver(maharajSchema),
  });

  const {mutateAsync: addMaharaj, isPending, isSuccess} = useCreateMaharaj();
  const {data: categories, isLoading: catLoading} = useGetDishCategories();
  const {data: allDishes, isLoading: dishLoading} = useGetMaharajDishes();

  const selectedCategories = methods.watch('categories') || []; // multiple
  const selectedDishes = methods.watch('dishes') || [];

  const categoryOptions =
    categories?.data?.categories?.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  // ✅ Build all selected dish option objects (for displaying chips)
  // Selected dish chips
  const selectedDishOptions =
    allDishes
      ?.filter((dish: any) => selectedDishes.includes(dish.id))
      .map((dish: any) => ({
        label: dish.name,
        value: dish.id,
      })) || [];

  // Available dishes from ALL selected categories
  const availableDishOptions =
    allDishes
      ?.filter((dish: any) => {
        if (selectedCategories.length === 0)
          return !selectedDishes.includes(dish.id);

        return (
          selectedCategories.includes(dish.categoryId) &&
          !selectedDishes.includes(dish.id)
        );
      })
      .map((dish: any) => ({
        label: dish.name,
        value: dish.id,
      })) || [];

  // Merge for dropdown display
  const mergedDishOptions = [...selectedDishOptions, ...availableDishOptions];

  const onSubmit = async (data: FormValues) => {
    if (!caterorId) return openModal('ERROR', <p>Invalid Cateror ID</p>);

    const formattedData = {
      ...data,
      caterorId,
      dishes: (data.dishes as string[]).map((id) => ({id})),
    };

    await addMaharaj(formattedData);
    methods.reset();
  };

  if (catLoading || dishLoading) return <Loader />;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-2">
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

          {/* ✅ Single category */}
          <div className="col-span-12 md:col-span-6">
            <CustomMultiSelectDropdown
              name="categories"
              label="Dish Categories"
              options={categoryOptions}
            />
          </div>

          {/* ✅ Dishes (show selected chips, but not in dropdown) */}
          <div className="col-span-12 md:col-span-6">
            <CustomMultiSelectDropdown
              name="dishes"
              label="Dishes"
              options={mergedDishOptions}
              placeholder={
                selectedCategories.length > 0
                  ? 'Select Dishes'
                  : 'Select at least one category first'
              }
            />
          </div>

          <div className="col-span-12 md:col-span-full">
            <GenericTextArea
              name="address"
              label="Residential Address"
              placeholder="Enter the Residential Address"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default Maharaj;
