/*eslint-disable*/
import React, {useEffect, useMemo, useState} from 'react';
import {z} from 'zod';
import {useForm, FormProvider, useWatch} from 'react-hook-form';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericSearchDropdown from '@/components/Forms/SearchDropDown/GenericSearchDropdown';
import {
  useAddNewRawMaterialForSubevent,
  useAddRawMaterialForSubevent,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAuthContext} from '@/context/AuthContext';
import {
  useAddExtraRawMaterial,
  useGetAllEventsWithSubEvents,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';
import toast from 'react-hot-toast';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';

const rawMaterialValidationSchema = z.object({
  subEventId: z.string().min(1, 'Sub-event is required'),
  name: z.string().min(1, 'Raw material name is required').max(100),
  unit: z.enum(['BOTTLE', 'GRAM', 'KILOGRAM', 'LITRE', 'PIECE', 'METER']),
  rawMaterialCategory: z.string().min(1, 'Raw material category is required'),
  quantity: z
    .number()
    .positive({message: 'Quantity must be a positive number'}),
  rawMaterial: z.string().min(1, 'Raw material is required'),
});

type FormValues = z.infer<typeof rawMaterialValidationSchema>;

interface ExtraRawmaterialOrderProps {
  onSuccess?: () => void;
  subEventIds: string[];
}

const ExtraRawmaterialOrder: React.FC<ExtraRawmaterialOrderProps> = ({
  onSuccess,
  subEventIds,
}) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialOrder;
  const role = user?.role;

  const methods = useForm<FormValues>({
    defaultValues: {
      subEventId: '',
      rawMaterial: '',
      name: '',
      rawMaterialCategory: '',
      unit: 'GRAM',
      quantity: 0,
    },
  });

  const {mutateAsync: addRawMaterial} = useAddExtraRawMaterial();
  const {mutateAsync: addNewRawMaterial} = useAddNewRawMaterialForSubevent();
  const {data: rawMaterialsData} = useGetRawMaterialsCateror();
  const {data: eventsData} = useGetAllEventsWithSubEvents();

  const rawMaterials = rawMaterialsData?.data?.rawMaterials || [];
  const [filteredRawMaterials, setFilteredRawMaterials] =
    useState<any[]>(rawMaterials);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [quantityInputs, setQuantityInputs] = useState<{[key: string]: number}>(
    {},
  );
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);

  const selectedCategory = useWatch({
    control: methods.control,
    name: 'rawMaterialCategory',
  });

  const selectedRawMaterialId = useWatch({
    control: methods.control,
    name: 'rawMaterial',
  });

  // Get sub-event options
  const subEventOptions = useMemo(() => {
    if (!eventsData?.data) return [];
    return eventsData.data
      .flatMap((event) => event.subEvents || [])
      .filter((subEvent) => subEventIds.includes(subEvent.id))
      .map((subEvent) => ({
        value: subEvent.id,
        label: subEvent.name,
      }));
  }, [eventsData, subEventIds]);

  // Filter raw materials based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = rawMaterials.filter(
        (rm) =>
          rm.category?.id === selectedCategory ||
          rm.categoryId === selectedCategory,
      );
      setFilteredRawMaterials(filtered);
    } else {
      setFilteredRawMaterials(rawMaterials);
    }
  }, [selectedCategory, rawMaterials]);

  // Set category and unit when raw material is selected
  useEffect(() => {
    if (!selectedRawMaterialId) return;

    const selected = rawMaterials.find((rm) => rm.id === selectedRawMaterialId);
    if (selected) {
      methods.setValue('name', selected.name || '');
      methods.setValue('unit', selected.unit || 'GRAM');
      methods.setValue(
        'rawMaterialCategory',
        selected.category?.id || selected.categoryId || '',
      );
    }
  }, [selectedRawMaterialId, rawMaterials, methods]);

  // Group raw materials by category for table display
  const groupedRawMaterials = useMemo(() => {
    return filteredRawMaterials.reduce(
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
  }, [filteredRawMaterials]);

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
      handleQuantityChange(materialId, numQuantity);
    } else {
      // Remove from selection if quantity is 0
      setSelectedMaterials((prev) =>
        prev.filter((item) => item.rawMaterialId !== materialId),
      );
    }
  };

  const handleQuantityChange = (materialId: string, quantity: number) => {
    const material = filteredRawMaterials.find((rm) => rm.id === materialId);
    if (!material) return;

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
            subEventId: methods.getValues('subEventId'),
          },
        ];
      }
    });
  };

  const getQuantityForMaterial = (materialId: string): number => {
    if (quantityInputs[materialId] !== undefined) {
      return quantityInputs[materialId];
    }
    const material = selectedMaterials.find(
      (item) => item.rawMaterialId === materialId,
    );
    return material?.quantity || 0;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const submissionResults = [];

      for (const material of selectedMaterials) {
        try {
          const existing = filteredRawMaterials.find(
            (rm) => rm.id === material.rawMaterialId,
          );
          let rawMaterialId = existing?.id;
          if (!rawMaterialId) {
            const newMaterialResponse = await addNewRawMaterial({
              subeventId: material.subEventId,
              name: material.name,
              unit: material.unit,
              categoryId: material.categoryId,
              amount: 0,
              quantity: material.quantity,
            });
            rawMaterialId =
              newMaterialResponse?.data?.id || material.rawMaterialId;
          }

          if (!rawMaterialId) {
            console.error('Raw material ID missing for:', material.name);
            continue;
          }

          const result = await addRawMaterial({
            subeventId: material.subEventId,
            rawMaterialId,
            quantity: material.quantity,
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

      toast.success('Raw materials added successfully!');
      onSuccess?.();
      methods.reset({
        subEventId: '',
        rawMaterial: '',
        name: '',
        rawMaterialCategory: '',
        unit: 'GRAM',
        quantity: 0,
      });
      setSelectedMaterials([]);
      setQuantityInputs({});
      setExpandedCategories({});
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Failed to add raw materials');
    }
  };

  const categoryOptions = Array.from(
    new Map(
      rawMaterials.map((rm: any) => [
        rm.category?.id || rm.categoryId,
        {
          value: rm.category?.id || rm.categoryId || '',
          label: rm.category?.name || 'Uncategorized',
        },
      ]),
    ).values(),
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-2 w-full bg-blue-100 p-3 text-lg font-semibold text-black dark:bg-meta-4">
            Add Extra Raw Material
          </h1>
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {selectedMaterials.length > 0 && (
                <span>
                  <strong>
                    Selected: {selectedMaterials.length} materials
                  </strong>
                </span>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="w-1/4 px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                    Category
                  </th>
                  <th className="w-2/4 px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                    Raw Material
                  </th>
                  <th className="w-1/4 px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                    Unit
                  </th>
                  <th className="w-1/4 px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-boxdark">
                {sortedCategories.map((category) => (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr
                      className="bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:bg-meta-4"
                      onClick={() => toggleCategory(category)}
                    >
                      <td
                        colSpan={4}
                        className="px-4 py-3 font-semibold text-black dark:text-white"
                      >
                        <div className="flex items-center">
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
                            {/* Empty for alignment */}
                          </td>
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            {material.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            {material.unit}
                          </td>
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
                              onBlur={(e) => {
                                const quantity =
                                  parseFloat(e.target.value) || 0;
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}

                {sortedCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-gray-500 dark:text-gray-400 px-4 py-4 text-center text-sm"
                    >
                      {rawMaterials.length > 0
                        ? 'No materials available for selected category'
                        : 'No raw materials available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bulk Add Button */}
          {(role === 'CATEROR' || restriction === 'EDIT') &&
            selectedMaterials.length > 0 && (
              <div className="mt-4 flex justify-end">
                <GenericButton
                  type="button"
                  onClick={() => {
                    const formData = methods.getValues();

                    const updatedMaterials = selectedMaterials.map(
                      (material) => ({
                        ...material,
                        subEventId: formData.subEventId,
                      }),
                    );

                    setSelectedMaterials(updatedMaterials);

                    // Trigger form submission
                    methods.handleSubmit(onSubmit)();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Selected Materials ({selectedMaterials.length})
                </GenericButton>
              </div>
            )}
        </div>

        {selectedMaterials.length > 0 && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
              Selected Materials Preview:
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {selectedMaterials.map((material) => (
                <div
                  key={material.rawMaterialId}
                  className="rounded border border-blue-300 bg-white px-3 py-2 text-sm dark:border-blue-600 dark:bg-meta-4"
                >
                  <div className="font-medium text-black dark:text-white">
                    {material.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {material.quantity} {material.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default ExtraRawmaterialOrder;
