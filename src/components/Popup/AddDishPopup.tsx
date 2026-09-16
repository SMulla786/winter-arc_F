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
import toast from 'react-hot-toast';
import {useLocation, useNavigate} from '@tanstack/react-router';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import {Route} from '@/routes/_app/_event/events.$id';

interface Dish {
  id: string;
  name: string;
}

interface Option {
  value: string;
  label: string;
}
type FormValues = z.infer<typeof dishMasterSchemaCat>;

interface AddDishPopupProps {
  onClose?: () => void;
}

const AddDishPopup: React.FC<AddDishPopupProps> = ({onClose}) => {
  const location = useLocation();
  const {state} = location;
  const {id: EventId} = Route.useParams<{id: string}>();
  console.log('Event ID:', EventId);

  const dishName = state?.dishName || '';
  console.log('Location state:', dishName);

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
  const {data: suggestions, refetch: refetchDishes} = useGetDishes();
  const {
    data: dishData,
    refetch: dishDataRefetch,
    isSuccess,
  } = useGetDishById(dishName);

  console.log('dishData', dishData);

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
      // Update existing dish
      updateDish(
        {
          id: dishId,
          data: payload,
        },
        {
          onSuccess: () => {
            // Refetch dishes to update the list
            refetchDishes();
            toast.success('Dish updated successfully');

            // Navigate back to events page
            if (onClose) {
              onClose(); // Close the popup first
            }
            navigate({to: `/events/${EventId}`});
          },
          onError: (error) => {
            console.error('Error updating dish:', error);
            toast.error('Failed to update dish. Please try again.');
          },
        },
      );
    } else {
      // Add new dish
      addDish(payload, {
        onSuccess: () => {
          // Refetch dishes to update the list
          refetchDishes();

          // Reset form
          methods.reset();

          // Show success message
          toast.success('Dish added successfully');

          // Close popup if onClose is provided
          if (onClose) {
            onClose();
          }

          // Navigate to events page with the event ID
          console.log('Navigating to:', `/events/${EventId}`);
          navigate({to: `/events/${EventId}`});
        },
        onError: (error) => {
          console.error('Error adding dish:', error);
          toast.error('Dish name already exists or something went wrong.');
        },
      });
    }
  };

  // Handle close with navigation
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    // Optionally navigate back to events page when closing without saving
    // navigate({to: `/events/${EventId}`});
  };

  useEffect(() => {
    if (addDishSuccess) {
      setDishId(addDishData?.data?.id);
    }
    if (isUpdateError) {
      toast.error('Dish name already exists..');
    }
  }, [addDishSuccess, isUpdateError, addDishData, methods]);

  useEffect(() => {
    if (updateDishSuccess) {
      setDishId(updateDishData?.data?.id);
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
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">New Dish Master Cateror</h1>
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            )}
          </div>
          <div className="grid md:gap-6">
            <div className="col-span-12 md:col-span-6">
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
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="bg-gray-300 hover:bg-gray-400 rounded-md px-4 py-2"
                disabled={isPending || isUpdatePending}
              >
                Cancel
              </button>
            )}
            <GenericButton
              type="submit"
              disabled={isPending || isUpdatePending}
            >
              {isPending
                ? 'Saving...'
                : isUpdatePending
                  ? 'Updating...'
                  : 'Save'}
            </GenericButton>
          </div>
        </form>
        {/* <NewRawMaterial dishId={dishId} /> */}
      </FormProvider>
    </>
  );
};

export default AddDishPopup;
