/* eslint-disable */
import React, {useState, useMemo} from 'react';
import {
  FiPlus,
  FiSave,
  FiX,
  FiTrash,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {z} from 'zod';

// Validation schema for form submission
export const poSubmissionValidationSchema = z.object({
  eventId: z.string().nonempty('Event ID is required'),
  materials: z
    .array(
      z.object({
        materialId: z.string().nonempty('Material ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        date: z.string().nonempty('Date is required'),
        time: z.string().nonempty('Time is required'),
        venue: z.string().nonempty('Venue is required'),
        vendorId: z.string().optional(),
        price: z.number().optional(),
      }),
    )
    .min(1, 'At least one material is required'),
});

interface Category {
  id: string;
  name: string;
  caterorId: string;
  createdAt: string;
  languageId: string;
  updatedAt: string;
}

interface Material {
  id: string;
  name: string;
  category: Category;
  categoryId: string;
  unit: string;
  amount: number;
  inventory: number;
  caterorId: string;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  caterorId: string;
  rawMaterialVendorRoles: {
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
  }[];
}

interface SelectedMaterial extends Material {
  quantity: number;
  date: string;
  time: string;
  venue: string;
  vendorId?: string;
  price?: number;
  totalAmount?: number;
  vendorName: string;
}

interface CreateEmergencyPOProps {
  eventId: string;
  availableMaterials: Material[];
  vendors: Vendor[];
  categories: {id: string; name: string}[];
  isSubmitting: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CreateEmergencyPO: React.FC<CreateEmergencyPOProps> = ({
  eventId,
  availableMaterials,
  vendors,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categoryConfigs, setCategoryConfigs] = useState<{
    [category: string]: {
      date: string;
      time: string;
      venue: string;
      vendorId?: string;
      vendorName: string;
      price?: number;
    };
  }>({});
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm({
    resolver: zodResolver(poSubmissionValidationSchema),
    defaultValues: {
      materials: [],
    },
  });

  // Get vendor options for a category
  const getVendorOptions = useMemo(() => {
    return (category: string, categoryId?: string) => {
      if (!vendors || vendors.length === 0) {
        return [];
      }
      // Return all vendors without category filtering to prevent cross-category issues
      return vendors.map((vendor) => ({
        id: vendor.id,
        label: vendor.name,
        price: 0, // Default price
      }));
    };
  }, [vendors]);

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
      const categoryName = material.category.name;
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(material);
    });

    return grouped;
  }, [selectedMaterials]);

  // Initialize expanded categories when materials are selected
  React.useEffect(() => {
    if (selectedMaterials.length > 0) {
      const newExpanded: {[key: string]: boolean} = {};
      selectedMaterials.forEach((material) => {
        const categoryName = material.category.name;
        if (!(categoryName in newExpanded)) {
          newExpanded[categoryName] = true;
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [selectedMaterials]);

  // Handle material selection
  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterialIds((prev) => {
      const isSelected = prev.includes(materialId);
      if (isSelected) {
        // Remove material from selected table
        setSelectedMaterials((prevMaterials) =>
          prevMaterials.filter((m) => m.id !== materialId),
        );
        return prev.filter((id) => id !== materialId);
      } else {
        // Add material to selected table
        const material = availableMaterials.find((m) => m.id === materialId);
        if (material) {
          const vendorOptions = getVendorOptions(
            material.category.name,
            material.categoryId,
          );
          const newSelectedMaterial: SelectedMaterial = {
            ...material,
            quantity: 1,
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            venue: '',
            vendorId:
              vendorOptions.length > 0 ? vendorOptions[0].id : undefined,
            price: material.amount || 0,
            totalAmount: (material.amount || 0) * 1,
          };
          setSelectedMaterials((prev) => [...prev, newSelectedMaterial]);
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

  // Remove selected material chip
  const removeMaterialChip = (materialId: string) => {
    handleRemoveMaterial(materialId);
  };

  // Update selected material details
  const updateSelectedMaterial = (
    materialId: string,
    field: keyof SelectedMaterial,
    value: any,
  ) => {
    setSelectedMaterials((prev) =>
      prev.map((material) => {
        if (material.id === materialId) {
          const updatedMaterial = {...material, [field]: value};

          // Recalculate total amount when quantity or price changes
          if (field === 'quantity' || field === 'price') {
            const quantity = field === 'quantity' ? value : material.quantity;
            const price = field === 'price' ? value : material.price || 0;
            updatedMaterial.totalAmount = (quantity || 0) * (price || 0);
          }

          return updatedMaterial;
        }
        return material;
      }),
    );
  };

  // Apply category configuration to all items in a category
  const applyCategoryConfig = (category: string) => {
    const config = categoryConfigs[category];
    if (!config) return;

    setSelectedMaterials((prev) =>
      prev.map((item) => {
        if (item.category.name === category) {
          const updatedItem = {
            ...item,
            date: config.date,
            time: config.time,
            venue: config.venue,
            vendorId: config.vendorId,
            vendorName: config.vendorName,
            price: config.price,
          };

          // Recalculate total amount
          updatedItem.totalAmount =
            (updatedItem.quantity || 0) * (updatedItem.price || 0);

          return updatedItem;
        }
        return item;
      }),
    );
  };

  // Update category configuration
  const updateCategoryConfig = (
    category: string,
    field: string,
    value: string | number,
  ) => {
    setCategoryConfigs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  // Format time for API
  const formatTimeForAPI = (date: string, time: string): string => {
    if (!date || !time) return '';
    return `${date}T${time}:00Z`;
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    const incompleteMaterials = selectedMaterials.filter(
      (material) =>
        !material.date ||
        !material.time ||
        !material.venue ||
        material.quantity < 1 ||
        !material.vendorId ||
        !material.price,
    );

    if (incompleteMaterials.length > 0) {
      toast.error(
        'Please fill all fields for selected materials (date, time, venue, quantity, vendor, price)',
      );
      return;
    }

    const poData = {
      eventId,
      materials: selectedMaterials.map((material) => ({
        materialId: material.id,
        quantity: material.quantity,
        date: material.date,
        time: formatTimeForAPI(material.date, material.time),
        venue: material.venue,
        vendorId: material.vendorId,
        vendorName: material.vendorName,
        price: material.price,
        totalAmount: material.totalAmount,
      })),
    };

    console.log('Submitting Emergency PO Data:', poData);

    try {
      poSubmissionValidationSchema.parse(poData);
      console.log('Validation passed, submitting...');
      onSubmit(poData);
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      toast.error('Validation failed! Please check all fields.');
    }
  };

  // Calculate totals
  const totalAmount = selectedMaterials.reduce(
    (sum, item) => sum + (item.totalAmount || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-3">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-1 dark:border-strokedark dark:bg-black">
      <h2 className="text-gray-900 dark:text-gray-100 mb-2 text-xl font-semibold">
        Create Emergency Purchase Order
      </h2>

      <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
        {/* Material Selection Section */}
        <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4 text-lg font-medium">
            Select Materials
          </h3>
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
              <div className="relative">
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
                      const material = availableMaterials.find(
                        (m) => m.id === materialId,
                      );
                      return (
                        <span
                          key={materialId}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {material?.name}
                          <button
                            type="button"
                            onClick={() => removeMaterialChip(materialId)}
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
                  <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:bg-form-input">
                    <div className="p-2">
                      {isLoading ? (
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
                            className="dark:hover:bg-gray-900 hover:bg-gray-50 flex cursor-pointer items-center rounded px-3 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMaterialIds.includes(
                                material.id,
                              )}
                              onChange={() => handleMaterialToggle(material.id)}
                              className="border-gray-300 dark:border-gray-900 dark:bg-gray-900 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
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

        {/* Selected Materials Table - EventPoPage Style */}
        {selectedMaterials.length > 0 && (
          <div className="mt-6">
            <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
              <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
                <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                  Selected Materials ({selectedMaterials.length} items)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                  <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Material Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Venue
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Vendor
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Price (₹)
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Total Amt (₹)
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                    {Object.keys(groupedMaterials).map((category) => (
                      <React.Fragment key={category}>
                        {/* Category Header Row */}
                        <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                          <td colSpan={10} className="px-4 py-3">
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

                        {/* Category Items - Only show when expanded */}
                        {expandedCategories[category] &&
                          groupedMaterials[category].map((item, itemIndex) => {
                            const vendorOptions = getVendorOptions(
                              item.category.name,
                              item.categoryId,
                            );
                            const rowBg =
                              itemIndex % 2 === 0
                                ? 'bg-white'
                                : 'bg-gray-50/30 dark:bg-gray-900/30';

                            return (
                              <tr
                                key={item.id}
                                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${rowBg}`}
                              >
                                {/* Material Name */}
                                <td className="px-4 py-3">
                                  <div className="text-gray-800 text-sm font-medium dark:text-white">
                                    {item.name}
                                  </div>
                                </td>

                                {/* Quantity */}
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateSelectedMaterial(
                                        item.id,
                                        'quantity',
                                        parseInt(e.target.value) || 1,
                                      )
                                    }
                                    className="border-gray-300 w-20 rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    min="1"
                                  />
                                </td>

                                {/* Unit */}
                                <td className="px-4 py-3">
                                  <div className="text-gray-600 dark:text-gray-400 text-center">
                                    {item.unit}
                                  </div>
                                </td>

                                {/* Date */}
                                <td className="px-4 py-3">
                                  <input
                                    type="date"
                                    value={item.date}
                                    onChange={(e) =>
                                      updateSelectedMaterial(
                                        item.id,
                                        'date',
                                        e.target.value,
                                      )
                                    }
                                    className="border-gray-300 w-30 rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                  />
                                </td>

                                {/* Time */}
                                <td className="px-4 py-3">
                                  <input
                                    type="time"
                                    value={item.time}
                                    onChange={(e) =>
                                      updateSelectedMaterial(
                                        item.id,
                                        'time',
                                        e.target.value,
                                      )
                                    }
                                    className="border-gray-300 w-20 rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                  />
                                </td>

                                {/* Venue */}
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={item.venue}
                                    onChange={(e) =>
                                      updateSelectedMaterial(
                                        item.id,
                                        'venue',
                                        e.target.value,
                                      )
                                    }
                                    className="border-gray-300 w-full rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter venue"
                                    required
                                  />
                                </td>

                                {/* Vendor */}
                                <td className="px-4 py-3">
                                  {/* Vendor - FREE TEXT INPUT (No Dropdown) */}
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      value={item.vendorName || ''} // <-- important: use vendorName, not vendorId
                                      onChange={(e) =>
                                        updateSelectedMaterial(
                                          item.id,
                                          'vendorName',
                                          e.target.value,
                                        )
                                      }
                                      className="border-gray-300 text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:placeholder-gray-500 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                      placeholder="Enter vendor name"
                                      required
                                    />
                                  </td>
                                </td>

                                {/* Price */}
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.price || ''}
                                    onChange={(e) => {
                                      const newPrice = e.target.value
                                        ? Number(e.target.value)
                                        : undefined;
                                      updateSelectedMaterial(
                                        item.id,
                                        'price',
                                        newPrice,
                                      );
                                    }}
                                    className="border-gray-300 w-20 rounded border px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="0.00"
                                  />
                                </td>

                                {/* Total Amount */}
                                <td className="px-4 py-3">
                                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                                    ₹{(item.totalAmount || 0).toFixed(2)}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveMaterial(item.id)
                                    }
                                    className="text-red-500 transition-colors hover:text-red-700 dark:hover:text-red-400"
                                    title="Remove material"
                                  >
                                    <FiTrash className="h-4 w-4" />
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

              {/* Total Amount Footer */}
              <div className="bg-gray-50 dark:bg-gray-900 border-t border-stroke px-4 py-3 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Total {selectedMaterials.length} materials
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
                    Total Amount: ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting || selectedMaterials.length === 0}
            className="disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-primary-dark dark:hover:bg-primary-dark flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed dark:bg-primary"
          >
            <FiSave className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Emergency PO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmergencyPO;
export type {Material, Vendor, SelectedMaterial};
