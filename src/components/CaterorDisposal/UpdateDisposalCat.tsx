import React, {useEffect} from 'react';
import toast from 'react-hot-toast';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {updatedisposalSchema} from '@/lib/validation/disposalSchema';
import {
  useGetDisposalById,
  useUpdateDisposal,
} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {useMatch, useNavigate} from '@tanstack/react-router';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';

type FormValues = z.infer<typeof updatedisposalSchema>;

const UpdateDisposalCat: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {params} = useMatch('/_app/_edit/update/disposalCateror/$id' as any);
  const {id = ''} = params as {id: string};

  const methods = useForm<FormValues>({
    resolver: zodResolver(updatedisposalSchema),
  });

  const {reset, setValue, handleSubmit} = methods;

  // Fetch disposal category data by ID
  const {data: disposal, isSuccess} = useGetDisposalById(id);

  // Use the mutation to update disposal category
  const {
    mutate: updateDisposal,
    isPending,
    isSuccess: isUpdateSuccess,
    isError,
    error,
  } = useUpdateDisposal();

  // Populate the form when disposal category data is successfully fetched
  useEffect(() => {
    if (isSuccess && disposal) {
      setValue('disposalName', disposal.data.name || '');
      setValue('inventory', disposal.data.inventory || '');
      setValue('unit', disposal.data.unit || '');
      setValue('price', disposal.data.price || '');
    }
  }, [isSuccess, disposal, setValue]);

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    const updateData = {
      name: data.disposalName,
      id,
      languageId: disposal?.data.languageId, // Include languageId if needed
      categoryId: disposal?.data.categoryId,
      inventory: Number(data.inventory),
      unit: data?.unit,
      price: Number(data.price),
    };

    updateDisposal({
      id, // The ID to identify which category to update
      data: updateData, // The update data object
    });
  };

  // Handle post-update actions: reset form and navigate to list
  useEffect(() => {
    if (isUpdateSuccess) {
      reset();
      navigate({
        to: '/disposal', // Redirect after update
      });
    } else if (isError) {
      const errorMessage =
        (error as {message?: string})?.message ||
        'Something went wrong while updating the disposal category';
    }
  }, [isUpdateSuccess, isError, error, reset, navigate]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Disposal
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="disposalName"
              label="Disposal Name"
              placeholder="Enter Disposal Name"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="inventory"
              label="Inventory"
              placeholder="Enter Inventory"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="unit"
              label="Disposal Unit"
              options={[
                {label: 'PKT', value: 'PKT'},
                {label: 'PIECE', value: 'PIECE'},
                {label: 'DOZEN', value: 'DOZEN'},
                {label: 'BOX', value: 'BOX'},
                {label: 'KG', value: 'KG'},
                {label: 'LITER', value: 'LTR'},
                {label: 'ROLL', value: 'ROLL'},
                {label: 'METER', value: 'MTR'},
              ]}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="price"
              label="Price"
              placeholder="Enter price"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GenericButton
            type="button"
            onClick={() => navigate({to: `/disposal`})}
          >
            Cancel
          </GenericButton>
          <GenericButton type="submit">
            {isPending ? 'Updating...' : 'Update'}
          </GenericButton>
          {/* <GenericResetButton type="reset">Reset</GenericResetButton> */}
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateDisposalCat;
