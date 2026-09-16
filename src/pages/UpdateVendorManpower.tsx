/* eslint-disable */
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import React, {useEffect} from 'react';
import {useParams} from '@tanstack/react-router';
import {FormProvider, useForm, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {caterorId} from '@/lib/contants';
import {
  useGetVendorManpowerById,
  useUpdateVendorManpower,
  useGetAllVendorManpowerRole,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {useNavigate} from '@tanstack/react-router';
import {Plus, Minus} from 'lucide-react';

// Updated Zod schema to match add page
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

const UpdateVendorManpower = () => {
  const {id} = useParams({from: '/_app/updatevendor/$id'}) as {id: string};
  const navigate = useNavigate();

  const methods = useForm<FormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorName: '',
      mobile: '',
      address: '',
      roles: [{roleId: '', price: ''}],
    },
  });

  const {fields, append, remove} = useFieldArray({
    control: methods.control,
    name: 'roles',
  });

  const {
    mutate: updateVendorManpower,
    isSuccess,
    isPending,
  } = useUpdateVendorManpower();

  const {
    data: vendorData,
    isLoading,
    error,
  } = useGetVendorManpowerById(id || '');
  const {data: VendorRoleData} = useGetAllVendorManpowerRole();

  console.log('Vendor Data:', vendorData);

  // Prepare dropdown options
  const roleOptions =
    VendorRoleData?.map((role) => ({
      value: role.id,
      label: role.name,
    })) || [];

  const onSubmit = (formData: FormValues) => {
    if (!caterorId) {
      console.error('Cateror ID is missing');
      return;
    }

    // Transform data to match API structure
    const updateData = {
      name: formData.vendorName,
      phone: formData.mobile,
      address: formData.address,
      roles: formData.roles.map((roleItem) => ({
        roleId: roleItem.roleId,
        price: parseInt(roleItem.price),
      })),
    };

    updateVendorManpower({
      id,
      data: updateData,
    });
  };

  // Navigate only when the mutation is successful
  useEffect(() => {
    if (isSuccess) {
      navigate({
        to: '/manpowervendor',
      });
    }
  }, [isSuccess, navigate]);

  const onCancel = () => {
    navigate({
      to: '/manpowervendor',
    });
  };

  const addRoleField = () => {
    append({roleId: '', price: ''});
  };

  const removeRoleField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  useEffect(() => {
    if (!vendorData) return;
    const vendor = vendorData.data?.vendor || vendorData.vendor || vendorData;

    if (!vendor) {
      console.error('No vendor found in response:', vendorData);
      return;
    }

    console.log('Setting form data for vendor:', vendor);

    // Transform roles correctly
    const rolesData = Array.isArray(vendor.roles)
      ? vendor.roles.map((roleItem: any) => ({
          roleId: roleItem.id?.toString() || roleItem.id || '',
          price: roleItem.price?.toString() || '',
        }))
      : [];

    const finalRoles =
      rolesData.length > 0 ? rolesData : [{roleId: '', price: ''}];

    methods.reset({
      vendorName: vendor.name || '',
      mobile: vendor.phone || '',
      address: vendor.address || '',
      roles: finalRoles,
    });
  }, [vendorData, methods]);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="bg-white p-8 dark:bg-black">
        <div className="flex items-center justify-center">
          <p>Loading vendor data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="bg-white p-8 dark:bg-black">
        <div className="flex items-center justify-center">
          <p className="text-red-500">
            Error loading vendor data: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 dark:bg-black">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <h1 className="text-lg font-semibold">Update Vendor Details</h1>

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
                type="text"
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

          <div className="flex justify-end space-x-4 pt-4">
            <GenericButton
              type="button"
              onClick={onCancel}
              className="w-full md:w-auto"
              disabled={isPending}
            >
              Cancel
            </GenericButton>
            <GenericButton
              type="submit"
              className="w-full md:w-auto"
              disabled={isPending}
            >
              {isPending ? 'Updating...' : 'Update Vendor'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateVendorManpower;
