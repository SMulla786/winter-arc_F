import React, {useMemo, useState, useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import {
  useGetExpense,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/lib/api/cateror/expense';
import {useAuthContext} from '@/context/AuthContext';
import {useGetAdditionalVendors} from '@/lib/react-query/queriesAndMutations/cateror/additionalVendor';
import {useNavigate} from '@tanstack/react-router';
import {FiArrowLeft} from 'react-icons/fi';

const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  particular: z.string().optional(),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  total: z.coerce.number().optional(),
});

type ExpenseFormType = z.infer<typeof expenseSchema>;

type ExpenseApiType = {
  additionalCategoryId: string;
  vendorName: string;
  additionalVendorId: string;
  particular: string;
  quantity: number;
  price: number;
  id: string;
  additionalCategory?: {name: string};
  additionalVendor?: {name: string};
};

const AddExpenseManagement: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.expenseMasterPage;
  const role = user?.role;
  const navigate = useNavigate();

  const {data: vendorData = []} = useGetAdditionalVendors();

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ExpenseApiType | null>(null);

  const defaultFormValues: ExpenseFormType = {
    categoryId: '',
    vendorId: '',
    particular: '',
    quantity: 0,
    price: 0,
    total: 0,
  };

  const methods = useForm<ExpenseFormType>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultFormValues,
  });

  const {handleSubmit, reset, control, watch, setValue} = methods;

  const selectedCategoryId = watch('categoryId');
  const quantity = watch('quantity');
  const price = watch('price');

  useEffect(() => {
    const total = (Number(quantity) || 0) * (Number(price) || 0);
    setValue('total', total, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [quantity, price, setValue]);

  // Reset vendorId when category changes
  useEffect(() => {
    if (!editData) {
      setValue('vendorId', '');
    }
  }, [selectedCategoryId, editData, setValue]);

  // Unique categories from all vendors
  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();

    vendorData.forEach((vendor) => {
      vendor.additionalVendorCatrgories?.forEach((item) => {
        const cat = item.additionalVendorCategory;
        if (cat?.id && cat?.name) {
          map.set(cat.id, cat.name);
        }
      });
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      label,
      value,
    }));
  }, [vendorData]);

  // Filtered vendors based on selected category
  const vendorOptions = useMemo(() => {
    if (!selectedCategoryId) {
      return vendorData.map((vendor) => ({
        label: vendor.name,
        value: vendor.id,
      }));
    }

    return vendorData
      .filter((vendor) =>
        vendor.additionalVendorCatrgories?.some(
          (item) => item.additionalVendorCategory?.id === selectedCategoryId,
        ),
      )
      .map((vendor) => ({
        label: vendor.name,
        value: vendor.id,
      }));
  }, [vendorData, selectedCategoryId]);

  // React Query hooks
  const {data: expenses = []} = useGetExpense();
  const {mutate: CreateExpense} = useCreateExpense();
  const {mutate: updateMutation} = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const onSubmit = (formData: ExpenseFormType) => {
    const payload = {
      additionalCategoryId: formData.categoryId,
      additionalVendorId: formData.vendorId,
      particular: formData.particular,
      quantity: Number(formData.quantity) || 0,
      price: Number(formData.price) || 0,
    };

    if (editData) {
      updateMutation(
        {id: editData.id, ...payload},
        {
          onSuccess: () => {
            setEditData(null);
            reset();
            setShowForm(false);
          },
        },
      );
    } else {
      CreateExpense(payload, {
        onSuccess: () => {
          reset();
          setShowForm(false);
        },
      });
    }
  };

  const handleEdit = (row: ExpenseApiType) => {
    setEditData(row);
    reset({
      categoryId: row.additionalCategoryId,
      vendorId: row.additionalVendorId,
      particular: row.particular,
      quantity: row.quantity,
      price: row.price,
      total: row.quantity * row.price,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const columns: Column<ExpenseApiType>[] = [
    {
      header: 'Category',
      accessor: 'additionalCategoryId',
      render: (row) => row.additionalCategory?.name ?? '-',
      minWidth: '150px',
    },
    {
      header: 'Vendor',
      accessor: 'additionalVendorId',
      render: (row) => row.additionalVendor?.name ?? '-',
      minWidth: '150px',
    },
    {
      header: 'Particular',
      accessor: 'particular',
      minWidth: '150px',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      minWidth: '100px',
      className: 'text-right',
    },
    {
      header: 'Price',
      accessor: 'price',
      minWidth: '100px',
      className: 'text-right',
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (row) => {
        const total = (Number(row.quantity) || 0) * (Number(row.price) || 0);
        return total.toLocaleString();
      },
      minWidth: '120px',
      className: 'text-right font-medium',
    },
  ];

  return (
    <div className="mx-auto px-2 py-4 sm:px-4 md:px-6">
      {/* Page Content */}
      {showForm ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-md dark:border-black dark:bg-black sm:p-6">
          {/* Responsive Header */}
          <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="items-right flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditData(null);
                  reset();
                }}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2"
                aria-label="Go back"
              >
                <FiArrowLeft className="h-5 w-5 font-bold" />
              </button>
              <h2 className="text-lg font-semibold dark:text-white sm:text-xl">
                {editData ? 'Edit Default Vendor' : 'Add Default Vendor'}
              </h2>
            </div>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              {/* Responsive Form Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {/* Category Dropdown - Full width on mobile */}
                <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
                  <GenericDropdown
                    name="categoryId"
                    label="Category"
                    options={categoryOptions}
                    placeholder="Select Category"
                    control={control}
                  />
                </div>

                {/* Vendor Dropdown - Full width on mobile */}
                <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
                  <GenericDropdown
                    name="vendorId"
                    label="Vendor"
                    options={vendorOptions}
                    placeholder={
                      !selectedCategoryId
                        ? 'First select a category'
                        : vendorOptions.length === 0
                          ? 'No vendors available'
                          : 'Select Vendor'
                    }
                    disabled={!selectedCategoryId}
                    control={control}
                  />
                </div>

                {/* Particular - Full width on mobile */}
                <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
                  <GenericInputField
                    name="particular"
                    label="Particular"
                    placeholder="e.g., Stationery"
                  />
                </div>

                {/* Quantity - Half width on mobile */}
                <div className="sm:col-span-1">
                  <GenericInputField
                    name="quantity"
                    label="Quantity"
                    placeholder="e.g., 10"
                    type="number"
                  />
                </div>

                {/* Price - Half width on mobile */}
                <div className="sm:col-span-1">
                  <GenericInputField
                    name="price"
                    label="Price"
                    placeholder="e.g., 100"
                    type="number"
                  />
                </div>

                {/* Total - Full width on mobile */}
                <div className="sm:col-span-2">
                  <GenericInputField
                    name="total"
                    label="Total"
                    placeholder="e.g., 1000"
                    type="number"
                    disabled
                  />
                </div>
              </div>

              {/* Responsive Button Container */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditData(null);
                    reset();
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg border px-4 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
                <GenericButton type="submit" className="w-full sm:w-auto">
                  {editData ? 'Update' : 'Save'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      ) : (
        <div className="relative">
          {/* Add Button - Responsive positioning */}
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <div className="mb-4 flex justify-end sm:absolute sm:right-0 sm:top-0 sm:mb-0 sm:block">
              <GenericButton
                className="w-full sm:w-auto"
                onClick={() => {
                  setShowForm(true);
                  reset(defaultFormValues);
                  setEditData(null);
                }}
              >
                <span className="sm:hidden">Add Default Vendor</span>
                <span className="hidden sm:inline">Add Default Vendor</span>
              </GenericButton>
            </div>
          )}

          {/* Table Container with Responsive Design */}
          <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-black dark:bg-black sm:mt-0">
            <div className="overflow-x-auto">
              <GenericTable
                title="Default Vendor"
                data={expenses || []}
                itemsPerPage={10}
                columns={columns}
                action={role === 'CATEROR' || restriction === 'EDIT'}
                onEdit={(item) => handleEdit(item)}
                onDelete={(item) => handleDelete(item.id)}
                showBackButton
                onBack={() =>
                  navigate({
                    to: '/vendormanagement',
                    search: {tab: 'additional'},
                  })
                }
                responsive
                mobileView={(item) => (
                  <div className="border-gray-200 dark:border-gray-700 border-b p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-medium dark:text-white">
                          {item.additionalCategory?.name || '-'}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Category
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Vendor:</span>
                          <span className="font-medium">
                            {item.additionalVendor?.name || '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Particular:</span>
                          <span>{item.particular || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Qty:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Price:</span>
                          <span>₹{item.price.toLocaleString()}</span>
                        </div>
                        <div className="border-gray-100 dark:border-gray-700 flex items-center justify-between border-t pt-2">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ₹
                            {(
                              (item.quantity || 0) * (item.price || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Empty State */}
          {expenses.length === 0 && (
            <div className="border-gray-300 dark:border-gray-600 mt-6 rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto max-w-md">
                <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
                  No Default Vendors Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                  Get started by adding your first default vendor. Click the
                  "Add Default Vendor" button above.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddExpenseManagement;
