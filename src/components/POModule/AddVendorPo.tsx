import React, {useState, useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {
  useCreateVendors,
  useDeleteVendors,
  useGetVendorsPo,
  useUpdateVendors,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetRawMaterialCategoriesCat} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import CustomMultiSelectDropdown from '../Forms/SearchDropDown/CustomMultiSelectDropdown';
import toast from 'react-hot-toast';

// Zod validation schema
const vendorposchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
});

type VendorFormType = z.infer<typeof vendorposchema>;

type VendorApiType = {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  caterorId: string;
  rawMaterialVendorRoles: Array<{
    id: string;
    rawMaterialVendorId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      languageId: string;
      caterorId: string;
    };
  }>;
};

type OptionType = {
  label: string;
  value: string;
};

const AddVendorPo: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawmaterialvendorpage;
  const role = user?.role;

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<VendorApiType | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const methods = useForm<VendorFormType>({
    resolver: zodResolver(vendorposchema),
    defaultValues: {
      vendorName: '',
      phone: '',
      address: '',
      categories: [],
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: {errors},
  } = methods;

  // React Query hooks
  const {
    data: vendorsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetVendorsPo();
  const {data: categories} = useGetRawMaterialCategoriesCat();

  const mappedCategories: OptionType[] =
    categories?.data?.map((category: {name: string; id: string}) => ({
      label: category.name,
      value: category.id,
    })) || [];

  // Ensure vendors is an array
  const vendors: VendorApiType[] = Array.isArray(vendorsResponse)
    ? vendorsResponse
    : vendorsResponse?.data && Array.isArray(vendorsResponse.data)
      ? vendorsResponse.data
      : [];

  const createMutation = useCreateVendors();
  const updateMutation = useUpdateVendors();
  const deleteMutation = useDeleteVendors();

  // Handle category selection change
  const handleCategoryChange = (selectedValues: string[]) => {
    setSelectedCategories(selectedValues);
    setValue('categories', selectedValues, {shouldValidate: true});
  };

  // Reset form when editData changes
  useEffect(() => {
    if (editData) {
      setValue('vendorName', editData.name);
      setValue('phone', editData.phone);
      setValue('address', editData.address);

      // Extract category IDs from rawMaterialVendorRoles - using categoryId now
      const categoryIds = editData.rawMaterialVendorRoles.map(
        (role) => role.categoryId,
      );
      setSelectedCategories(categoryIds);
      setValue('categories', categoryIds);
    } else {
      reset();
      setSelectedCategories([]);
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (formData: VendorFormType) => {
    const payload = {
      name: formData.vendorName,
      phone: formData.phone,
      address: formData.address,
      categories: formData.categories,
    };

    try {
      if (editData) {
        await updateMutation.mutateAsync(
          {id: editData.id, ...payload},
          {
            onSuccess: () => {
              handleCancel();
              refetch();
            },
          },
        );
      } else {
        await createMutation.mutateAsync(payload, {
          onSuccess: () => {
            handleCancel();
            refetch();
          },
        });
      }
    } catch (error) {
      toast.error(
        error.message || `Failed to ${editData ? 'update' : 'create'} vendor`,
      );
    }
  };

  const handleEdit = (row: VendorApiType) => {
    setEditData(row);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteMutation.mutateAsync(id, {
          onSuccess: () => {
            refetch();
          },
        });
      } catch (error) {
        toast.error(error.message || 'Failed to delete vendor');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditData(null);
    reset();
    setSelectedCategories([]);
  };

  // Enhanced columns to show categories from rawMaterialVendorRoles
  const columns: Column<VendorApiType>[] = [
    {header: 'Vendor Name', accessor: 'name'},
    {header: 'Phone', accessor: 'phone'},
    {header: 'Address', accessor: 'address'},
    {
      header: 'Categories',
      accessor: (row) => {
        if (
          row.rawMaterialVendorRoles &&
          row.rawMaterialVendorRoles.length > 0
        ) {
          return row.rawMaterialVendorRoles
            .map((role) => role.category?.name || 'Unknown Category')
            .join(', ');
        }
        return 'No categories';
      },
      render: (row) => {
        if (
          row.rawMaterialVendorRoles &&
          row.rawMaterialVendorRoles.length > 0
        ) {
          return (
            <div>
              {row.rawMaterialVendorRoles.map((role, index) => (
                <span key={role.id}>
                  {role.category?.name || 'Unknown Category'}
                  {index < row.rawMaterialVendorRoles.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          );
        }
        return 'No categories';
      },
    },
  ];

  return (
    <div className="mx-auto">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-between">
          {showForm ? (
            <button
              className="dark:text-gray-200 px-4 py-2 text-xl font-bold transition"
              onClick={handleCancel}
            >
              ← Back
            </button>
          ) : (
            <div></div>
          )}

          {!showForm && (
            <GenericButton onClick={() => setShowForm(true)}>
              Add Raw Material Vendor
            </GenericButton>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? (
        <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
          <h2 className="mb-6 text-2xl font-semibold text-form-strokedark dark:text-white">
            {editData ? 'Edit Raw Material Vendor' : 'Add Raw Material Vendor'}
          </h2>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <GenericInputField
                name="vendorName"
                label="Vendor Name"
                placeholder="Enter Vendor Name"
              />

              <GenericInputField
                name="phone"
                label="Phone"
                placeholder="Enter Phone"
              />

              <GenericInputField
                name="address"
                label="Address"
                placeholder="Enter Address"
              />
              <CustomMultiSelectDropdown
                name="categories"
                label="Categories"
                options={mappedCategories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                error={errors.categories?.message}
                placeholder="Select categories..."
              />
              {errors.categories && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categories.message}
                </p>
              )}

              <div className="flex justify-end md:col-span-2">
                <GenericButton
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editData
                      ? 'Update Vendor'
                      : 'Save Vendor'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="text-center">Loading vendors...</div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Error loading vendors
            </div>
          ) : (
            <GenericTable
              title="Vendor List"
              data={vendors}
              itemsPerPage={15}
              columns={columns}
              action={role === 'CATEROR' || restriction === 'EDIT'}
              onEdit={(item) => handleEdit(item)}
              onDelete={(item) => handleDelete(item.id)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AddVendorPo;
