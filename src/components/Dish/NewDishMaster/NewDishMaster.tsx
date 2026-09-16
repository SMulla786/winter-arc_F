import React, {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {dishMasterSchemaCat} from '@/lib/validation/dishSchemas';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  useAddDish,
  useGetDishById,
  useGetDishCategories,
  useGetDishes,
  useUpdateDish,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import GenericSearchDropdown from '@/components/Forms/SearchDropDown/GenericSearchDropdown';
import GenericTextArea from '@/components/Forms/TextArea/GenericTextArea';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import SearchInputWithSuggestions from '@/components/Forms/Input/GenericInputFieldList';
import NewRawMaterial from './NewRawMaterial';
import toast from 'react-hot-toast';
import {useLocation, useNavigate} from '@tanstack/react-router';
import GenericInputField from '@/components/Forms/Input/GenericInputField';

interface Dish {
  id: string;
  name: string;
}

interface Option {
  value: string;
  label: string;
}
type FormValues = z.infer<typeof dishMasterSchemaCat>;

const NewDishMaster: React.FC = () => {
  const location = useLocation();
  const {state} = location;
  const dishName = state?.dishName || '';

  const navigate = useNavigate();

  const dishEdit = sessionStorage.getItem('dishEdit');
  const methods = useForm<FormValues>({
    resolver: zodResolver(dishMasterSchemaCat),
    defaultValues: {},
  });
  const {reset} = methods;

  useEffect(() => {
    if (dishEdit) {
      sessionStorage.removeItem('dishEdit');
    }
  }, [dishEdit]);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishId, setDishId] = useState<string>('');
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [singleDishData, setSingleDishData] = useState(null);

  const {data: dishCategories} = useGetDishCategories();
  const {data: suggestions} = useGetDishes();
  const {
    data: dishData,
    refetch: dishDataRefetch,
    isSuccess,
  } = useGetDishById(dishName);

  const {
    mutate: addDish,
    isSuccess: addDishSuccess,
    isError: isUpdateError,
    data: addDishData,
    isPending,
  } = useAddDish();

  const {
    mutate: updateDish,
    isSuccess: updateDishSuccess,
    isError: isUpdateError2,
    data: updateDishData,
    isPending: isUpdatePending,
  } = useUpdateDish();

  // Load categories and dishes
  useEffect(() => {
    if (dishCategories?.data?.categories) {
      const options = dishCategories.data.categories.map(
        (category: {id: string; name: string}) => ({
          value: category.id,
          label: category.name,
        }),
      );
      setCategoryOptions(options);
    }

    if (suggestions?.data?.dishes) {
      setDishes(suggestions.data.dishes);
    }
  }, [suggestions, dishCategories]);

  useEffect(() => {
    if (dishData) {
      reset({
        name: dishData?.data?.name,
        dishCategory: String(dishData?.data?.categoryId),
        description: dishData?.data?.description || '',
        vegNonveg: dishData?.data?.vegNonveg || '',
      });
    }
  }, [dishData]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      categoryId: data.dishCategory,
      description: data.description || '',
      vegNonveg: data.vegNonveg || '',
      priority: 'P1',
    };

    if (dishId) {
      updateDish(
        {
          id: dishId,
          data: payload,
        },
        {
          onSuccess: () => {
            navigate({to: '/Alldishes'});
          },
        },
      );
    } else {
      addDish(payload, {
        onSuccess: () => {
          navigate({to: '/Alldishes'});
        },
      });
    }
  };

  useEffect(() => {
    if (addDishSuccess) {
      // toast.success('Dish added successfully');
      setDishId(addDishData?.data?.id);
      methods.reset();
    }
    if (isUpdateError) {
      toast.error('Dish name already exists..');
    }
  }, [addDishSuccess, isUpdateError, addDishData, methods]);

  useEffect(() => {
    if (updateDishSuccess) {
      toast.success('Dish updated successfully');
      setDishId(updateDishData?.data?.id);
      methods.reset();
    }
    if (isUpdateError2) {
      toast.error('Dish name already exists..');
    }
  }, [updateDishSuccess, isUpdateError2, updateDishData, methods]);

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 bg-white p-8 dark:bg-black"
        >
          <div className="grid md:gap-6">
            <h1 className="col-span-12 mb-4 text-lg font-semibold">
              New Dish Master Cateror
            </h1>
            <div className="col-span-12 md:col-span-6">
              {/* <SearchInputWithSuggestions
                name="name"
                label="Dish Name"
                placeholder="Search or type a dish name"
                suggestions={dishes}
                onDishSearch={onDishSearch}
                defaultValue={dishId ? dishId : ''}
              /> */}
              <GenericInputField
                name="name"
                label="Dish Name"
                placeholder="Enter dish name"
              />
            </div>

            {/* Dish Category */}
            <div className="col-span-12 md:col-span-6">
              <GenericSearchDropdown
                label="Dish Category"
                name="dishCategory"
                options={categoryOptions}
              />
            </div>

            {/* Dish Type */}
            <div className="col-span-12 md:col-span-6">
              <GenericSearchDropdown
                label="Dish Type"
                name="vegNonveg"
                options={[
                  {label: 'VEG', value: 'VEG'},
                  {label: 'NON VEG', value: 'NONVEG'},
                ]}
              />
            </div>

            {/* Dish Description (span full width) */}
            <div className="col-span-12 md:col-span-6">
              <GenericTextArea
                rows={2}
                name="description"
                label="Dish Description"
                placeholder="Enter dish description"
              />
            </div>
          </div>
          {/* Form Buttons */}
          <div className="flex justify-end space-x-4">
            <GenericButton type="submit">
              {isPending ? 'Saving...' : 'Save'}
            </GenericButton>
          </div>
        </form>
        {/* <NewRawMaterial dishId={dishId} /> */}
      </FormProvider>
    </>
  );
};

export default NewDishMaster;
