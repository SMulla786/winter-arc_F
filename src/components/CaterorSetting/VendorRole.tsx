/*eslint-disable */
import React, {useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTable from '../Forms/Table/GenericTable';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  useAddVendorManpowerRole,
  useDeleteVendorManpowerRole,
  useGetAllVendorManpowerRole,
  useGetVendorManpowerRole,
  useUpdateVendorManpowerRole,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {useAuthContext} from '@/context/AuthContext';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';

const vendorSchema = z.object({
  role: z.string().min(1, 'Role name is required'),
  price: z.coerce.number().min(1, 'Price is required'),
  roleType: z.enum(['SERVICE', 'KITCHEN'], {
    required_error: 'Role is required.',
  }),
});

const columns = [
  {header: 'Role', accessor: 'name', sortable: true},
  {header: 'Price', accessor: 'price', sortable: true},
  {header: 'Type', accessor: 'roleType', sortable: true},
];

type FormValues = z.infer<typeof vendorSchema>;

const VendorRole: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(vendorSchema),
  });
  const {handleSubmit, reset} = methods;

  const {user} = useAuthContext();
  const id = user?.caterorId;

  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState<string>('');
  const {mutate: addVendorRole, isSuccess} = useAddVendorManpowerRole();
  const {data: VendorRoleData} = useGetAllVendorManpowerRole();
  const {mutate: DeleteRole} = useDeleteVendorManpowerRole();
  const {mutate: updateRole} = useUpdateVendorManpowerRole();

  const handleEdit = (item: any) => {
    setEditRole(item.id);
    setShowForm(true);
    reset({
      role: item.name,
      price: Number(item.price),
      roleType: item.roleType,
    });
  };

  const handleDelete = (item: any) => {
    DeleteRole(item.id);
  };

  const onSubmit = (data: any) => {
    if (editRole) {
      updateRole({
        id: editRole,
        name: data.role,
        price: Number(data.price),
        roleType: data.roleType,
      });
      setEditRole('');
    } else {
      addVendorRole({
        name: data.role,
        price: Number(data.price),
        roleType: data.roleType,
      });
    }
    reset({role: '', price: 0, roleType: ''});
    setShowForm(false);
  };
  useEffect(() => {
    const handler = () => setShowForm(true);
    window.addEventListener('ADD_ROLE', handler);
    return () => window.removeEventListener('ADD_ROLE', handler);
  }, []);

  return (
    <div className="mx-auto">
      {/* Action Buttons: Back left, Add right */}
      <div className="mb-4 flex items-center justify-between">
        {/* Back button on left */}
        <div className="flex items-center">
          {showForm && (
            <button
              className="text-xl font-bold"
              onClick={() => {
                setShowForm(false);
                setEditRole('');
                reset({role: '', price: 0});
              }}
            >
              ← Back
            </button>
          )}
        </div>

        {/* Add Role button on right */}
        {/* <div className="flex items-center">
          {!showForm && (
            <GenericButton onClick={() => setShowForm(true)}>
              Add Role
            </GenericButton>
          )}
        </div> */}
      </div>

      {/* Form: only show when showForm is true */}
      {showForm && (
        <div className="mb-4 border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <GenericInputField
                name="role"
                label="Role Name"
                placeholder="e.g., Stationery"
              />
              <GenericInputField
                name="price"
                label="Price"
                placeholder="Enter a price"
              />
              <GenericSearchDropdown
                name="roleType"
                label="Type"
                options={[
                  {
                    label: 'Service',
                    value: 'SERVICE',
                  },
                  {
                    label: 'Kitchen',
                    value: 'KITCHEN',
                  },
                ]}
              />
              <div className="flex justify-end md:col-span-2">
                <GenericButton type="submit">
                  {editRole ? 'Update' : 'Save'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      {/* Table: hide when showForm is true */}
      {!showForm && (
        <div>
          <GenericTable
            data={VendorRoleData || []}
            columns={columns}
            itemsPerPage={15}
            action
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default VendorRole;
