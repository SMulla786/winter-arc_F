import React, {useEffect, useRef} from 'react';
import {
  useAddCaterorCRM,
  useDeleteCRM,
  useGetCRMData,
  useUpdateCRM,
} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {crmSchema} from '@/lib/validation/crmSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {CRMCreate} from '@/types/cateror';
import {useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext';

interface CRMData {
  id: string;
  name: string;
  description?: string;
}

type FormValues = z.infer<typeof crmSchema>;

const AddCustomerCRM = () => {
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    resolver: zodResolver(crmSchema),
  });

  const {mutate: addCaterorCRM, isSuccess} = useAddCaterorCRM();
  const {data: apiResponse} = useGetCRMData(); // <-- raw API response
  const {mutate: deleteCRM} = useDeleteCRM();
  const {mutate: updateCRM} = useUpdateCRM();

  // Extract the array that GenericTable expects
  const CRMData: CRMData[] | undefined = apiResponse?.data;

  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.crmprocesspage;
  const role = user?.role;

  const onSubmit = (data: FormValues) => {
    // Only include description if it's provided and not empty
    const payload: CRMCreate = {
      name: data.name,
    };
    if (data.description && data.description.trim() !== '') {
      payload.description = data.description;
    }
    addCaterorCRM(payload);
    methods.reset();
  };

  // ---------- TABLE COLUMNS ----------
  const columns: Column<CRMData>[] = [
    // {header: 'ID', accessor: 'id'},
    {header: 'Name', accessor: 'name'},
    {header: 'Description', accessor: 'description'},
    // {
    //   header: 'Created At',
    //   accessor: (row) => new Date(row.createdAt).toLocaleString(),
    // },
  ];

  const handleDelete = (items: CRMData) => {
    deleteCRM(items.id);
  };

  const handleEdit = (items: CRMData) => {
    navigate({
      to: `/updatecrm/${items.id}`,
    });
  };

  return (
    <>
      <div>
        <button
          className="text-gray-300 text-lg font-bold"
          onClick={() => navigate({to: `/eventcrm`})}
        >
          {' '}
          ← Back
        </button>
      </div>
      <div className="bg-white p-8 dark:bg-black">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <GenericInputField name="name" label="Name" />
              <GenericInputField name="description" label="Description" />
            </div>

            <div className="mt-4 flex justify-end">
              {restriction === 'VIEW' || restriction === 'EDIT' ? null : (
                <GenericButton type="submit">Submit</GenericButton>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
      <div className="mt-8 overflow-x-auto">
        <GenericTable
          data={CRMData ?? []}
          columns={columns}
          action
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </>
  );
};

export default AddCustomerCRM;
