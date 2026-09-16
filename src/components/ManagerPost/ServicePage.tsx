import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useNavigate} from '@tanstack/react-router';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {
  useCreateManageServicePost,
  useDeleteManageServicePost,
  useGetManageServicePost,
  useUpdateManageServicePost,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {servicePostSchema} from '@/lib/validation/managerpostSchema';

interface ServicePostData {
  id: string;
  name: string;
  price: number;
}

type FormValues = z.infer<typeof servicePostSchema>;

const ServicePage = () => {
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    resolver: zodResolver(servicePostSchema),
  });

  const {mutate: addCaterorCRM} = useCreateManageServicePost();
  const {data: servicePost} = useGetManageServicePost();
  console.log('====================================');
  console.log('servicePost', servicePost);
  console.log('====================================');
  const {mutate: deleteCRM} = useDeleteManageServicePost();
  const {mutate: updateCRM} = useUpdateManageServicePost();

  const onSubmit = (data: FormValues) => {
    addCaterorCRM({
      name: data.name,
      price: Number(data.price),
    });
    methods.reset();
  };

  // ---------- TABLE COLUMNS ----------
  const columns: Column<ServicePostData>[] = [
    {header: 'Name', accessor: 'name'},
    {header: 'Price', accessor: 'price'},
  ];

  // ---------- DELETE HANDLER ----------
  const handleDelete = (item: ServicePostData) => {
    deleteCRM(item.id);
  };

  // ---------- EDIT HANDLER ----------
  const handleEdit = (item: ServicePostData) => {
    navigate({
      to: `/updateservice/${item.id}`,
    });
  };

  return (
    <>
      <div className="bg-white p-8 dark:bg-black">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <GenericInputField name="name" label="Name" />
              <GenericInputField name="price" label="Price" />
            </div>
            <div className="flex justify-end">
              <GenericButton type="submit" className="mt-4 items-end">
                Submit
              </GenericButton>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* ---------- TABLE SECTION ---------- */}
      <div className="mt-8 overflow-x-auto">
        <GenericTable
          data={servicePost?.data ?? []}
          columns={columns}
          action
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </>
  );
};

export default ServicePage;
