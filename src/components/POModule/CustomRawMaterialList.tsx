/*eslint-disable*/
import React, {useState, useMemo} from 'react';
import {
  FiPlus,
  FiMinus,
  FiSave,
  FiX,
  FiEye,
  FiDownload,
  FiEdit,
  FiTrash,
} from 'react-icons/fi';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {
  useDeleteCustom,
  useDeleteSubmitPurchaseOrderCustom,
  useGetcustomReport,
  useGetSubmitPurchaseOrderCustom,
  useSubmitPurchaseOrderCustom,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import GenericTable from '../Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import {deletecustom} from '@/lib/api/cateror/PO/pomodule';

// Validation schema for form submission
export const poSubmissionValidationSchema = z.object({
  rawmaterials: z
    .array(
      z.object({
        materialId: z.string().nonempty('Material ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
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

interface SelectedMaterial extends Material {
  quantity: number;
  date: string;
  time: string;
  venue: string;
}

interface PawMaterial {
  id: string;
  materialId: string;
  caterorId: string;
  quantity: number;
  RawMaterialTemplateId: string;
  createdAt: string;
  RawMaterial: {
    id: string;
    name: string;
    unit: string;
    categoryId: string;
    languageId: string;
    caterorId: string;
    inventory: number;
    amount: number;
    createdAt: string;
  };
}

interface CustomRawMaterialItem {
  id: string;
  listNo: number;
  caterorId: string;
  createdAt: string;
  pawmaterials: PawMaterial[];
}

interface ProcessedCustomListItem {
  id: string;
  listNo: number;
  materialsCount: number;
  createdAt: string;
  materials: {
    name: string;
    quantity: number;
    unit: string;
    amount: number;
  }[];
}

const CustomRawMaterialList = () => {
  const navigate = useNavigate();
  const {mutate: submitPO, isPending: isSubmitting} =
    useSubmitPurchaseOrderCustom();
  const {data: rawMaterialData, isLoading: isMaterialsLoading} =
    useGetRawMaterialsCateror();
  const {
    data: customrawmateriallist,
    isLoading: isListLoading,
    refetch,
  } = useGetSubmitPurchaseOrderCustom();

  const {mutate: deleteSubmitedPurchaseOrder} =
    useDeleteSubmitPurchaseOrderCustom();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm({
    resolver: zodResolver(poSubmissionValidationSchema),
    defaultValues: {
      rawmaterials: [],
    },
  });

  // Process custom raw material list data
  const processedCustomList: ProcessedCustomListItem[] = useMemo(() => {
    if (!customrawmateriallist) return [];

    console.log('Raw custom material list:', customrawmateriallist.data);

    return customrawmateriallist.map((item: CustomRawMaterialItem) => ({
      id: item.id,
      listNo: item.listNo || 0,
      createdAt: item.createdAt,
      materialsCount: item.pawmaterials?.length || 0,
      materials:
        item.pawmaterials?.map((paw: PawMaterial) => ({
          name: paw.RawMaterial.name,
          quantity: paw.quantity,
          unit: paw.RawMaterial.unit,
          amount: paw.RawMaterial.amount,
        })) || [],
    }));
  }, [customrawmateriallist]);

  // Get available materials
  const availableMaterials = useMemo(() => {
    if (!rawMaterialData?.data?.rawMaterials) return [];
    return rawMaterialData.data.rawMaterials.map((material: any) => ({
      id: material.id,
      name: material.name,
      category: material.category,
      categoryId: material.categoryId,
      unit: material.unit,
      amount: material.amount,
      inventory: material.inventory,
      caterorId: material.caterorId,
      languageId: material.languageId,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }));
  }, [rawMaterialData]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories: {id: string; name: string}[] = [];
    const categoryMap = new Map();
    availableMaterials.forEach((material) => {
      if (material.category && !categoryMap.has(material.category.id)) {
        categoryMap.set(material.category.id, material.category);
        uniqueCategories.push({
          id: material.category.id,
          name: material.category.name,
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

  // Handle material selection
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
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            venue: '',
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
      prev.map((material) =>
        material.id === materialId ? {...material, [field]: value} : material,
      ),
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this Custom Raw Material?')) {
      deleteSubmitedPurchaseOrder(id);
    }
  };
  // Handle form submission
  const onSubmit = () => {
    console.log('Submit button clicked');

    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    const incompleteMaterials = selectedMaterials.filter(
      (material) =>
        !material.date ||
        !material.time ||
        !material.venue ||
        material.quantity < 1,
    );

    if (incompleteMaterials.length > 0) {
      toast.error(
        'Please fill all fields for selected materials (date, time, venue, quantity)',
      );
      return;
    }

    const poData = {
      rawmaterials: selectedMaterials.map((material) => ({
        materialId: material.id,
        quantity: material.quantity,
      })),
    };

    console.log('Submitting PO Data:', poData);

    try {
      poSubmissionValidationSchema.parse(poData);
      console.log('Validation passed, submitting...');

      submitPO(poData, {
        onSuccess: (response) => {
          toast.success('Purchase Order submitted successfully!');
          console.log('Submitted PO response:', response);
          reset();
          setSelectedMaterials([]);
          setSelectedMaterialIds([]);
          setSelectedCategory('');
          setIsDropdownOpen(false);
          refetch(); // Refresh the data after successful submission
        },
        onError: (error: any) => {
          console.error('Submission error details:', error);
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              'Failed to submit purchase order!',
          );
        },
      });
    } catch (validationError: any) {
      console.error('Validation error details:', validationError);
      toast.error('Validation failed! Please check all fields.');
    }
  };

  // Handle form submission with event prevention
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Define columns for GenericTable following the demo pattern
  const columns = [
    {
      header: 'List No',
      accessor: 'listNo' as keyof ProcessedCustomListItem,
      sortable: true,
      render: (item: ProcessedCustomListItem) => (
        <div className="text-gray-900 dark:text-gray-100 font-semibold">
          #{item.listNo}
        </div>
      ),
    },
    {
      header: 'Materials Count',
      accessor: 'materialsCount' as keyof ProcessedCustomListItem,
      sortable: true,
      render: (item: ProcessedCustomListItem) => (
        <div className="text-gray-600 dark:text-gray-400">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
              item.materialsCount > 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {item.materialsCount} materials
          </span>
        </div>
      ),
    },
    {
      header: 'Materials',
      accessor: 'materials' as keyof ProcessedCustomListItem,
      render: (item: ProcessedCustomListItem) => (
        <div className="max-w-md">
          {item.materials.map((material: any, index: number) => (
            <div
              key={index}
              className="text-gray-600 dark:text-gray-400 mb-1 text-sm"
            >
              • {material.name} - {material.quantity} {material.unit} (₹
              {material.amount})
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Created Date',
      accessor: 'createdAt' as keyof ProcessedCustomListItem,
      sortable: true,
      render: (item: ProcessedCustomListItem) => (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          {new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
  ];

  // Table columns for selected materials (for the form section)
  const selectedMaterialsColumns = [
    {
      header: 'Material Name',
      accessor: 'name' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <div className="text-gray-900 dark:text-gray-100 font-medium">
          {item.name}
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <div className="text-gray-600 dark:text-gray-400">
          {item.category?.name || 'Uncategorized'}
        </div>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
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
          className="border-gray-300 dark:border-gray-600 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          min="1"
        />
      ),
    },
    {
      header: 'Unit',
      accessor: 'unit' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <div className="text-gray-600 dark:text-gray-400">{item.unit}</div>
      ),
    },
    {
      header: 'Date',
      accessor: 'date' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <input
          type="date"
          value={item.date}
          onChange={(e) =>
            updateSelectedMaterial(item.id, 'date', e.target.value)
          }
          className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          required
        />
      ),
    },
    {
      header: 'Time',
      accessor: 'time' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <input
          type="time"
          value={item.time}
          onChange={(e) =>
            updateSelectedMaterial(item.id, 'time', e.target.value)
          }
          className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          required
        />
      ),
    },
    {
      header: 'Venue',
      accessor: 'venue' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <input
          type="text"
          value={item.venue}
          onChange={(e) =>
            updateSelectedMaterial(item.id, 'venue', e.target.value)
          }
          className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter venue"
          required
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Create Purchase Order Section - Always visible */}
      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
        <h2 className="text-gray-900 mb-6 text-xl font-semibold dark:text-white">
          Create Custom Purchase Order
        </h2>
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
                        {isMaterialsLoading ? (
                          <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
                            Loading materials...
                          </div>
                        ) : filteredMaterials.length === 0 ? (
                          <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
                            No materials found
                          </div>
                        ) : (
                          filteredMaterials.map((material: Material) => (
                            <label
                              key={material.id}
                              className="dark:hover:bg-gray-900 flex cursor-pointer items-center rounded px-3 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMaterialIds.includes(
                                  material.id,
                                )}
                                onChange={() =>
                                  handleMaterialToggle(material.id)
                                }
                                className="border-gray-300 dark:border-gray-900 dark:bg-gray-900 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                              />
                              <span className="text-gray-700 dark:text-gray-300 ml-3 text-sm">
                                {material.name}
                                <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                                  ({material.category?.name}) • {material.unit}{' '}
                                  • ₹{material.amount}
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

          {selectedMaterials.length > 0 && (
            <GenericTable
              title="Selected Materials"
              data={selectedMaterials}
              columns={selectedMaterialsColumns}
              itemsPerPage={5}
              searchAble={false}
              paginationOff={true}
            />
          )}

          <div className="flex justify-end space-x-4 dark:bg-black">
            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedMaterials([]);
                setSelectedMaterialIds([]);
                setSelectedCategory('');
                setIsDropdownOpen(false);
              }}
              className="border-gray-300 dark:border-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border px-6 py-2 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedMaterials.length === 0}
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
            >
              <FiSave className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Purchase Order'}
            </button>
          </div>
        </form>
      </div>

      <div>
        {isListLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-600 dark:text-gray-400">
              Loading custom purchase orders...
            </div>
          </div>
        ) : processedCustomList.length === 0 ? (
          <div className="py-8 text-center">
            <FiEye className="text-gray-400 mx-auto h-12 w-12" />
            <h3 className="text-gray-900 mt-4 text-lg font-medium dark:text-white">
              No custom purchase orders found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create your first custom purchase order to see the history here.
            </p>
          </div>
        ) : (
          <GenericTable
            title="Custom Purchase Orders"
            data={processedCustomList} // ✅ FIXED: Use processedCustomList instead of customrawmateriallist
            columns={columns}
            itemsPerPage={5}
            searchAble={true}
            paginationOff={false}
            action={true}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default CustomRawMaterialList;
