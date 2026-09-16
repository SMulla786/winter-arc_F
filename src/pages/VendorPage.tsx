/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import {FormProvider, useForm, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useAddVendorManpower,
  useGetVendorManpower,
  useDeleteVendorManpower,
  useGetAllVendorManpowerRole,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext';
import {Plus, Minus} from 'lucide-react';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';

// Updated Zod schema to include roles array
const vendorSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number format'),
  address: z.string(),
  roles: z
    .array(
      z.object({
        roleId: z.string().min(1, 'Role is required'),
        price: z
          .string()
          .min(1, 'Price is required')
          .regex(/^\d+$/, 'Price must be a number'),
      }),
    )
    .min(1, 'At least one role is required'),
});

type FormValues = z.infer<typeof vendorSchema>;

const VendorPage: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.vendorPage;
  const role = user?.role;

  const {mutate: addVendorManpower, isSuccess} = useAddVendorManpower();
  const {mutate: deleteVendorManpower} = useDeleteVendorManpower();
  const {data: vendorManpowerData, refetch} = useGetVendorManpower();
  const {data: VendorRoleData} = useGetAllVendorManpowerRole();

  console.log('VendorRoleData', VendorRoleData);
  console.log('VendorRoleData data array', VendorRoleData?.data);

  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorName: '',
      mobile: '',
      address: '',
      roles: [{roleId: '', price: ''}], // Initialize with one role
    },
  });

  const {fields, append, remove} = useFieldArray({
    control: methods.control,
    name: 'roles',
  });

  const navigate = useNavigate();

  // Prepare dropdown options
  const roleOptions =
    VendorRoleData?.map((role) => ({
      value: role.id,
      label: role.name,
    })) || [];

  console.log('Role options:', roleOptions);

  const onSubmit = (data: FormValues) => {
    // Transform the data to match your API structure
    const vendorData = {
      name: data.vendorName,
      phone: data.mobile,
      address: data.address,
      roles: data.roles.map((roleItem) => ({
        roleId: roleItem.roleId,
        price: parseInt(roleItem.price),
      })),
    };

    console.log('Submitting vendor data:', vendorData);

    addVendorManpower(vendorData, {
      onSuccess: () => {
        methods.reset();
        setShowForm(false);
        // Optionally refetch vendor data
        refetch();
      },
    });
  };

  const handleDelete = (item: (typeof vendorManpowerData)[number]) => {
    deleteVendorManpower(item.id);
  };

  const handleEdit = (item: (typeof vendorManpowerData)[number]) => {
    navigate({to: `/updatevendor/${item.id}`});
  };

  const addRoleField = () => {
    append({roleId: '', price: ''});
  };

  const removeRoleField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const columns: Column<(typeof vendorManpowerData)[number]>[] = [
    {
      header: 'Vendor Name',
      accessor: 'name',
      sortable: true,
      render: (row: any) => (
        <span
          className="cursor-pointer text-blue-600"
          onClick={() => {
            if (role === 'CATEROR' || restriction === 'EDIT') {
              navigate({to: `/menpowervendor/${row.id}`});
            }
          }}
        >
          {row.name}
        </span>
      ),
    },
    {header: 'Phone Number', accessor: 'phone', sortable: true},
    {header: 'Address', accessor: 'address', sortable: true},
    {
      header: 'Roles',
      accessor: 'roles',
      sortable: false,
      render: (row: any) => (
        <div className="max-w-xs">
          {row.roles && row.roles.length > 0 ? (
            <div className="space-y-1">
              {row.roles.map((roleItem: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-700 font-medium">
                    {roleItem.role?.name || 'Unknown Role'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No roles</span>
          )}
        </div>
      ),
    },
    {
      header: 'Prices',
      accessor: 'roles',
      sortable: false,
      render: (row: any) => (
        <div className="max-w-xs">
          {row.roles && row.roles.length > 0 ? (
            <div className="space-y-1">
              {row.roles.map((roleItem: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-500 font-semibold">
                    ₹{roleItem.price}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">-</span>
          )}
        </div>
      ),
    },
    // {
    //   header: 'Total Roles',
    //   accessor: 'roles',
    //   sortable: true,
    //   render: (row: any) => (
    //     <span className="font-medium text-center block">
    //       {row.roles ? row.roles.length : 0}
    //     </span>
    //   ),
    // },
  ];
  useEffect(() => {
    const handler = () => setShowForm(true);
    window.addEventListener('ADD_VENDOR', handler);
    return () => window.removeEventListener('ADD_VENDOR', handler);
  }, []);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-between">
          {/* Left side: Back button */}
          <div>
            {showForm && (
              <button
                className="text-xl font-bold"
                onClick={() => setShowForm(false)}
              >
                ← Back
              </button>
            )}
          </div>

          {/* Right side: Add button */}
          {/* <div>
            {!showForm && (
              <GenericButton onClick={() => setShowForm(true)}>
                Add Vendor
              </GenericButton>
            )}
          </div> */}
        </div>
      )}

      {/* Form */}
      {showForm && (role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="rounded-md bg-white p-6 shadow dark:bg-black">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold">Vendor Details</h2>

              {/* Basic Vendor Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="vendorName"
                    label="Vendor Name"
                    placeholder="Enter Vendor name"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="mobile"
                    label="Mobile Number"
                    placeholder="Enter Mobile Number"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="address"
                    label="Address"
                    placeholder="Enter Address"
                  />
                </div>
              </div>

              {/* Roles Section */}
              <div className="border-t pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Roles & Pricing</h3>
                  {roleOptions.length === 0 && (
                    <p className="text-sm text-yellow-600">Loading roles...</p>
                  )}
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="mb-4 grid grid-cols-1 items-end gap-4 md:grid-cols-12 md:gap-6"
                  >
                    <div className="col-span-12 md:col-span-5">
                      <GenericDropdown
                        name={`roles.${index}.roleId`}
                        label={`Role`}
                        placeholder="Select Role"
                        options={roleOptions}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-5">
                      <GenericInputField
                        name={`roles.${index}.price`}
                        label="Price"
                        placeholder="Enter Price"
                        type="number"
                      />
                    </div>
                    <div className="col-span-12 flex items-center gap-2 pb-1 md:col-span-2">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoleField(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove Role"
                        >
                          <Minus size={20} />
                        </button>
                      )}
                      {index === fields.length - 1 && (
                        <button
                          type="button"
                          onClick={addRoleField}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Add Role"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <GenericButton
                  type="submit"
                  disabled={roleOptions.length === 0}
                >
                  Save Vendor
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      {/* Table */}
      {!showForm && (
        <div className="mt-12">
          <GenericTable
            title="Vendor List"
            itemsPerPage={15}
            columns={columns}
            data={vendorManpowerData || []}
            action={role === 'CATEROR' || restriction === 'EDIT'}
            onDelete={handleDelete}
            onEdit={handleEdit}
            // onView={(vendor) => {
            //   navigate({to: `/manpowervendorhistoryshow/${vendor.id}`});
            // }}
          />
        </div>
      )}
    </div>
  );
};

export default VendorPage;
