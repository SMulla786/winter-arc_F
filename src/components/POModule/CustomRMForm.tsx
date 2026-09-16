/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useMemo, useEffect, useRef} from 'react';
import {
  FiPlus,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {SelectedMaterial} from './CreateEmergencyPO';
import {poSubmissionValidationSchema} from './CustomRM';

interface CustomRMFormProps {
  eventId?: string;
  initialData?: any;
  existingPoData?: any;
  rawMaterialData?: any;
  isMaterialsLoading: boolean;
  isSubmitting: boolean;
  customRawMaterialData?: any;
  onSubmitSuccess: (response: any) => void;
  submitPO: any;
  onViewTable: () => void;
  onViewHistory: () => void;
}

const CustomRMForm: React.FC<CustomRMFormProps> = ({
  eventId,
  initialData,
  existingPoData,
  rawMaterialData,
  isMaterialsLoading,
  isSubmitting,
  customRawMaterialData,
  onSubmitSuccess,
  submitPO,
  onViewTable,
  onViewHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Ref for dropdown to handle click outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm({
    resolver: zodResolver(poSubmissionValidationSchema),
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Transform API data to selected materials format
  const transformApiDataToSelectedMaterials = (
    apiData: any,
  ): SelectedMaterial[] => {
    if (!apiData?.data?.sendToVendors) return [];

    return apiData.data.sendToVendors.map((item: any) => ({
      id: item.materialId,
      rawmaterialId: item.materialId,
      name: item.rawmaterial?.name || item.name,
      category: item.rawmaterial?.category || {
        id: item.rawmaterial?.categoryId || '',
        name: item.rawmaterial?.category?.name || 'Uncategorized',
        caterorId: '',
        createdAt: '',
        languageId: '',
        updatedAt: '',
      },
      categoryId: item.rawmaterial?.categoryId || '',
      unit: item.unit,
      amount:
        item.rawmaterial?.amount || item.inventoryOrder / item.quantity || 0,
      inventory: item.inventory || 0,
      caterorId: item.caterorId || '',
      languageId: '',
      createdAt: item.createdAt || '',
      updatedAt: item.updatedAt || '',
      quantity: item.quantity,
      inventory_value: item.inventoryOrder || 0,
    }));
  };

  // Initialize form data
  useEffect(() => {
    const initializeForm = () => {
      const dataSource = existingPoData || initialData;

      if (dataSource) {
        // Set dates
        let fromDateValue = '';
        if (dataSource.data?.from) {
          fromDateValue = new Date(dataSource.data.from)
            .toISOString()
            .split('T')[0];
        } else if (dataSource.from) {
          fromDateValue = new Date(dataSource.from).toISOString().split('T')[0];
        } else {
          fromDateValue = new Date().toISOString().split('T')[0];
        }
        setFromDate(fromDateValue);

        // Set to date
        let toDateValue = '';
        if (existingPoData?.data?.to) {
          toDateValue = new Date(existingPoData.data.to)
            .toISOString()
            .split('T')[0];
        } else if (initialData?.to) {
          toDateValue = initialData.to.split('T')[0];
        } else {
          toDateValue = new Date().toISOString().split('T')[0];
        }
        setToDate(toDateValue);

        // Set selected materials
        let materials: SelectedMaterial[] = [];
        let materialIds: string[] = [];

        if (existingPoData?.data?.sendToVendors) {
          materials = transformApiDataToSelectedMaterials(existingPoData);
          materialIds = materials.map((m) => m.id);
        } else if (initialData?.data) {
          materialIds = initialData.data.map((item: any) => item.id);
          materials = initialData.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: {
              id: '',
              name: '',
              caterorId: '',
              createdAt: '',
              languageId: '',
              updatedAt: '',
            },
            categoryId: '',
            unit: item.unit,
            amount: item.inventory_value / item.quantity || 0,
            inventory: 0,
            caterorId: '',
            languageId: '',
            createdAt: '',
            updatedAt: '',
            quantity: item.quantity,
            inventory_value: item.inventory_value,
            rawmaterialId: item.id,
          }));
        }

        setSelectedMaterialIds(materialIds);
        setSelectedMaterials(materials);

        // Auto-expand all categories when editing
        const categoriesToExpand: {[key: string]: boolean} = {};
        materials.forEach((material) => {
          const categoryName = material.category.name || 'Uncategorized';
          categoriesToExpand[categoryName] = true;
        });
        setExpandedCategories(categoriesToExpand);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
      }
    };

    initializeForm();
  }, [existingPoData, initialData]);

  // Get available materials
  const availableMaterials = useMemo(() => {
    if (!rawMaterialData) return [];

    let rawMaterials: any[] = [];
    if (
      rawMaterialData.data?.rawMaterials &&
      Array.isArray(rawMaterialData.data.rawMaterials)
    ) {
      rawMaterials = rawMaterialData.data.rawMaterials;
    } else if (Array.isArray(rawMaterialData)) {
      rawMaterials = rawMaterialData;
    } else if (
      rawMaterialData.rawMaterials &&
      Array.isArray(rawMaterialData.rawMaterials)
    ) {
      rawMaterials = rawMaterialData.rawMaterials;
    } else if (rawMaterialData.data && Array.isArray(rawMaterialData.data)) {
      rawMaterials = rawMaterialData.data;
    } else {
      return [];
    }

    return rawMaterials.map((material: any) => ({
      id: material.id,
      name: material.name,
      category: material.category || {id: '', name: 'Uncategorized'},
      categoryId: material.categoryId || '',
      unit: material.unit,
      amount: material.amount || material.price || 0,
      inventory: material.inventory || 0,
      caterorId: material.caterorId || '',
      languageId: material.languageId || '',
      createdAt: material.createdAt || '',
      updatedAt: material.updatedAt || '',
      rawmaterialId: material.id,
    }));
  }, [rawMaterialData]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories: {id: string; name: string}[] = [];
    const categoryMap = new Map();

    availableMaterials.forEach((material) => {
      if (
        material.category &&
        material.category.id &&
        !categoryMap.has(material.category.id)
      ) {
        categoryMap.set(material.category.id, material.category);
        uniqueCategories.push({
          id: material.category.id,
          name: material.category.name || 'Uncategorized',
        });
      }
    });

    return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableMaterials]);

  // Filter materials by category
  const filteredMaterials = useMemo(() => {
    if (!selectedCategory) return availableMaterials;
    return availableMaterials.filter(
      (material) => material.category.id === selectedCategory,
    );
  }, [availableMaterials, selectedCategory]);

  // Group selected materials by category
  const groupedMaterials = useMemo(() => {
    const grouped: {[category: string]: SelectedMaterial[]} = {};
    selectedMaterials.forEach((material) => {
      const categoryName = material.category?.name || 'Uncategorized';
      if (!grouped[categoryName]) grouped[categoryName] = [];
      grouped[categoryName].push(material);
    });
    return grouped;
  }, [selectedMaterials]);

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterialIds((prev) => {
      const isSelected = prev.includes(materialId);
      if (isSelected) {
        setSelectedMaterials((prevMaterials) =>
          prevMaterials.filter((m) => m.id !== materialId),
        );
        return prev.filter((id) => id !== materialId);
      } else {
        const material = availableMaterials.find((m) => m.id === materialId);
        if (material) {
          const newSelectedMaterial: SelectedMaterial = {
            ...material,
            quantity: 1,
            inventory_value: material.amount || 0, // Default to 0 or amount if available
            rawmaterialId: material.id,
          };
          setSelectedMaterials((prev) => [...prev, newSelectedMaterial]);

          const categoryName = material.category?.name || 'Uncategorized';
          setExpandedCategories((prev) => ({...prev, [categoryName]: true}));
        }
        return [...prev, materialId];
      }
    });
  };

  // Remove selected material
  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterialIds((prev) => prev.filter((id) => id !== materialId));
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  // Update selected material details
  const updateSelectedMaterial = (
    materialId: string,
    field: 'quantity' | 'inventory_value',
    value: any,
  ) => {
    setSelectedMaterials((prev) =>
      prev.map((material) => {
        if (material.id === materialId) {
          const updatedValue =
            field === 'quantity'
              ? Math.max(1, parseFloat(value) || 1)
              : Math.max(0, parseFloat(value) || 0);

          if (field === 'quantity') {
            return {
              ...material,
              [field]: updatedValue,
              inventory_value: (material.amount || 0) * updatedValue,
            };
          }
          return {...material, [field]: updatedValue};
        }
        return material;
      }),
    );
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({...prev, [category]: !prev[category]}));
  };

  const onSubmit = () => {
    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    const customRawMaterialPayload = {
      startDate: new Date(fromDate),
      data: selectedMaterials.map((material) => ({
        id: material.id,
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        inventory_value: 0, // Force always 0
      })),
    };

    // Validate each item
    for (const item of customRawMaterialPayload.data) {
      if (item.quantity < 1) {
        toast.error(`Quantity for ${item.name} must be at least 1`);
        return;
      }
    }

    submitPO(customRawMaterialPayload, {
      onSuccess: (response: any) => {
        toast.success('Raw Materials submitted successfully!');
        onSubmitSuccess(response);

        // Reset form
        setSelectedMaterials([]);
        setSelectedMaterialIds([]);
        setSelectedCategory('');
        setIsDropdownOpen(false);
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        const to = new Date(today);
        to.setDate(to.getDate() + 7);
        setToDate(to.toISOString().split('T')[0]);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to submit raw materials!',
        );
      },
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Remove inventory_value display from the frontend table
  const displayMaterials = useMemo(() => {
    return selectedMaterials.map((material) => ({
      ...material,
      // We can still store it but not display it in the table
    }));
  }, [selectedMaterials]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-900 text-xl font-semibold dark:text-white">
          {eventId || initialData
            ? 'Edit Raw Materials'
            : 'Create Custom Raw Materials'}
        </h2>
      </div>

      {eventId && existingPoData && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Editing raw materials list #{existingPoData.data?.listNo} from{' '}
            {new Date(existingPoData.data?.from).toLocaleDateString()}
          </p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
        {/* Material Selection Section */}
        <div className="border-gray-200 p-4 dark:border-black dark:bg-black">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                Raw Materials
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="border-gray-300 dark:border-gray-900 flex w-full items-center justify-between rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedMaterialIds.length > 0
                      ? `${selectedMaterialIds.length} material(s) selected`
                      : 'Select materials...'}
                  </span>
                  <FiPlus
                    className={`transform transition-transform ${isDropdownOpen ? 'rotate-45' : ''}`}
                  />
                </button>

                {selectedMaterialIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMaterialIds.map((materialId) => {
                      const material =
                        availableMaterials.find((m) => m.id === materialId) ||
                        selectedMaterials.find((m) => m.id === materialId);
                      return (
                        <span
                          key={materialId}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {material?.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(materialId)}
                            className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {isDropdownOpen && (
                  <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:bg-form-input">
                    <div className="p-2">
                      {isMaterialsLoading ? (
                        <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
                          Loading materials...
                        </div>
                      ) : filteredMaterials.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
                          No materials found
                        </div>
                      ) : (
                        filteredMaterials.map((material) => (
                          <label
                            key={material.id}
                            className="dark:hover:bg-gray-900 hover:bg-gray-100 flex cursor-pointer items-center rounded px-3 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMaterialIds.includes(
                                material.id,
                              )}
                              onChange={() => handleMaterialToggle(material.id)}
                              className="border-gray-300 dark:border-gray-900 dark:bg-gray-900 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-gray-700 dark:text-gray-300 ml-3 text-sm">
                              {material.name}
                              <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                                ({material.category?.name}) • {material.unit} •
                                ₹{material.amount}
                              </span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Materials Table */}
        <div>
          <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
            <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                  Raw Material ({selectedMaterials.length} items)
                </h3>
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                  Total Items: {selectedMaterials.length}
                </div>
              </div>
              {(eventId || initialData) && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  Update quantities as needed.
                </p>
              )}
            </div>

            {selectedMaterials.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="mb-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No materials selected yet.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                    Select materials from the dropdown above or view history to
                    copy from previous lists.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                  <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Material Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Unit
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                    {Object.keys(groupedMaterials).map((category) => (
                      <React.Fragment key={category}>
                        {/* Category Header Row */}
                        <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => toggleCategory(category)}
                              >
                                {expandedCategories[category] ? (
                                  <FiChevronDown className="h-4 w-4" />
                                ) : (
                                  <FiChevronRight className="h-4 w-4" />
                                )}
                                <span className="text-gray-800 font-semibold dark:text-white">
                                  {category}
                                </span>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  ({groupedMaterials[category].length} items)
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {expandedCategories[category] &&
                          groupedMaterials[category].map((item, itemIndex) => {
                            const rowBg =
                              itemIndex % 2 === 0
                                ? 'bg-white'
                                : 'bg-gray-50/30 dark:bg-gray-900/30';
                            return (
                              <tr
                                key={item.id}
                                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${rowBg}`}
                              >
                                <td className="px-4 py-3 dark:bg-black">
                                  <div className="text-gray-800 text-sm font-medium dark:text-white">
                                    {item.name}
                                  </div>
                                </td>
                                <td className="px-4 py-3 dark:bg-black">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateSelectedMaterial(
                                        item.id,
                                        'quantity',
                                        e.target.value,
                                      )
                                    }
                                    className="border-gray-300 dark:border-gray-700 w-24 rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-black dark:text-white"
                                    min="1"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-4 py-3 dark:bg-black">
                                  <div className="text-gray-600 dark:text-gray-400">
                                    {item.unit}
                                  </div>
                                </td>

                                <td className="px-4 py-3 dark:bg-black">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveMaterial(item.id)
                                    }
                                    className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                                    title="Remove material"
                                  >
                                    <FiX className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting || selectedMaterials.length === 0}
            className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : eventId ? 'Update ' : 'Submit '}
          </button>
        </div>
      </form>
    </>
  );
};

export default CustomRMForm;
