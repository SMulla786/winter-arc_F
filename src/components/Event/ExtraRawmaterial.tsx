/*eslint-disable*/
import React, {useState} from 'react';
import z from 'zod';
import {useForm, FormProvider} from 'react-hook-form';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useAddNewRawMaterialForSubevent,
  useAddRawMaterialForSubevent,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAuthContext} from '@/context/AuthContext';
import {Route as EventRoute} from '@/routes/_app/_event/events.$id';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';
import toast from 'react-hot-toast';

const rawMaterialValidationSchema = z.object({
  materials: z
    .array(
      z.object({
        rawMaterialId: z.string().min(1, 'Raw material is required'),
        name: z.string().min(1, 'Name is required'),
        unit: z.string().min(1, 'Unit is required'),
        categoryId: z.string().min(1, 'Category is required'),
        quantity: z.number().min(0, 'Quantity must be positive'),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof rawMaterialValidationSchema>;

interface SelectedMaterial {
  rawMaterialId: string;
  name: string;
  unit: string;
  categoryId: string;
  quantity: number;
  totalQty: number;
  inventoryValue: number;
}

interface ExtraRawmaterialProps {
  onSuccess?: () => void;
  existingMaterialData?: Set<string>;
}

const ExtraRawmaterial = ({
  onSuccess,
  existingMaterialData = new Set(),
}: ExtraRawmaterialProps) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialOrder;
  const role = user?.role;
  const {id: eventId} = EventRoute.useParams();

  const methods = useForm<FormValues>({
    defaultValues: {
      materials: [],
    },
  });

  const {mutateAsync: addRawMaterial} = useAddRawMaterialForSubevent();
  const {mutateAsync: addNewRawMaterial} = useAddNewRawMaterialForSubevent();
  const {data: rawMaterialsData} = useGetRawMaterialsCateror();

  const [extraInputs, setExtraInputs] = useState<{
    [key: string]: {totalQty: number; inventoryValue: number};
  }>({});

  const rawMaterials = rawMaterialsData?.data?.rawMaterials || [];
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [quantityInputs, setQuantityInputs] = useState<{[key: string]: number}>(
    {},
  );

  // Filter out materials that already exist in the main table
  const filteredRawMaterials = rawMaterials.filter((material) => {
    const materialName = material.name?.toLowerCase().trim();
    const materialId = material.id;
    const rawMaterialId = material.rawMaterialId;

    // Check if material name or ID exists in the main table
    return (
      !existingMaterialData.has(materialName) &&
      !existingMaterialData.has(materialId) &&
      !existingMaterialData.has(rawMaterialId)
    );
  });

  const groupedRawMaterials = filteredRawMaterials.reduce(
    (acc, material) => {
      const categoryName = material.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(material);
      return acc;
    },
    {} as {[key: string]: any[]},
  );

  // Sort categories and materials within categories
  const sortedCategories = Object.keys(groupedRawMaterials).sort();
  sortedCategories.forEach((category) => {
    groupedRawMaterials[category].sort((a, b) =>
      a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}),
    );
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleQuantityInputChange = (materialId: string, quantity: string) => {
    const numQuantity = parseFloat(quantity) || 0;
    setQuantityInputs((prev) => ({
      ...prev,
      [materialId]: numQuantity,
    }));

    // Automatically add/update material in selection when quantity changes
    if (numQuantity > 0) {
      // Use current extras if any
      const extras = extraInputs[materialId] ?? {
        totalQty: 0,
        inventoryValue: 0,
      };
      handleQuantityChange(materialId, numQuantity, extras);
    } else {
      // Remove from selection if quantity is 0
      setSelectedMaterials((prev) =>
        prev.filter((item) => item.rawMaterialId !== materialId),
      );
    }
  };

  const handleQuantityChange = (
    materialId: string,
    quantity: number,
    extras?: {totalQty?: number; inventoryValue?: number},
  ) => {
    const material = filteredRawMaterials.find((rm) => rm.id === materialId);
    if (!material) return;

    const totalQtyValue =
      extras?.totalQty ?? extraInputs[materialId]?.totalQty ?? 0;
    const inventoryValueValue =
      extras?.inventoryValue ?? extraInputs[materialId]?.inventoryValue ?? 0;

    setSelectedMaterials((prev) => {
      // Remove if quantity is 0 or empty
      if (!quantity || quantity === 0) {
        return prev.filter((item) => item.rawMaterialId !== materialId);
      }

      // Update or add material
      const existingIndex = prev.findIndex(
        (item) => item.rawMaterialId === materialId,
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity,
          totalQty: totalQtyValue,
          inventoryValue: inventoryValueValue,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            rawMaterialId: materialId,
            name: material.name,
            unit: material.unit,
            categoryId: material.category?.id || material.categoryId,
            quantity,
            totalQty: totalQtyValue,
            inventoryValue: inventoryValueValue,
          },
        ];
      }
    });
  };

  const handleExtraInputChange = (
    materialId: string,
    field: 'totalQty' | 'inventoryValue',
    value: string,
  ) => {
    const numValue = parseFloat(value) || 0;

    // Build next extras object for this material
    const nextForMaterial = {
      totalQty: extraInputs[materialId]?.totalQty ?? 0,
      inventoryValue: extraInputs[materialId]?.inventoryValue ?? 0,
      ...(field === 'totalQty' ? {totalQty: numValue} : {}),
      ...(field === 'inventoryValue' ? {inventoryValue: numValue} : {}),
    };

    // Update state
    setExtraInputs((prev) => ({
      ...prev,
      [materialId]: nextForMaterial,
    }));

    // Also ensure selectedMaterials is updated (if order quantity > 0)
    const currentOrderQty =
      quantityInputs[materialId] ??
      selectedMaterials.find((s) => s.rawMaterialId === materialId)?.quantity ??
      0;

    if (currentOrderQty > 0) {
      handleQuantityChange(materialId, currentOrderQty, nextForMaterial);
    } else {
      // If orderQty is 0, we don't add to selectedMaterials — but we still keep extras in extraInputs
      // (This mirrors your earlier behavior where quantity drives whether a material is "selected")
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (selectedMaterials.length === 0) {
        toast.error('Please select materials and enter quantities');
        return;
      }

      // Process each selected material
      const submissionResults: any[] = [];

      for (const material of selectedMaterials) {
        try {
          const existing = filteredRawMaterials.find(
            (rm) => rm.id === material.rawMaterialId,
          );

          let rawMaterialId = existing?.id;

          // If material doesn't exist in system, create it first
          if (!rawMaterialId) {
            console.log('Creating new raw material:', material.name);
            const newMaterialResponse = await addNewRawMaterial({
              subeventId: eventId || '',
              name: material.name,
              unit: material.unit as any,
              categoryId: material.categoryId,
              amount: 0,
              quantity: material.quantity,
            });
            // Get the ID from the response if available
            rawMaterialId =
              newMaterialResponse?.data?.id || material.rawMaterialId;
          }

          if (!rawMaterialId) {
            console.error('Raw material ID missing for:', material.name);
            submissionResults.push({
              material: material.name,
              success: false,
              error: 'missing_raw_material_id',
            });
            continue;
          }

          // Send exact structure you requested:
          // { rawMaterialId, quantity, totalQty, inventoryValue }
          const result = await addRawMaterial({
            subeventId: eventId || '',
            rawMaterialId,
            quantity: material.quantity,
            totalQty: material.totalQty,
            inventoryValue: material.inventoryValue,
          });

          submissionResults.push({
            material: material.name,
            success: true,
            result,
          });
        } catch (error) {
          console.error(`Failed to process material ${material.name}:`, error);
          submissionResults.push({
            material: material.name,
            success: false,
            error,
          });
        }
      }

      // call parent success handler
      onSuccess?.();

      // Clear selected materials and inputs after successful submission
      setSelectedMaterials([]);
      setQuantityInputs({});
      setExtraInputs({});

      // Optionally show toast
      toast.success('Materials added successfully');
      console.log('Submission results:', submissionResults);
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Submission failed. Check console for details.');
    }
  };

  const getQuantityForMaterial = (materialId: string): number => {
    // First check if we have a manually entered quantity
    if (quantityInputs[materialId] !== undefined) {
      return quantityInputs[materialId];
    }

    // Then check if it's in selected materials
    const material = selectedMaterials.find(
      (item) => item.rawMaterialId === materialId,
    );
    return material?.quantity || 0;
  };

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 rounded-t-lg"
        >
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            <h1 className="col-span-12 mb-4 w-full bg-blue-100 p-4 text-lg font-semibold text-black dark:bg-meta-4 dark:text-white">
              Raw Material
            </h1>
          </div>

          {/* Raw Materials Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="dark:bg-gray-700 bg-indigo-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">
                    Name
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">
                    Inventory
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">
                    Total Qty
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">
                    Order Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">
                    Inventory Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-boxdark">
                {sortedCategories.map((category) => (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer bg-neutral-100 dark:bg-meta-4"
                      onClick={() => toggleCategory(category)}
                    >
                      <td
                        colSpan={6}
                        className="bg-neutral-50 px-4 py-3 font-semibold text-black dark:bg-boxdark"
                      >
                        <div className="dark:bg-gray-900 flex items-center dark:text-white">
                          <span className="mr-2">
                            {expandedCategories[category] ? (
                              <FaAngleDown />
                            ) : (
                              <FaAngleRight />
                            )}
                          </span>
                          {category}
                        </div>
                      </td>
                    </tr>

                    {/* Material Rows */}
                    {expandedCategories[category] &&
                      groupedRawMaterials[category].map((material) => (
                        <tr
                          key={material.id}
                          className="bg-white hover:bg-blue-50 dark:bg-boxdark dark:hover:bg-meta-4"
                        >
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            {material?.name}
                          </td>

                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            {material?.inventory ?? '-'}
                          </td>

                          {/* TOTAL QTY */}
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={extraInputs[material.id]?.totalQty ?? 0}
                              onChange={(e) =>
                                handleExtraInputChange(
                                  material.id,
                                  'totalQty',
                                  e.target.value,
                                )
                              }
                              placeholder="Total Qty"
                              className="w-32 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                            />
                          </td>

                          {/* ORDER QUANTITY */}
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="Enter quantity"
                              className="w-32 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                              value={getQuantityForMaterial(material.id)}
                              onChange={(e) => {
                                const quantity =
                                  parseFloat(e.target.value) || 0;
                                handleQuantityInputChange(
                                  material.id,
                                  e.target.value,
                                );
                              }}
                            />
                            <span className="text-gray-600 dark:text-gray-300 ml-2 min-w-[80px] whitespace-nowrap text-sm">
                              {material?.unit}
                            </span>
                          </td>

                          {/* INVENTORY VALUE */}
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={
                                extraInputs[material.id]?.inventoryValue ?? 0
                              }
                              onChange={(e) =>
                                handleExtraInputChange(
                                  material.id,
                                  'inventoryValue',
                                  e.target.value,
                                )
                              }
                              placeholder="Inventory Value"
                              className="w-32 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                            />
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}

                {sortedCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-gray-500 dark:text-gray-400 px-4 py-4 text-center text-sm"
                    >
                      {rawMaterials.length > 0
                        ? 'All materials are already added to the main list'
                        : 'No raw materials available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Submit Button and Selected Materials Info */}
          <div className="flex items-center justify-between">
            <div>
              {selectedMaterials.length > 0 && (
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  <strong>
                    Selected materials: {selectedMaterials.length}
                  </strong>
                  <div className="mt-1 max-h-40 overflow-y-auto">
                    {selectedMaterials.map((material) => (
                      <div key={material.rawMaterialId} className="text-xs">
                        {material.name}: {material.quantity} {material.unit} —
                        Total Qty: {material.totalQty} — Inventory Value:{' '}
                        {material.inventoryValue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(role === 'CATEROR' || restriction === 'EDIT') && (
              <GenericButton
                type="submit"
                disabled={selectedMaterials.length === 0}
              >
                Add Selected Materials ({selectedMaterials.length})
              </GenericButton>
            )}
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default ExtraRawmaterial;
