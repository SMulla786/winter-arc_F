import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useNavigate, useMatch} from '@tanstack/react-router';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useGetManageServicePostById,
  useUpdateManageServicePost,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {servicePostSchema} from '@/lib/validation/managerpostSchema';

// Type for form values
type FormValues = z.infer<typeof servicePostSchema>;

const UpdateServicePage = () => {
  // ✅ Get ID from route params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {params} = useMatch('/_app/updateservice/$id' as any);
  const {id = ''} = params as {id: string};

  const navigate = useNavigate();

  // ✅ API hooks
  const {data: serviceData, isLoading} = useGetManageServicePostById(id);
  const {mutate: updateServicePost, isPending} = useUpdateManageServicePost();

  // ✅ Initialize form
  const methods = useForm<FormValues>({
    resolver: zodResolver(servicePostSchema),
    defaultValues: {
      name: '',
      price: '',
    },
  });

  // ✅ Set default values when data is fetched
  useEffect(() => {
    if (serviceData?.data) {
      methods.reset({
        name: serviceData.data.name || '',
        price: String(serviceData.data.price || ''),
      });
    }
  }, [serviceData, methods]);

  // ✅ Submit handler
  const onSubmit = (data: FormValues) => {
    updateServicePost(
      {
        id,
        name: data.name,
        price: Number(data.price),
      },
      {
        onSuccess: () => {
          navigate({to: '/servicepage'}); // navigate back to list page
        },
      },
    );
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="bg-white p-8 dark:bg-black">
      <h2 className="text-gray-800 mb-6 text-xl font-semibold dark:text-white">
        Update Service
      </h2>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <GenericInputField name="name" label="Service Name" />
            <GenericInputField name="price" label="Price" type="number" />
          </div>

          <div className="flex justify-end">
            <GenericButton
              type="submit"
              className="mt-6 items-end"
              disabled={isPending}
            >
              {isPending ? 'Updating...' : 'Update'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateServicePage;
