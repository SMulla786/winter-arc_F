import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {crmSchema} from '@/lib/validation/crmSchema';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {useMatch, useNavigate} from '@tanstack/react-router';
import {z} from 'zod';
import {
  useGetCRMById,
  useUpdateCRM,
} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';

type FormValues = z.infer<typeof crmSchema>;

const UpdateCRM = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match = useMatch('/_app/updatecrm/$id' as any);
  const {id} = match.params as {id: string};

  const navigate = useNavigate();

  // --- 2. Query & Mutation ---
  const {data: apiResponse, isLoading, isError} = useGetCRMById(id);
  const {mutate: updateCRM, isPending} = useUpdateCRM();

  // --- 3. Form Setup ---
  const methods = useForm<FormValues>({
    resolver: zodResolver(crmSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const {reset, handleSubmit} = methods;

  // --- 4. Populate form when data loads ---
  useEffect(() => {
    if (apiResponse?.data) {
      const {name, description} = apiResponse.data;
      reset({name, description: description ?? ''});
    }
  }, [apiResponse?.data, reset]);

  // --- 5. Submit Handler ---
  const onSubmit = (values: FormValues) => {
    // Always send description, even if empty
    const payload = {
      id,
      name: values.name,
      description: values.description || '', // Send empty string if description is falsy
    };

    updateCRM({
      data: payload,
    });
    navigate({to: '/crm'});
  };

  // --- 6. Loading & Error States ---
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading CRM data...</p>
      </div>
    );
  }

  if (isError || !apiResponse?.data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Failed to load CRM record.</p>
      </div>
    );
  }

  // --- 7. Render Form ---
  return (
    <div className="rounded-lg bg-white p-8 shadow dark:bg-black">
      <h2 className="mb-6 text-2xl font-semibold">Update CRM Process</h2>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <GenericInputField name="name" label="Name" />
            <GenericInputField
              name="description"
              label="Description"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <GenericButton
              type="button"
              onClick={() => navigate({to: '/crm'})}
              className="mt-4 w-full md:w-auto"
            >
              Cancel
            </GenericButton>
            <GenericButton
              type="submit"
              disabled={isPending}
              className="mt-4 w-full md:w-auto"
            >
              {isPending ? 'Updating...' : 'Update CRM'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateCRM;
