/* eslint-disable */
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {FiSave} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {useSaveUtensilsQuantity} from '@/lib/react-query/queriesAndMutations/cateror/assignpreople';
import {useGetUtensils} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import {Loader} from '../Loader/Loader';

interface UtensilFormData {
  utensilId: string;
  quantity: number;
}

interface FormValues {
  utensils: UtensilFormData[];
}

const UtensilsPeopleAssign: React.FunctionComponent = () => {
  const {user} = useAuthContext();
  const [peopleCount, setPeopleCount] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>('100');

  const restriction = user?.employeeRestriction?.utensilpeoplepage;
  const role = user?.role;

  // Get languageId from localStorage or use default
  const languageId = localStorage.getItem('languageId') || 'defaultLanguageId';

  // Fetch utensils data using the correct hook
  const {
    data: utensilsApiData,
    isPending: isLoadingUtensils,
    error,
  } = useGetUtensils(languageId);
  console.log('utensils data gettt', utensilsApiData);

  // Extract utensils data from the API response
  const utensilsData = utensilsApiData?.data || [];

  // Initialize form
  const methods = useForm<FormValues>({
    defaultValues: {
      utensils: [],
    },
  });

  const {reset, handleSubmit, watch} = methods;
  const {fields} = useFieldArray({
    name: 'utensils',
    control: methods.control,
  });

  // Watch all utensil quantities for real-time updates
  const watchedUtensils = watch('utensils');

  // Calculate required quantity based on people count and utensil requirements
  const calculateRequiredQuantity = (utensil: any, people: number) => {
    // Use givenQuantity from your API data as the base calculation
    const baseQuantity = utensil.givenQuantity || 100;
    const calculatedQuantity = Math.ceil((baseQuantity / 100) * people);
    return calculatedQuantity;
  };

  // Handle people count change
  const handlePeopleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handlePeopleCountSubmit = () => {
    const count = parseInt(inputValue);
    if (count > 0) {
      setPeopleCount(count);
      // Recalculate quantities when people count changes
      recalculateQuantities(count);
    } else {
      alert('Please enter a valid number of people');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePeopleCountSubmit();
    }
  };

  // Function to recalculate quantities based on people count
  const recalculateQuantities = (people: number) => {
    if (utensilsData.length > 0) {
      const recalculatedUtensils: UtensilFormData[] = utensilsData.map(
        (utensil: any) => {
          const calculatedQuantity = calculateRequiredQuantity(utensil, people);
          return {
            utensilId: utensil.id,
            quantity: calculatedQuantity,
          };
        },
      );

      reset({
        utensils: recalculatedUtensils,
      });
    }
  };

  // Reset form with calculated quantities when utensils data changes
  useEffect(() => {
    if (utensilsData.length > 0 && peopleCount > 0) {
      const initialUtensils: UtensilFormData[] = utensilsData.map(
        (utensil: any) => {
          const calculatedQuantity = calculateRequiredQuantity(
            utensil,
            peopleCount,
          );
          return {
            utensilId: utensil.id,
            quantity: calculatedQuantity,
          };
        },
      );

      reset({
        utensils: initialUtensils,
      });
    }
  }, [utensilsData, peopleCount, reset]);

  // Group utensils by category
  const groupedUtensils = useMemo(() => {
    if (!utensilsData.length) return {};

    return utensilsData.reduce((acc: Record<string, any[]>, utensil: any) => {
      if (!acc[utensil.categoryId]) {
        acc[utensil.categoryId] = [];
      }

      const fieldIndex = fields.findIndex(
        (f: any) => f.utensilId === utensil.id,
      );

      // Get current quantity from form or calculate default
      const currentQuantity =
        fieldIndex !== -1 &&
        watchedUtensils?.[fieldIndex]?.quantity !== undefined
          ? watchedUtensils[fieldIndex].quantity
          : calculateRequiredQuantity(utensil, peopleCount);

      acc[utensil.categoryId].push({
        ...utensil,
        currentQuantity,
        fieldIndex,
        calculatedQuantity: calculateRequiredQuantity(utensil, peopleCount),
      });
      return acc;
    }, {});
  }, [utensilsData, fields, watchedUtensils, peopleCount]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.entries(groupedUtensils).forEach(
      ([categoryId, categoryUtensils]) => {
        totals[categoryId] = categoryUtensils.reduce((sum, utensil) => {
          return sum + (utensil.currentQuantity || 0);
        }, 0);
      },
    );
    return totals;
  }, [groupedUtensils]);

  // Save mutation
  const {mutate: saveQuantity, isPending: isSaving} = useSaveUtensilsQuantity();

  const onSubmit = (data: FormValues) => {
    // Prepare payload according to your API schema
    const filteredItems = data.utensils
      .filter((utensil) => utensil.quantity > 0)
      .map((utensil) => ({
        utensilId: utensil.utensilId,
        quantity: Number(utensil.quantity),
      }));

    if (filteredItems.length === 0) {
      alert('Please enter quantities for at least one utensil');
      return;
    }

    const payload = {
      people: peopleCount,
      caterorId: user?.id,
      items: filteredItems,
    };

    console.log('Submitting payload:', payload);

    // Call the mutation
    saveQuantity(payload, {
      onSuccess: () => {
        console.log('Successfully saved utensil quantities');
        // You can add a toast notification here if needed
      },
      onError: (error) => {
        console.error('Failed to save:', error);
        alert('Failed to save utensil quantities. Please try again.');
      },
    });
  };

  if (isLoadingUtensils) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-transparent">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header Section */}
            <div className="mb-6 flex justify-between rounded-lg bg-blue-900 p-6 shadow-md">
              <h2 className="text-2xl font-bold text-white">
                Utensils People Assign
              </h2>
              <div className="flex items-center gap-4">
                {/* People Count Input */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-white">
                    Number of People:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputValue}
                    onChange={handlePeopleCountChange}
                    onKeyPress={handleKeyPress}
                    className="border-gray-300 w-32 rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-meta-4 dark:text-white"
                    placeholder="Enter people count..."
                    readOnly
                  />
                  {/* <button
                    type="button"
                    onClick={handlePeopleCountSubmit}
                    className="rounded-md border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update
                  </button> */}
                </div>
              </div>
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
                          {/* <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                            {categoryTotals[categoryId] || 0} total
                          </span> */}
                        </div>
                      </div>

                      <div className="dark:border-gray-700 dark:bg-gray-800 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
                        <table className="dark:divide-gray-700 min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Utensil
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Quantity
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
                                </td>
                                <td className="text-gray-500 dark:text-gray-400 whitespace-nowrap px-4 py-2 text-sm">
                                  {utensil.fieldIndex !== -1 && (
                                    <div className="w-24">
                                      <GenericInputField
                                        name={`utensils.${utensil.fieldIndex}.quantity`}
                                        type="number"
                                        min={0}
                                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                      />
                                    </div>
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
                {(role === 'CATEROR' || restriction === 'EDIT') && (
                  <GenericButton
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    <FiSave className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Quantities'}
                  </GenericButton>
                )}
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default UtensilsPeopleAssign;
