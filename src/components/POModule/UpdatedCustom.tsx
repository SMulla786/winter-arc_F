/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {FiSave, FiArrowLeft, FiPlus, FiX} from 'react-icons/fi';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {useNavigate} from '@tanstack/react-router';
import {
  useCustomById,
  useUpdatePurchaseOrder,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import GroupedGenericTable from '../Forms/Table/GenericTable';
import {Route} from '@/routes/_app/_po/custom.$id';

// Validation schema for updating purchase order
export const poUpdateValidationSchema = z.object({
  materials: z
    .array(
      z.object({
        materialId: z.string().min(1, 'Material ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        date: z.string().min(1, 'Date is required'),
        time: z.string().min(1, 'Time is required'),
        venue: z.string().min(1, 'Venue is required'),
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

interface PurchaseMaterial {
  id: string;
  materialId: string;
  quantity: number;
  date: string;
  time: string;
  venue: string;
  material: Material;
}

interface SelectedMaterial extends Material {
  quantity: number;
  date: string;
  time: string;
  venue: string;
  purchaseMaterialId?: string;
  cost: number;
}

const UpdatedCustom = () => {
  const navigate = useNavigate();
  const {id} = Route.useParams();

  const {
    data: purchaseOrderData,
    isLoading: isPurchaseOrderLoading,
    error: purchaseOrderError,
  } = useCustomById(id);
  const {data: rawMaterialData, isLoading: isMaterialsLoading} =
    useGetRawMaterialsCateror();
  const {mutate: updatePO, isPending: isUpdating} = useUpdatePurchaseOrder();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    handleSubmit,
    formState: {errors},
    setError,
  } = useForm({
    resolver: zodResolver(poUpdateValidationSchema),
    defaultValues: {materials: []},
  });

  // Get available materials
  const availableMaterials = useMemo(() => {
    if (!rawMaterialData) {
      return [];
    }

    let materialsArray = [];

    if (Array.isArray(rawMaterialData)) {
      materialsArray = rawMaterialData;
    } else if (rawMaterialData?.data) {
      if (Array.isArray(rawMaterialData.data)) {
        materialsArray = rawMaterialData.data;
      } else if (rawMaterialData.data?.rawMaterials) {
        materialsArray = Array.isArray(rawMaterialData.data.rawMaterials)
          ? rawMaterialData.data.rawMaterials
          : [];
      }
    }

    const materials = materialsArray.map((material: any) => ({
      id: material.id,
      name: material.name,
      category: material.category || {id: '', name: 'Uncategorized'},
      categoryId: material.categoryId || '',
      unit: material.unit || '',
      amount: material.amount || 0,
      inventory: material.inventory || 0,
      caterorId: material.caterorId || '',
      languageId: material.languageId || '',
      createdAt: material.createdAt || '',
      updatedAt: material.updatedAt || '',
    }));

    return materials;
  }, [rawMaterialData]);

  // Load and process purchase order data
  useEffect(() => {
    if (purchaseOrderData && availableMaterials.length > 0) {
      let poData = purchaseOrderData;

      if (purchaseOrderData.data) {
        poData = purchaseOrderData.data;
      }

      const purchaseMaterials =
        poData.PurchaseMaterial || poData.purchaseMaterials || [];

      if (Array.isArray(purchaseMaterials) && purchaseMaterials.length > 0) {
        const processedMaterials: SelectedMaterial[] = purchaseMaterials
          .map((pm: any) => {
            const materialInfo = pm.material;
            if (!materialInfo) {
              return null;
            }

            const completeMaterial =
              availableMaterials.find((m) => m.id === materialInfo.id) ||
              materialInfo;

            const date = pm.date
              ? pm.date.includes('T')
                ? pm.date.split('T')[0]
                : pm.date
              : new Date().toISOString().split('T')[0];

            let time = '09:00';
            if (pm.time) {
              if (pm.time.includes('T')) {
                const timePart = pm.time.split('T')[1];
                time = timePart
                  ? timePart.split(':').slice(0, 2).join(':')
                  : '09:00';
              } else if (pm.time.includes(':')) {
                time = pm.time.split(':').slice(0, 2).join(':');
              }
            }

            const processedMaterial: SelectedMaterial = {
              id: completeMaterial.id,
              name: completeMaterial.name,
              category: completeMaterial.category,
              categoryId: completeMaterial.categoryId,
              unit: completeMaterial.unit,
              amount: completeMaterial.amount || 0,
              inventory: completeMaterial.inventory || 0,
              caterorId: completeMaterial.caterorId,
              languageId: completeMaterial.languageId,
              createdAt: completeMaterial.createdAt,
              updatedAt: completeMaterial.updatedAt,
              quantity: pm.quantity || 1,
              date: date,
              time: time,
              venue: pm.venue || '',
              purchaseMaterialId: pm.id,
              cost: (completeMaterial.amount || 0) * (pm.quantity || 1),
            };

            return processedMaterial;
          })
          .filter((m): m is SelectedMaterial => m !== null);

        setSelectedMaterials(processedMaterials);

        if (processedMaterials.length > 0) {
          const firstCategoryId = processedMaterials[0].categoryId;
          setSelectedCategory(firstCategoryId);
        }
      } else {
        setSelectedMaterials([]);
      }
    }
  }, [purchaseOrderData, availableMaterials]);

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
      (material) => material.categoryId === selectedCategory,
    );
  }, [availableMaterials, selectedCategory]);

  // Handle material selection
  const handleMaterialToggle = (materialId: string) => {
    const existingMaterial = selectedMaterials.find((m) => m.id === materialId);
    if (existingMaterial) {
      setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } else {
      const material = availableMaterials.find((m) => m.id === materialId);
      if (material) {
        const newMaterial: SelectedMaterial = {
          ...material,
          quantity: 1,
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          venue: '',
          cost: material.amount,
        };
        setSelectedMaterials((prev) => [...prev, newMaterial]);
      }
    }
  };

  // Remove material
  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  // Update material details
  const updateSelectedMaterial = (
    materialId: string,
    field: keyof SelectedMaterial,
    value: any,
  ) => {
    setSelectedMaterials((prev) =>
      prev.map((material) => {
        if (material.id === materialId) {
          const updated = {
            ...material,
            [field]: field === 'quantity' ? parseInt(value) || 1 : value,
          };
          if (field === 'quantity') {
            updated.cost = material.amount * (parseInt(value) || 1);
          }
          return updated;
        }
        return material;
      }),
    );
  };

  // Format time for API - Same as custom PO
  const formatTimeForAPI = (date: string, time: string): string => {
    if (!date || !time) return '';
    return `${date}T${time}:00Z`;
  };

  // Form submission - Corrected version
  const onSubmit = () => {
    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      setError('materials', {message: 'At least one material is required'});
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
      materials: selectedMaterials.map((material) => ({
        materialId: material.id,
        quantity: material.quantity,
        date: material.date,
        time: formatTimeForAPI(material.date, material.time),
        venue: material.venue,
        purchaseMaterialId: material.purchaseMaterialId,
      })),
    };

    updatePO(
      {id, data: poData},
      {
        onSuccess: () => {
          toast.success('Purchase Order updated successfully!');
          // navigate({ to: '/pomodule' });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to update purchase order',
          );
        },
      },
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleBack = () => {
    navigate({to: '/dishcountreport'});
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.materials-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Table columns for selected materials
  const tableColumns = [
    {
      header: 'Material Name',
      accessor: 'name' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <div className="text-gray-900 font-medium">{item.name}</div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <div className="text-gray-600">
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
          className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          min="1"
        />
      ),
    },
    {
      header: 'Unit',
      accessor: 'unit' as keyof SelectedMaterial,
      render: (item: SelectedMaterial) => (
        <div className="text-gray-600">{item.unit}</div>
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

  // Show loading state
  if (isPurchaseOrderLoading || isMaterialsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading purchase order data...</div>
      </div>
    );
  }

  // Show error state
  if (purchaseOrderError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-red-600">Error loading purchase order data</div>
        <button
          onClick={handleBack}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="">
        <button
          onClick={handleBack}
          className="text-center text-xl font-bold"
          type="button"
        >
          ← Back
        </button>
      </div>
      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
        <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
          <div className="border-gray-200 p-4">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-gray-700 mb-2 block text-sm font-medium">
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
                      {selectedMaterials.length > 0
                        ? `${selectedMaterials.length} material(s) selected`
                        : 'Select materials...'}
                    </span>
                    <FiPlus
                      className={`transform transition-transform ${isDropdownOpen ? 'rotate-45' : ''}`}
                    />
                  </button>
                  {selectedMaterials.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedMaterials.map((material) => (
                        <span
                          key={material.id}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {material.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(material.id)}
                            className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:bg-form-input">
                      <div className="p-2">
                        {filteredMaterials.length === 0 ? (
                          <div className="text-gray-500 px-3 py-2 text-sm">
                            {availableMaterials.length === 0
                              ? 'No materials available'
                              : 'No materials in this category'}
                          </div>
                        ) : (
                          filteredMaterials.map((material) => (
                            <label
                              key={material.id}
                              className="hover:bg-gray-50 flex cursor-pointer items-center rounded px-3 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMaterials.some(
                                  (m) => m.id === material.id,
                                )}
                                onChange={() =>
                                  handleMaterialToggle(material.id)
                                }
                                className="border-gray-300 dark:border-gray-900 dark:bg-gray-900 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                              />
                              <span className="text-gray-700 ml-3 text-sm">
                                {material.name}
                                <span className="text-gray-500 ml-2 text-xs">
                                  ({material.category?.name || 'Uncategorized'})
                                  • {material.unit} • ₹{material.amount}
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

          {selectedMaterials.length > 0 ? (
            <div className="space-y-4">
              <GroupedGenericTable
                data={selectedMaterials}
                columns={tableColumns}
                title={`Selected Materials (${selectedMaterials.length})`}
                searchAble={false}
                paginationOff={true}
              />
            </div>
          ) : (
            <div className="rounded-lg border py-8 text-center">
              <p className="text-gray-500">
                No materials selected for this purchase order.
              </p>
              <p className="text-gray-400 mt-2 text-sm">
                Use the dropdown above to add materials to this purchase order.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="submit"
              disabled={isUpdating || selectedMaterials.length === 0}
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
            >
              <FiSave className="h-4 w-4" />
              {isUpdating ? 'Updating...' : 'Update Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatedCustom;
