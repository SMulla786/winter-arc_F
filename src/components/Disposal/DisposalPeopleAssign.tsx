/* eslint-disable */
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {FiSave} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from '../Loader/Loader';
import {useSaveDisposalQuantity} from '@/lib/react-query/queriesAndMutations/cateror/assignpreople';
import {useGetDisposals} from '@/lib/react-query/queriesAndMutations/cateror/disposal';

interface DisposalFormData {
  disposalId: string;
  quantity: number;
}

interface FormValues {
  disposals: DisposalFormData[];
}

const DisposalPeopleAssign: React.FunctionComponent = () => {
  const {user} = useAuthContext();
  const [peopleCount, setPeopleCount] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>('100');

  const restriction = user?.employeeRestriction?.utensilpeoplepage;
  const role = user?.role;

  // Get languageId from localStorage or use default
  const languageId = localStorage.getItem('languageId') || 'defaultLanguageId';

  // Fetch disposals data using the correct hook
  const {
    data: disposalsApiData,
    isPending: isLoadingDisposals,
    error,
  } = useGetDisposals(languageId);

  // Extract disposals data from the API response
  const disposalsData = disposalsApiData?.data || [];

  // Initialize form
  const methods = useForm<FormValues>({
    defaultValues: {
      disposals: [],
    },
  });

  const {reset, handleSubmit, watch} = methods;
  const {fields} = useFieldArray({
    name: 'disposals',
    control: methods.control,
  });

  // Watch all disposal quantities for real-time updates
  const watchedDisposals = watch('disposals');

  // Calculate required quantity based on people count and disposal requirements
  const calculateRequiredQuantity = (disposal: any, people: number) => {
    // Use givenQuantity from your API data as the base calculation
    const baseQuantity = disposal.givenQuantity || 100;
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
    if (disposalsData.length > 0) {
      const recalculatedDisposals: DisposalFormData[] = disposalsData.map(
        (disposal: any) => {
          const calculatedQuantity = calculateRequiredQuantity(
            disposal,
            people,
          );
          return {
            disposalId: disposal.id,
            quantity: calculatedQuantity,
          };
        },
      );

      reset({
        disposals: recalculatedDisposals,
      });
    }
  };

  // Reset form with calculated quantities when disposals data changes
  useEffect(() => {
    if (disposalsData.length > 0 && peopleCount > 0) {
      const initialDisposals: DisposalFormData[] = disposalsData.map(
        (disposal: any) => {
          const calculatedQuantity = calculateRequiredQuantity(
            disposal,
            peopleCount,
          );
          return {
            disposalId: disposal.id,
            quantity: calculatedQuantity,
          };
        },
      );

      reset({
        disposals: initialDisposals,
      });
    }
  }, [disposalsData, peopleCount, reset]);

  // Group disposals by category
  const groupedDisposals = useMemo(() => {
    if (!disposalsData.length) return {};

    return disposalsData.reduce((acc: Record<string, any[]>, disposal: any) => {
      if (!acc[disposal.categoryId]) {
        acc[disposal.categoryId] = [];
      }

      const fieldIndex = fields.findIndex(
        (f: any) => f.disposalId === disposal.id,
      );

      // Get current quantity from form or calculate default
      const currentQuantity =
        fieldIndex !== -1 &&
        watchedDisposals?.[fieldIndex]?.quantity !== undefined
          ? watchedDisposals[fieldIndex].quantity
          : calculateRequiredQuantity(disposal, peopleCount);

      acc[disposal.categoryId].push({
        ...disposal,
        currentQuantity,
        fieldIndex,
        calculatedQuantity: calculateRequiredQuantity(disposal, peopleCount),
      });
      return acc;
    }, {});
  }, [disposalsData, fields, watchedDisposals, peopleCount]);

  // Save mutation
  const {mutate: saveQuantity, isPending: isSaving} = useSaveDisposalQuantity();

  const onSubmit = (data: FormValues) => {
    // Prepare payload according to your API schema
    const filteredItems = data.disposals
      .filter((disposal) => disposal.quantity > 0)
      .map((disposal) => ({
        disposalId: disposal.disposalId,
        quantity: Number(disposal.quantity),
      }));

    if (filteredItems.length === 0) {
      alert('Please enter quantities for at least one disposal item');
      return;
    }

    const payload = {
      people: peopleCount,
      caterorId: user?.id,
      items: filteredItems,
    };

    console.log('Submitting disposal payload:', payload);

    // Call the mutation
    saveQuantity(payload, {
      onSuccess: () => {
        console.log('Successfully saved disposal quantities');
      },
      onError: (error) => {
        console.error('Failed to save disposal quantities:', error);
        alert('Failed to save disposal quantities. Please try again.');
      },
    });
  };

  if (isLoadingDisposals) {
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
                Disposal People Assign
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
                {/* <div className="text-sm text-blue-200">
                  Calculating for: {peopleCount} people
                </div> */}
              </div>
            </div>

            {/* Show message when no disposals data */}
            {disposalsData.length === 0 && !isLoadingDisposals && (
              <div className="text-gray-500 border-gray-200 rounded-lg border bg-white py-12 text-center">
                No disposal data available. Please check if disposals are
                configured.
              </div>
            )}

            {/* Categories Grid - 3 per row */}
            {disposalsData.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedDisposals).map(
                  ([categoryId, categoryDisposals]) => (
                    <div key={categoryId} className="space-y-2">
                      {/* Category Card */}
                      <div className="cursor-pointer rounded-lg border-b-2 border-blue-100 bg-sky-50 p-4 text-sm text-blue-500 transition-all duration-200 dark:border-blue-400 dark:bg-meta-4 dark:text-blue-400">
                        <div className="flex items-center justify-between">
                          <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                            {categoryDisposals[0]?.category?.name ||
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
                                Disposal Item
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="dark:divide-gray-700 dark:bg-gray-800 divide-y divide-stroke bg-white dark:bg-boxdark">
                            {categoryDisposals.map((disposal: any) => (
                              <tr
                                key={disposal.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="text-gray-900 whitespace-nowrap px-4 py-2 text-sm font-medium dark:text-white">
                                  {disposal.name}
                                </td>
                                <td className="text-gray-500 dark:text-gray-400 whitespace-nowrap px-4 py-2 text-sm">
                                  {disposal.fieldIndex !== -1 && (
                                    <div className="w-24">
                                      <GenericInputField
                                        name={`disposals.${disposal.fieldIndex}.quantity`}
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

            {disposalsData.length > 0 && (
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

export default DisposalPeopleAssign;
