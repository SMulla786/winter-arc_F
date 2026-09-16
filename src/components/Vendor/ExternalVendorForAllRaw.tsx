/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {vendorSchema} from '@/lib/validation/vendorSchema';
import {
  useGetAllRawMaterialVendor,
  useGetPostRawMaterialVendor,
  useGetRawMaterialVendor,
  usePostRawMaterialFromVendor,
} from '@/lib/react-query/queriesAndMutations/cateror/external';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericTextArea from '@/components/Forms/TextArea/GenericTextArea';
import DarkModeToggle from './ExVendor/DarkModeToggle';
import {useAuthContext} from '@/context/AuthContext';
import {useSearch} from '@tanstack/react-router';
import {Route} from '@/routes/allexternalvendor.$name.$id';

type FormValues = z.infer<typeof vendorSchema>;
type RawMaterialItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  inventoryOrder: number;
  rawmaterial: {
    id: string;
    name: string;
    unit: string;
    inventory: number;
    amount: number;
    category: {
      id: string;
      name: string;
    };
  };
};

const ExternalVendorForAllRaw: React.FC = () => {
  const paramsData = Route.useParams();
  const search = useSearch({
    from: '/allexternalvendor/$name/$id',
  });
  const {user} = useAuthContext();
  const categoryIds = search.categories ? search.categories.split(',') : [];
  const {data: rawMaterials} = useGetRawMaterialVendor(paramsData.id);
  console.log('all vender raw', rawMaterials);
  const {mutate: postRawMaterial} = usePostRawMaterialFromVendor();

  console.log(rawMaterials);
  const methods = useForm<FormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      fullname: '',
      phoneNumber: '',
      address: '',
    },
  });

  const [prices, setPrices] = useState<{[key: string]: number}>({});
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});

  const handlePriceChange = (id: string, value: number) => {
    setPrices((prev) => ({...prev, [id]: value}));
  };

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities((prev) => ({...prev, [id]: value}));
  };

  const onSubmit = async (data: FormValues) => {
    console.log('submit data', data);
    const formattedData = {
      name: data.fullname,
      phone: data.phoneNumber,
      address: data.address,
      RMlistId: paramsData.id,
      rawMaterials:
        rawMaterials?.vendorData.map((item: RawMaterialItem) => ({
          rawMaterialId: item.rawmaterial.id,
          quantity: item.quantity,
          unit: item?.rawmaterial?.unit,
          price: prices[item.id] ?? 0,
        })) ?? [],
    };
    postRawMaterial(formattedData);
    methods.reset();
    setPrices({});
  };

  const groupByCategory = (rawMaterials: any[]) => {
    if (!rawMaterials) return {};

    return rawMaterials.reduce((acc, item) => {
      const categoryName = item.rawmaterial?.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {});
  };

  const groupedMaterials = React.useMemo(() => {
    if (!rawMaterials?.vendorData) return {};

    let filteredMaterials = rawMaterials.vendorData;

    // ✅ If category IDs exist in search params → filter by them
    if (categoryIds.length > 0) {
      filteredMaterials = filteredMaterials.filter((item: any) =>
        categoryIds.includes(item.rawmaterial?.category?.id),
      );
    }

    return groupByCategory(filteredMaterials);
  }, [rawMaterials, categoryIds]);

  return (
    <div className="relative mx-auto max-w-4xl bg-white px-2 pt-3 dark:bg-black md:px-4">
      <DarkModeToggle />

      {/* Printable Content */}
      <div className="print-section">
        {/* Company Header - Compact */}
        <div className="relative mb-4 rounded-md bg-[#9aad7d] p-3 text-white">
          <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 flex justify-center sm:mb-0">
              <img
                src={rawMaterials?.cateror?.image}
                alt="Company Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
            <div className="text-center sm:text-right">
              <h1 className="font-croissant text-lg font-extrabold text-[#222529]">
                {rawMaterials?.cateror?.user?.fullname || user?.fullname}
              </h1>
              <p className="mt-0.5 font-croissant text-xs text-white">
                {rawMaterials?.cateror?.user?.email || user?.email}
              </p>
              <p className="font-croissant text-xs text-white">
                {rawMaterials?.cateror?.address || user?.address}
              </p>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="dark:bg-gray-900 space-y-4 rounded-md p-3"
          >
            {/* Vendor Details */}
            <div className="rounded-md bg-slate-50 p-3 dark:bg-meta-4">
              <h1 className="mb-2 text-lg font-semibold dark:text-white">
                Vendor Details
              </h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GenericInputField
                  name="fullname"
                  label="Full Name"
                  placeholder="Enter your Full Name"
                />
                <GenericInputField
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="Enter the Phone Number"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <GenericTextArea
                  name="address"
                  label="Residential Address"
                  placeholder="Enter the Residential Address"
                />
              </div>
            </div>

            <div className="mt-4">
              {Object.entries(groupedMaterials).length === 0 ? (
                <p className="text-gray-500 py-3 text-center text-sm dark:text-white">
                  No raw materials found.
                </p>
              ) : (
                Object.entries(groupedMaterials).map(([category, items]) => (
                  <div
                    key={category}
                    className="rounded-md bg-slate-50 p-3 dark:bg-meta-4"
                  >
                    <h2 className="text-md mb-2 rounded bg-slate-200 px-2 py-1 font-semibold dark:bg-meta-3 dark:text-white">
                      {category}
                    </h2>

                    {/* Desktop/Tablet View */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-full">
                        <colgroup>
                          <col className="w-8/12" />
                          <col className="w-1/12" />
                          <col className="w-1/12" />
                          <col className="w-2/12" />
                        </colgroup>
                        <thead>
                          <tr className="bg-[#e1ebd3] dark:bg-meta-4">
                            <th className="p-2 text-left text-xl font-medium dark:text-white">
                              Material
                            </th>
                            <th className="p-2 text-center text-xl font-medium dark:text-white">
                              Qty
                            </th>
                            <th className="p-2 text-center text-xl font-medium dark:text-white">
                              Unit
                            </th>
                            <th className="p-2 text-xl font-medium dark:text-white">
                              Price
                            </th>
                            <th className="p-2 text-right text-xl font-medium dark:text-white"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(items as RawMaterialItem[]).map((item) => (
                            <tr
                              key={item.id}
                              className="border-gray-200 hover:bg-gray-100 dark:border-gray-700 border-b odd:bg-neutral-50 even:bg-white dark:odd:bg-meta-3 dark:even:bg-meta-4 dark:hover:bg-meta-3"
                            >
                              <td className="truncate p-2 text-sm dark:text-white">
                                {item?.rawmaterial?.name}
                              </td>
                              <td className="p-2 text-center text-sm dark:text-white">
                                {item.quantity}
                              </td>
                              <td className="p-2 text-center text-sm dark:text-white">
                                {item?.rawmaterial?.unit}
                              </td>
                              <td className="p-2">
                                <input
                                  className="w-full rounded border-[1.7px] border-stroke bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                  type="number"
                                  placeholder="Enter Price"
                                  value={prices[item.id] ?? ''}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </td>
                              <td className="dark:text-gray-300 whitespace-nowrap p-1 text-xs">
                                per {item?.rawmaterial?.unit?.toLowerCase()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="space-y-2 md:hidden">
                      {(items as RawMaterialItem[]).map((item) => (
                        <div
                          key={item.id}
                          className="border-gray-200 dark:border-gray-700 border-b p-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium dark:text-white">
                                {item.name}
                              </span>
                              <span className="text-sm dark:text-white">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              <input
                                className="w-24 rounded border px-2 py-1 text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                type="number"
                                placeholder="Price"
                                value={prices[item.id] ?? ''}
                                onChange={(e) =>
                                  handlePriceChange(
                                    item.id,
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Buttons */}
            <div className="no-print mb-4 flex justify-end space-x-4">
              <GenericButton type="submit">Save</GenericButton>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ExternalVendorForAllRaw;
