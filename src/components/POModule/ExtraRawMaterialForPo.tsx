/* eslint-disable  */
import {
  useAddExtraRawMaterialPo,
  useGetAllRawForExternalPo,
  useGetRawMaterialsByDate,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {rawMaterialValidationSchema} from '@/lib/validation/dishSchemas';
import React, {useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
type FormValues = z.infer<typeof rawMaterialValidationSchema>;
type FormattedRemainingRaw = {
  category: string | undefined;
  id: string | undefined;
  inventory: number | undefined;
  maharaj: string;
  name: string | undefined;
  subEvent: string;
  unit: string | undefined;
};
interface ExtraRawProps {
  data: FormattedRemainingRawList;
  rawListId: string;
}
type FormattedRemainingRawList = FormattedRemainingRaw[];

const ExtraRawMaterialForPo: React.FC<ExtraRawProps> = ({data, rawListId}) => {
  const {data: rawMaterialsData} = useGetRawMaterialsCateror();
  const {mutateAsync: addExtraRaw} = useAddExtraRawMaterialPo();
  console.log('props data', data);
  console.log('all raw list', rawMaterialsData);

  const methods = useForm<FormValues>({
    defaultValues: {
      materials: [],
    },
  });
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  const groupedRawMaterials = data?.reduce(
    (acc, material) => {
      const categoryName = material.category || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(material);
      return acc;
    },
    {} as {[key: string]: any[]},
  );
  console.log('groupeddd', groupedRawMaterials);
  const watchMaterials = methods.watch('materials');

  const hasEnteredAnyValue = Object.values(watchMaterials ?? {}).some(
    (m: any) =>
      Number(m?.quantity) > 0 ||
      Number(m?.totalQty) > 0 ||
      Number(m?.inventoryValue) > 0,
  );

  const handleSubmit = async (data: FormValues) => {
    console.log('submit payload', data);
    try {
      const filtered = data?.materials?.filter((m) => {
        const qty = Number(m.quantity ?? 0);
        const total = Number(m.totalQty ?? 0);
        const inv = Number(m.inventoryValue ?? 0);

        return (
          (qty !== null && qty !== undefined && qty !== 0) ||
          (total !== null && total !== undefined && total !== 0) ||
          (inv !== null && inv !== undefined && inv !== 0)
        );
      });

      if (filtered.length === 0) {
        console.log('No valid materials entered');
        return;
      }

      const payload = filtered.map((m) => ({
        rawMaterialId: m.rawMaterialId,
        quantity: Number(m.quantity ?? 0),
        totalQty: Number(m.totalQty ?? 0),
        inventoryValue: Number(m.inventoryValue ?? 0),
        rawMaterialListId: rawListId,
        unit: m?.unit,
      }));

      await addExtraRaw({materials: payload});
      methods.reset();
    } catch (error) {
      console.error('Error adding raw material:', error);
    }
  };

  let rowIndex = 0;

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="space-y-8 rounded-t-lg"
        >
          <div className="overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
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
                {Object.keys(groupedRawMaterials ?? {}).map((categoryName) => (
                  <React.Fragment key={categoryName}>
                    {/* Category Row */}
                    <tr
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer bg-neutral-100 dark:bg-meta-4"
                      onClick={() => toggleCategory(categoryName)}
                    >
                      <td
                        colSpan={6}
                        className="bg-neutral-50 px-4 py-3 font-semibold text-black dark:bg-meta-4 dark:text-white"
                      >
                        <div className="flex items-center dark:border-stroke dark:bg-meta-4 dark:text-white">
                          <span className="mr-2">
                            {expandedCategories[categoryName] ? (
                              <FaAngleDown />
                            ) : (
                              <FaAngleRight />
                            )}
                          </span>
                          {categoryName}
                        </div>
                      </td>
                    </tr>

                    {/* Materials List */}
                    {expandedCategories[categoryName] &&
                      groupedRawMaterials[categoryName].map((material) => {
                        const flatIndex = rowIndex++; // PURE NUMBER ✔

                        return (
                          <tr key={material.id}>
                            {/* NAME */}
                            <td>
                              {material.name}
                              <input
                                type="hidden"
                                {...methods.register(
                                  `materials.${flatIndex}.rawMaterialId`,
                                )}
                                value={material.id}
                              />
                            </td>

                            <td>{material.inventory ?? '-'}</td>

                            {/* TOTAL QTY */}
                            <td className="px-4 py-2 text-sm text-black dark:text-white">
                              <input
                                type="number"
                                defaultValue={0}
                                {...methods.register(
                                  `materials.${flatIndex}.totalQty`,
                                  {
                                    valueAsNumber: true,
                                  },
                                )}
                                className="w-32 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                              />
                            </td>

                            {/* QUANTITY */}
                            <td className="px-4 py-2 text-sm text-black dark:text-white">
                              <input
                                type="number"
                                defaultValue={0}
                                {...methods.register(
                                  `materials.${flatIndex}.quantity`,
                                  {
                                    valueAsNumber: true,
                                  },
                                )}
                                className="w-32 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                              />
                              <span className="text-gray-600 dark:text-gray-300 min-w-[40px] whitespace-nowrap px-1 text-sm">
                                {material?.unit}
                              </span>
                            </td>

                            {/* INVENTORY VALUE */}
                            {/* INVENTORY VALUE */}
                            <td className="px-4 py-2 text-sm text-black dark:text-white">
                              <input
                                type="number"
                                defaultValue={0}
                                max={material.inventory || 0} // Add max attribute
                                {...methods.register(
                                  `materials.${flatIndex}.inventoryValue`,
                                  {
                                    valueAsNumber: true,
                                    max: {
                                      value: material.inventory || 0,
                                      message: `Cannot exceed inventory of ${material.inventory}`,
                                    },
                                  },
                                )}
                                className="w-32 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                onInput={(e) => {
                                  // Client-side validation to prevent entering values greater than inventory
                                  const maxValue = material.inventory || 0;
                                  const inputValue =
                                    parseInt(e.currentTarget.value) || 0;
                                  if (inputValue > maxValue) {
                                    e.currentTarget.value = maxValue.toString();
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                ))}

                {data?.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-gray-500 dark:text-gray-400 px-4 py-4 text-center text-sm"
                    >
                      No raw materials available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end">
            <GenericButton type="submit" disabled={!hasEnteredAnyValue}>
              Add Extra Material
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default ExtraRawMaterialForPo;
