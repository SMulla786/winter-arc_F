/* eslint-disable */
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import GenericButton from '../Forms/Buttons/GenericButton';
import {FiSave} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from '../Loader/Loader';
import {
  useGetMasterCutlery,
  useGetMasterCutleryById,
  useSaveMasterCutlery,
} from '@/lib/api/cateror/cutlerymaster';
import {toast} from 'react-hot-toast';

interface UtensilFormData {
  id: string;
  categoryId: string;
  name: string;
  inventory: number;
}

interface FormValues {
  utensils: UtensilFormData[];
}

const CutleryMaster: React.FunctionComponent = () => {
  const {user} = useAuthContext();
  const [selectedUtensilId, setSelectedUtensilId] = useState<string>('');

  // Get languageId from localStorage or use default
  const languageId = localStorage.getItem('languageId') || 'defaultLanguageId';

  // Fetch all utensils data
  const {
    data: utensilsApiData,
    isPending: isLoadingUtensils,
    error,
    refetch,
  } = useGetMasterCutlery(languageId);

  // Fetch specific utensil by ID (example usage)
  const {
    data: singleUtensilData,
    isPending: isLoadingSingleUtensil,
    error: singleUtensilError,
  } = useGetMasterCutleryById(selectedUtensilId);

  console.log('Single utensil data:', singleUtensilData);

  // Extract utensils data from the API response
  const utensilsData = utensilsApiData?.data || [];

  // Initialize form
  const methods = useForm<FormValues>({
    defaultValues: {
      utensils: [],
    },
  });

  const {reset, handleSubmit, watch, register, control} = methods;
  const {fields} = useFieldArray({
    name: 'utensils',
    control,
  });

  // Watch all utensil inventories for real-time updates
  const watchedUtensils = watch('utensils');

  // Reset form with inventory values when utensils data changes
  useEffect(() => {
    if (utensilsData.length > 0) {
      // Initialize form with inventory values
      const initialUtensils: UtensilFormData[] = utensilsData.map(
        (utensil: any) => ({
          id: utensil.id || '',
          categoryId: utensil.categoryId || '',
          name: utensil.name || '',
          inventory: utensil.inventory || 0,
        }),
      );

      reset({
        utensils: initialUtensils,
      });
    }
  }, [utensilsData, reset]);

  // Create a map of utensil ID to form index for easy lookup
  const utensilIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    watchedUtensils?.forEach((utensil: UtensilFormData, index: number) => {
      if (utensil.id) {
        map[utensil.id] = index;
      }
    });
    return map;
  }, [watchedUtensils]);

  // Group utensils by category
  const groupedUtensils = useMemo(() => {
    if (!utensilsData.length) return {};

    return utensilsData.reduce((acc: Record<string, any[]>, utensil: any) => {
      if (!acc[utensil.categoryId]) {
        acc[utensil.categoryId] = [];
      }

      // Find field index by utensil ID from the map
      const fieldIndex = utensilIndexMap[utensil.id];

      // Get current inventory from form or use inventory
      const currentInventory =
        fieldIndex !== undefined &&
        watchedUtensils?.[fieldIndex]?.inventory !== undefined
          ? watchedUtensils[fieldIndex].inventory
          : utensil.inventory || 0;

      acc[utensil.categoryId].push({
        ...utensil,
        currentInventory,
        fieldIndex,
      });
      return acc;
    }, {});
  }, [utensilsData, utensilIndexMap, watchedUtensils]);

  // Save mutation
  const {mutate: saveInventory, isPending: isSaving} = useSaveMasterCutlery();

  const onSubmit = async (data: FormValues) => {
    console.log('Form data on submit:', data);

    // Check if we have valid items
    if (!data.utensils || data.utensils.length === 0) {
      toast.error('No utensils data to save');
      return;
    }

    // Create utensils array in the correct format
    const utensilsArray = data.utensils
      .filter((utensil) => utensil.name && utensil.categoryId)
      .map((utensil) => ({
        name: utensil.name || '',
        categoryId: utensil.categoryId || '',
        inventory: Number(utensil.inventory) || 0,
      }));

    if (utensilsArray.length === 0) {
      toast.error('No valid items to save');
      return;
    }

    // Send each utensil individually
    const savePromises = utensilsArray.map((utensil) => {
      return new Promise((resolve, reject) => {
        saveInventory(utensil, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    });

    try {
      await Promise.all(savePromises);
      console.log('Successfully saved all utensil inventories');
      toast.success('All inventories saved successfully!');
      refetch();
    } catch (error: any) {
      console.error('Failed to save some inventories:', error);
      toast.error(
        `Failed to save some inventories: ${error.message || 'Unknown error'}`,
      );
    }
  };

  if (isLoadingUtensils) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading utensils: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-transparent">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header Section */}
            <div className="mb-6 flex justify-between rounded-lg bg-blue-900 p-6 shadow-md">
              <h2 className="text-2xl font-bold text-white">
                Cutlery Master Page
              </h2>
            </div>

            {/* Show message when no utensils data */}
            {utensilsData.length === 0 && !isLoadingUtensils && (
              <div className="text-gray-500 border-gray-200 rounded-lg border bg-white py-12 text-center">
                No utensils data available. Please check if utensils are
                configured.
              </div>
            )}

            {/* Categories Grid - 3 per row */}
            {utensilsData.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedUtensils).map(
                  ([categoryId, categoryUtensils]) => (
                    <div key={categoryId} className="space-y-2">
                      {/* Category Card */}
                      <div className="cursor-pointer rounded-lg border-b-2 border-blue-100 bg-sky-50 p-4 text-sm text-blue-500 transition-all duration-200 dark:border-blue-400 dark:bg-meta-4 dark:text-blue-400">
                        <div className="flex items-center justify-between">
                          <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                            {categoryUtensils[0]?.category?.name ||
                              'Uncategorized'}
                          </h3>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {categoryUtensils.length} items
                          </span>
                        </div>
                      </div>

                      <div className="dark:border-gray-700 dark:bg-gray-800 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
                        <table className="dark:divide-gray-700 min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Name
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Inventory
                              </th>
                            </tr>
                          </thead>
                          <tbody className="dark:divide-gray-700 dark:bg-gray-800 divide-y divide-stroke bg-white dark:bg-boxdark">
                            {categoryUtensils.map((utensil: any) => (
                              <tr
                                key={utensil.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="text-gray-900 whitespace-nowrap px-4 py-2 text-sm font-medium dark:text-white">
                                  {utensil.name}
                                  {/* Hidden input for name */}
                                  <input
                                    type="hidden"
                                    {...register(
                                      `utensils.${utensil.fieldIndex}.name`,
                                      {
                                        value: utensil.name,
                                      },
                                    )}
                                  />
                                  {/* Hidden input for categoryId */}
                                  <input
                                    type="hidden"
                                    {...register(
                                      `utensils.${utensil.fieldIndex}.categoryId`,
                                      {
                                        value: utensil.categoryId,
                                      },
                                    )}
                                  />
                                </td>
                                <td className="text-gray-500 dark:text-gray-400 whitespace-nowrap px-4 py-2 text-sm">
                                  {utensil.fieldIndex !== undefined ? (
                                    <div className="w-24">
                                      <input
                                        type="number"
                                        min={0}
                                        {...register(
                                          `utensils.${utensil.fieldIndex}.inventory`,
                                          {
                                            valueAsNumber: true,
                                            required: 'Inventory is required',
                                          },
                                        )}
                                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                      />
                                    </div>
                                  ) : (
                                    <span>{utensil.inventory || 0}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {utensilsData.length > 0 && (
              <div className="mt-8 flex justify-end">
                <GenericButton
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </GenericButton>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CutleryMaster;
