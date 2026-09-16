/* eslint-disable */
import React, {useState, useMemo, useRef, useEffect} from 'react';
import {FormProvider, useForm, useWatch} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useVendorMutations,
  useGetAdditionalVendors,
  CategoryRow,
  useGetAdditionalCats,
} from '@/lib/react-query/queriesAndMutations/additionalvendor/additionalvendormutation';
import toast from 'react-hot-toast';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiX,
  FiEye,
} from 'react-icons/fi';
import {useNavigate} from '@tanstack/react-router';

// Validation schema
export const additionalVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
});

export type VendorFormValues = z.infer<typeof additionalVendorSchema>;

type VendorRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  categories: string[];
  categoryNames?: string[];
};

interface AdditionalVendorProps {
  onVendorAdded?: () => void;
}

const AdditionalVendors: React.FC<AdditionalVendorProps> = ({
  onVendorAdded,
}) => {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    address: '',
    categories: [] as string[],
  });

  const navigate = useNavigate();

  const vendorMethods = useForm<VendorFormValues>({
    resolver: zodResolver(additionalVendorSchema),
    defaultValues: {name: '', phone: '', address: '', categories: []},
  });

  const {
    createVendor,
    updateVendor,
    deleteVendor,
    isPending: vendorLoading,
    isSuccess,
  } = useVendorMutations();

  const {data: categoriesData = [], isLoading: categoriesLoading} =
    useGetAdditionalCats();

  const {
    data: vendorsData = [],
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useGetAdditionalVendors();

  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<VendorRow> | null>(
    null,
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editDropdownOpen, setEditDropdownOpen] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // FIXED: Corrected typo: additionalVendorCatrgories → additionalVendorCategories
  const transformedVendors = useMemo(() => {
    if (!vendorsData || !Array.isArray(vendorsData)) return [];

    return vendorsData.map((vendor: any) => {
      // Handle both correct and typo'd field names (backward compatibility)
      const additionalCategories =
        vendor.additionalVendorCategories ||
        vendor.additionalVendorCatrgories || // fallback for typo
        [];

      const categories = additionalCategories
        .map((item: any) => item.additionalVendorCategory?.id)
        .filter(Boolean);

      const categoryNames = additionalCategories
        .map((item: any) => item.additionalVendorCategory?.name)
        .filter(Boolean);

      return {
        id: vendor.id,
        name: vendor.name || 'No Name',
        phone: vendor.phone || 'No Phone',
        address: vendor.address || 'No Address',
        categories,
        categoryNames,
      };
    });
  }, [vendorsData]);

  // Auto-save draft (NO infinite loop)
  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     isFirstRender.current = false;
  //     return;
  //   }
  //   setDraft(values);
  // }, [values, setDraft]);

  // Clear draft on submit success

  // Submit new vendor - REMOVED duplicate success toast
  const onVendorSubmit = async () => {
    if (
      !formState.name ||
      !formState.phone ||
      formState.categories.length === 0
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createVendor.mutateAsync({
        name: formState.name,
        phone: formState.phone,
        address: formState.address,
        categories: formState.categories,
      });

      // Success toast is now handled in the mutation's onSuccess callback
      resetForm();
      setIsAddingNew(false);
      refetchVendors();
      onVendorAdded?.();
    } catch (error: any) {
      // Error toast is handled in the mutation's onError callback
      console.error('Vendor creation error:', error);
    }
  };

  const resetForm = () => {
    setFormState({name: '', phone: '', address: '', categories: []});
    vendorMethods.reset();
  };

  const handleSaveVendorEdit = async (id: string) => {
    if (!editFormData) return;

    try {
      await updateVendor.mutateAsync({id, ...editFormData} as any);
      // Success toast is handled in the mutation's onSuccess callback
      cancelEdit();
      refetchVendors();
    } catch (error: any) {
      // Error toast is handled in the mutation's onError callback
      console.error('Vendor update error:', error);
    }
  };

  const handleDeleteVendor = async (vendor: VendorRow) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      await deleteVendor.mutateAsync(vendor.id);
      // Success toast is handled in the mutation's onSuccess callback
      refetchVendors();
    } catch (error: any) {
      // Error toast is handled in the mutation's onError callback
      console.error('Vendor deletion error:', error);
    }
  };

  const handleEditVendor = (vendor: VendorRow) => {
    setEditingVendor(vendor.id);
    setEditFormData({
      name: vendor.name,
      phone: vendor.phone,
      address: vendor.address,
      categories: vendor.categories || [],
    });
  };

  const cancelEdit = () => {
    setEditingVendor(null);
    setEditFormData(null);
    setOpenDropdown(null);
    setEditDropdownOpen(null);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditFormData((prev) => (prev ? {...prev, [field]: value} : null));
  };

  const toggleEditCategory = (categoryId: string) => {
    if (!editFormData) return;
    const current = editFormData.categories || [];
    const updated = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];
    handleEditChange('categories', updated);
  };

  const toggleNewCategory = (categoryId: string) => {
    const updated = formState.categories.includes(categoryId)
      ? formState.categories.filter((c) => c !== categoryId)
      : [...formState.categories, categoryId];

    setFormState((prev) => ({...prev, categories: updated}));
    vendorMethods.setValue('categories', updated, {shouldValidate: true});
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const toggleEditDropdown = (id: string) => {
    setEditDropdownOpen((prev) => (prev === id ? null : id));
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    resetForm();
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormState((prev) => ({...prev, [field]: value}));
    vendorMethods.setValue(field as any, value, {shouldValidate: true});
  };

  // Category Dropdown Component - FIXED: Now uses fixed positioning
  const CategoryDropdown = ({
    selectedCategories,
    onCategoryToggle,
    dropdownId,
    isEditMode = false,
  }: {
    selectedCategories: string[];
    onCategoryToggle: (id: string) => void;
    dropdownId: string;
    isEditMode?: boolean;
  }) => {
    const [position, setPosition] = useState({top: 0, left: 0, width: 0});
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const isOpen = isEditMode
      ? editDropdownOpen === dropdownId
      : openDropdown === dropdownId;
    const toggleFn = isEditMode ? toggleEditDropdown : toggleDropdown;

    const getSelectedCategoryNames = () => {
      if (selectedCategories.length === 0) return 'Select categories';
      const names = selectedCategories
        .map(
          (id) =>
            categoriesData.find((cat: CategoryRow) => cat.id === id)?.name ||
            'Unknown',
        )
        .filter(Boolean);
      return names.length <= 2
        ? names.join(', ')
        : `${names.length} categories selected`;
    };

    // Calculate position when dropdown opens
    React.useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => toggleFn(dropdownId)}
          className="flex w-full items-center justify-between rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
        >
          <span className="truncate">{getSelectedCategoryNames()}</span>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {/* FIXED: Dropdown positioned relative to viewport */}
        {isOpen && (
          <div
            className="fixed z-[9999] max-h-60 overflow-y-auto rounded-md border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              minWidth: '200px', // Ensure minimum width
            }}
          >
            {categoriesData.length === 0 ? (
              <div className="text-gray-500 px-3 py-2 text-sm">
                No categories available
              </div>
            ) : (
              categoriesData.map((cat: CategoryRow) => (
                <label
                  key={cat.id}
                  className="hover:bg-gray-100 flex cursor-pointer items-center px-3 py-2 dark:hover:bg-meta-4"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => onCategoryToggle(cat.id)}
                    className="border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      selectedCategories.includes(cat.id)
                        ? 'font-medium text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {cat.name}
                    {selectedCategories.includes(cat.id) && (
                      <span className="ml-1 text-blue-500">✓</span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Selected Categories Pills
  const SelectedCategoriesDisplay = ({
    categoryNames,
  }: {
    categoryNames: string[];
  }) => {
    if (!categoryNames?.length)
      return <span className="text-gray-400 text-sm">None</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {categoryNames.slice(0, 3).map((name, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
          >
            {name}
          </span>
        ))}
        {categoryNames.length > 3 && (
          <span className="bg-gray-100 text-gray-600 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
            +{categoryNames.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-2 pb-2 pt-2 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6 sm:pt-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-gray-900 text-lg font-bold dark:text-white sm:text-xl">
            Additional Vendors
          </h2>
        </div>

        <div className="flex flex-row gap-3">
          {!isAddingNew && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <FiPlus className="text-sm" />
              Add New Vendor
            </button>
          )}

          <button
            onClick={() => navigate({to: '/additionalvendorcat'})}
            className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FiPlus className="text-sm" />
            Add New Category
          </button>
          <button
            onClick={() => {
              navigate({to: '/expensemaster'});
            }}
            className="flex items-center gap-2 rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <FiPlus className="text-sm" />
            Add Default Vendor
          </button>
        </div>
        {/* )} */}
      </div>

      {/* Errors */}
      {vendorsError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            Failed to load vendors: {vendorsError.message}
          </p>
        </div>
      )}

      <FormProvider {...vendorMethods}>
        <div className="relative overflow-hidden rounded-sm border border-stroke dark:border-strokedark">
          {/* Add New Vendor Banner */}
          {isAddingNew && (
            <div className="flex items-center justify-between bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <div className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Adding New Vendor</span>
                <span className="ml-2 text-sm">
                  - Fill in the details below
                </span>
              </div>
              <button
                onClick={handleCancelAdd}
                className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                <FiX className="text-sm" />
                Cancel
              </button>
            </div>
          )}

          {/* Mobile Horizontal Scroll Container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] px-4 py-3 font-medium text-black dark:text-white sm:min-w-[180px]">
                    Vendor Name
                  </th>
                  <th className="min-w-[120px] px-4 py-3 font-medium text-black dark:text-white sm:min-w-[140px]">
                    Phone
                  </th>
                  <th className="min-w-[150px] px-4 py-3 font-medium text-black dark:text-white sm:min-w-[200px]">
                    Address
                  </th>
                  <th className="min-w-[180px] px-4 py-3 font-medium text-black dark:text-white sm:min-w-[220px]">
                    Categories
                  </th>
                  <th className="min-w-[100px] px-4 py-3 font-medium text-black dark:text-white sm:min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Add New Row */}
                {isAddingNew && (
                  <tr className="border-b border-stroke bg-blue-50/50 dark:border-strokedark dark:bg-blue-900/20">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formState.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="Vendor name"
                      />
                      {vendorMethods.formState.errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {vendorMethods.formState.errors.name.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formState.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="Phone number"
                      />
                      {vendorMethods.formState.errors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {vendorMethods.formState.errors.phone.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formState.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="Address"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <CategoryDropdown
                        selectedCategories={formState.categories}
                        onCategoryToggle={toggleNewCategory}
                        dropdownId="new-vendor"
                      />
                      {vendorMethods.formState.errors.categories && (
                        <p className="mt-1 text-xs text-red-500">
                          {vendorMethods.formState.errors.categories.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={onVendorSubmit}
                        disabled={vendorLoading}
                        className="rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
                      >
                        {vendorLoading ? 'Adding...' : 'Add'}
                      </button>
                    </td>
                  </tr>
                )}

                {/* Existing Vendors */}
                {transformedVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-gray-50 border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4/50"
                  >
                    <td className="px-4 py-3 text-sm">
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={editFormData?.name || ''}
                          onChange={(e) =>
                            handleEditChange('name', e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      ) : (
                        <span
                          className="cursor-pointer font-medium text-blue-700 dark:text-white"
                          onClick={() =>
                            navigate({
                              to: `/additionalvendorhistory/${vendor.id}`,
                            })
                          }
                        >
                          {vendor.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={editFormData?.phone || ''}
                          onChange={(e) =>
                            handleEditChange('phone', e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {vendor.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={editFormData?.address || ''}
                          onChange={(e) =>
                            handleEditChange('address', e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {vendor.address || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingVendor === vendor.id ? (
                        <CategoryDropdown
                          selectedCategories={editFormData?.categories || []}
                          onCategoryToggle={toggleEditCategory}
                          dropdownId={`edit-${vendor.id}`}
                          isEditMode
                        />
                      ) : (
                        <SelectedCategoriesDisplay
                          categoryNames={vendor.categoryNames || []}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingVendor === vendor.id ? (
                          <>
                            <button
                              onClick={() => handleSaveVendorEdit(vendor.id)}
                              disabled={vendorLoading}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                              title="Save"
                            >
                              <FiSave className="text-sm sm:text-base" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Cancel"
                            >
                              <FiX className="text-sm sm:text-base" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                navigate({
                                  to: `/additionalvendorhistoryshow/${vendor.id}`,
                                })
                              }
                              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                              title="view history"
                            >
                              <FiEye className="text-sm sm:text-base" />
                            </button>
                            <button
                              onClick={() => handleEditVendor(vendor)}
                              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                              title="Edit"
                            >
                              <FiEdit className="text-sm sm:text-base" />
                            </button>
                            <button
                              onClick={() => handleDeleteVendor(vendor)}
                              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                              title="Delete"
                            >
                              <FiTrash2 className="text-sm sm:text-base" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {transformedVendors.length === 0 && !isAddingNew && !vendorsLoading && (
          <div className="bg-gray-50/50 mt-6 rounded-lg border border-stroke py-8 text-center dark:border-strokedark dark:bg-meta-4/20 sm:py-12">
            <h3 className="text-gray-900 mb-2 text-base font-semibold dark:text-white sm:text-lg">
              No Vendors Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">
              Get started by adding your first vendor.
            </p>
          </div>
        )}

        {/* Loading */}
        {vendorsLoading && (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-gray-600 ml-2">Loading vendors...</span>
          </div>
        )}
      </FormProvider>
    </div>
  );
};

export default AdditionalVendors;
