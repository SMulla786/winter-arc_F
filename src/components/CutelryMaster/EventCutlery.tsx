/* eslint-disable */
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import {FiSave, FiPrinter} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {toast} from 'react-hot-toast';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {Loader} from '@/components/Loader/Loader';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import {
  useAddEventUCutlries,
  useGetCutleries,
} from '@/lib/api/cateror/cutlerymaster';

// Define the form data structure
interface CutleryFormData {
  cutleryID: string;
  quantity: number;
}

interface FormValues {
  cutleries: CutleryFormData[];
}

// Define the API payload structure
interface EventCutleriesPayload {
  eventId: string;
  cutleries: {
    cutleryID: string;
    taken: number;
  }[];
}

interface CutleryData {
  id: string;
  name: string;
  categoryId: string;
  inventory: number;
  givenQuantity: number;
  totalQuantity: number;
  category: {
    id: string;
    name: string;
  };
}

const EventCutlery: React.FC = () => {
  const {user} = useAuthContext();
  const [peopleCount, setPeopleCount] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>('100');
  const {id} = Route.useParams();
  const languageId = localStorage.getItem('languageId') || '';
  const catererId = user?.caterorId || '';
  const {data: catererData} = useGetCaterorById(catererId);
  const catererLogo = catererData?.data?.image || '';

  const {
    data: apiData,
    isPending: isLoading,
    error,
  } = useGetCutleries(languageId);

  const {mutate: saveEventCutleries, isPending: isSaving} =
    useAddEventUCutlries();

  const methods = useForm<FormValues>({
    defaultValues: {cutleries: []},
  });

  const {control, handleSubmit, watch, reset, setValue, getValues} = methods;
  const {fields, replace} = useFieldArray({control, name: 'cutleries'});

  // Watch form values
  const formValues = watch('cutleries');

  // Extract cutleries data from API
  const cutleriesData: CutleryData[] = useMemo(() => {
    if (!apiData) return [];

    // Check if the response has the structure you provided
    if (apiData.data && Array.isArray(apiData.data)) {
      return apiData.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        inventory: item.inventory || 0,
        givenQuantity: item.givenQuantity || 0,
        totalQuantity: item.totalQuantity || 0,
        category: item.category || {id: '', name: ''},
      }));
    }

    // If apiData is already the array
    if (Array.isArray(apiData)) {
      return apiData.map((item: any) => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        inventory: item.inventory || 0,
        givenQuantity: item.givenQuantity || 0,
        totalQuantity: item.totalQuantity || 0,
        category: item.category || {id: '', name: ''},
      }));
    }

    return [];
  }, [apiData]);

  console.log('Processed cutleries data with givenQuantity:', cutleriesData);

  // Group cutleries by category
  const groupedCutleries = useMemo(() => {
    const groups: Record<
      string,
      {
        categoryName: string;
        items: (CutleryData & {
          fieldIndex?: number;
        })[];
      }
    > = {};

    cutleriesData.forEach((cutlery, index) => {
      const catId = cutlery.categoryId;

      if (!groups[catId]) {
        groups[catId] = {
          categoryName: cutlery.category?.name || 'Uncategorized',
          items: [],
        };
      }

      // Find field index for this cutlery
      const fieldIndex = fields.findIndex(
        (field) => field.cutleryID === cutlery.id,
      );

      groups[catId].items.push({
        ...cutlery,
        fieldIndex: fieldIndex !== -1 ? fieldIndex : undefined,
      });
    });

    return groups;
  }, [cutleriesData, fields]);

  // Initialize form with cutlery data - Use givenQuantity as default
  useEffect(() => {
    if (cutleriesData.length > 0 && fields.length === 0) {
      console.log('Initializing form with', cutleriesData.length, 'cutleries');

      const initialValues = cutleriesData.map((cutlery) => ({
        cutleryID: cutlery.id,
        quantity: cutlery.givenQuantity > 0 ? cutlery.givenQuantity : 1, // Use givenQuantity if available, otherwise default to 1
      }));

      console.log('Setting initial values with givenQuantity:', initialValues);
      replace(initialValues);
    }
  }, [cutleriesData, fields.length, replace]);

  // Handle people count change
  const handlePeopleSubmit = () => {
    const num = parseInt(inputValue);
    if (num > 0) {
      setPeopleCount(num);
      // Recalculate quantities based on new people count
      const updatedCutleries = cutleriesData.map((cutlery) => {
        const fieldIndex = fields.findIndex(
          (field) => field.cutleryID === cutlery.id,
        );
        const currentQuantity =
          fieldIndex !== -1
            ? getValues(`cutleries.${fieldIndex}.quantity`)
            : cutlery.givenQuantity;

        // Keep the same quantity or use givenQuantity if not set
        return {
          cutleryID: cutlery.id,
          quantity:
            currentQuantity ||
            (cutlery.givenQuantity > 0 ? cutlery.givenQuantity : 1),
        };
      });

      replace(updatedCutleries);
      toast.success(`Updated for ${num} people`);
    } else {
      alert('Please enter a valid number of people');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePeopleSubmit();
    }
  };

  // Helper function to get the current quantity value
  const getCurrentQuantity = (cutlery: any) => {
    if (cutlery.fieldIndex !== undefined) {
      const formValue = getValues(`cutleries.${cutlery.fieldIndex}.quantity`);
      return formValue !== undefined
        ? formValue
        : cutlery.givenQuantity > 0
          ? cutlery.givenQuantity
          : 1;
    }
    return cutlery.givenQuantity > 0 ? cutlery.givenQuantity : 1;
  };

  // Submit handler
  const onSubmit = (data: FormValues) => {
    console.log('Submitting form data:', data);

    if (!data.cutleries || data.cutleries.length === 0) {
      toast.error('No cutlery data available to save');
      return;
    }

    // Validate that all required fields are present
    const validCutleries = data.cutleries.filter((c) => {
      return (
        c &&
        c.cutleryID &&
        c.cutleryID.trim() !== '' &&
        c.quantity !== undefined &&
        c.quantity !== null
      );
    });

    if (validCutleries.length === 0) {
      toast.error('Please enter quantities for at least one cutlery');
      return;
    }

    // Prepare the payload
    const payload: EventCutleriesPayload = {
      eventId: id,
      cutleries: validCutleries.map((c) => ({
        cutleryID: c.cutleryID.trim(),
        taken: Number(c.quantity) || 0,
      })),
    };

    console.log('Sending to API:', JSON.stringify(payload, null, 2));

    saveEventCutleries(payload, {
      onSuccess: (response) => {
        console.log('Successfully saved cutlery quantities:', response);
        toast.success('Saved successfully!');
      },
      onError: (error) => {
        console.error('Failed to save:', error);
        toast.error('Failed to save cutlery quantities. Please try again.');
      },
    });
  };

  // Print functionality
  const handlePrint = () => {
    const cutleryList = getValues('cutleries') || [];

    if (cutleryList.length === 0) {
      toast.error('No cutleries data available to print');
      return;
    }

    // Filter cutleries with quantity > 0
    const cutleriesWithQuantity = cutleryList.filter(
      (item) => item.quantity > 0,
    );

    if (cutleriesWithQuantity.length === 0) {
      toast.error(
        'Please enter quantities for at least one cutlery before printing',
      );
      return;
    }

    // Group by category
    const groupedByCategory: Record<string, any[]> = {};

    Object.entries(groupedCutleries).forEach(([categoryId, categoryData]) => {
      const itemsWithQuantity = categoryData.items.filter((item) => {
        const quantity =
          item.fieldIndex !== undefined
            ? getValues(`cutleries.${item.fieldIndex}.quantity`)
            : 0;
        return quantity > 0;
      });

      if (itemsWithQuantity.length > 0) {
        groupedByCategory[categoryId] = itemsWithQuantity.map((item) => ({
          name: item.name,
          quantity:
            item.fieldIndex !== undefined
              ? getValues(`cutleries.${item.fieldIndex}.quantity`)
              : 0,
          fieldIndex: item.fieldIndex,
        }));
      }
    });

    const allCategoryEntries = Object.entries(groupedByCategory);

    if (allCategoryEntries.length === 0) {
      toast.error('No cutleries with quantities to print');
      return;
    }

    // Split categories into two balanced columns
    function splitCategoriesBalanced(categories: [string, any[]][]) {
      const left: [string, any[]][] = [];
      const right: [string, any[]][] = [];

      let leftCount = 0;
      let rightCount = 0;

      categories.forEach((category) => {
        const rowCount = category[1].length;
        if (leftCount <= rightCount) {
          left.push(category);
          leftCount += rowCount;
        } else {
          right.push(category);
          rightCount += rowCount;
        }
      });

      return [left, right];
    }

    const [leftCategories, rightCategories] =
      splitCategoriesBalanced(allCategoryEntries);

    const printedDate = new Date();
    const printedDateStr = printedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const printedTimeStr = printedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Build HTML content
    let htmlContent = `
      <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="10%" align="left" valign="middle">
              ${catererLogo ? `<img src="${catererLogo}" alt="Caterer Logo" style="max-height:60px; max-width:150px; object-fit:contain;" />` : ''}
            </td>
            <td width="90%" align="center">
              <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
                ${user?.fullname || 'Caterer Name'}
              </h1>
              <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
                ${user?.address ? `Address - ${user.address}` : ''} ${user?.email ? ` | Email - ${user.email}` : ''} | Mob.${user?.phoneNumber || ''}
              </p>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
        <h2 style="margin:0; font-size:16px;">Event Cutlery Report</h2>
        <div style="font-size:11px; margin-top:4px; opacity:0.95;">
          People Count: ${peopleCount} | Date: ${printedDateStr} ${printedTimeStr}
        </div>
      </div>

      <div style="display: flex; gap: 20px; justify-content: space-between;">
        <div style="width: 48%;">
    `;

    // Left column categories
    leftCategories.forEach(([categoryId, cutleries]) => {
      const categoryName =
        groupedCutleries[categoryId]?.categoryName || 'Uncategorized';
      htmlContent += `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; text-align: left;">
            ${categoryName}
          </h3>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1E3A8A; color:#fff;">
                <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Sr.</th>
                <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Cutlery Name</th>
                <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Quantity</th>
              </tr>
            </thead>
            <tbody>
      `;

      cutleries.forEach((cutlery, idx) => {
        htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${idx + 1}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700; padding-left:12px;">${cutlery.name}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${cutlery.quantity}</td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>
        </div>
      `;
    });

    htmlContent += `
        </div>
        <div style="width: 48%;">
    `;

    // Right column categories
    rightCategories.forEach(([categoryId, cutleries]) => {
      const categoryName =
        groupedCutleries[categoryId]?.categoryName || 'Uncategorized';
      htmlContent += `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; text-align: left;">
            ${categoryName}
          </h3>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1E3A8A; color:#fff;">
                <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Sr.</th>
                <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Cutlery Name</th>
                <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Quantity</th>
              </tr>
            </thead>
            <tbody>
      `;

      cutleries.forEach((cutlery, idx) => {
        htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${idx + 1}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700; padding-left:12px;">${cutlery.name}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${cutlery.quantity}</td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>
        </div>
      `;
    });

    htmlContent += `
        </div>
      </div>
    `;

    // Open print window
    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );
    if (!printWindow) {
      toast.error('Please allow popups for this site to generate print');
      return;
    }

    printWindow.document.write(`<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Event Cutlery Report</title>
        <style>
          html, body { margin:0; padding:0; font-family: Arial, sans-serif; color:#000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body.first-page { padding-top:0 !important; }
          .repeat-title {
            position: fixed;
            top: 8px;
            left: 8px;
            text-align: left;
            background: #0D47A1;
            color: #fff;
            padding: 6px 10px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 0 0 4px 0;
            z-index: 9999;
          }
          body.first-page .repeat-title { display: none !important; }
          table { width:100%; border-collapse: collapse; page-break-inside: avoid; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          @media print {
            .repeat-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 12mm 8mm; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body class="first-page">
        <div style="padding:12px;">
          ${htmlContent}
        </div>

        <script>
          setTimeout(() => {
            document.body.classList.remove('first-page');
            window.print();
            setTimeout(() => window.close(), 600);
          }, 400);
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
        <span className="ml-2">Loading cutleries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="mb-4 text-2xl font-bold">Error Loading Cutleries</h2>
          <p>{(error as Error)?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // if (cutleriesData.length === 0) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-gray-700 mb-4 text-2xl font-bold">
  //           No Cutleries Found
  //         </h2>
  //         <p className="text-gray-600">
  //           Please add cutleries to your inventory first.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="bg-transparent">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header Section - Matches EventUtensil design */}
            <div className="mb-6 flex justify-between rounded-lg bg-blue-900 p-6 shadow-md">
              <h2 className="text-2xl font-bold text-white">Event Cutleries</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {/* <label className="text-sm font-medium text-white">
                    People:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-gray-300 w-32 rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter people count..."
                  />
                  <button
                    type="button"
                    onClick={handlePeopleSubmit}
                    className="rounded-md border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update
                  </button> */}

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                    onClick={handlePrint}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Grid - 3 per row - Simplified like EventUtensil */}
            {Object.keys(groupedCutleries).length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedCutleries).map(
                  ([catId, categoryData]) => (
                    <div key={catId} className="space-y-2">
                      {/* Category Card - Matches EventUtensil */}
                      <div className="cursor-pointer rounded-lg border-b-2 border-blue-100 bg-sky-50 p-4 text-sm text-blue-500 transition-all duration-200 dark:border-blue-400 dark:bg-meta-4 dark:text-blue-400">
                        <div className="flex items-center justify-between">
                          <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                            {categoryData.categoryName}
                          </h3>
                          {/* <span className="text-xs font-medium">
                            {categoryData.items.length} items
                          </span> */}
                        </div>
                      </div>

                      {/* Table with only Cutlery and Quantity columns - Like EventUtensil */}
                      <div className="dark:border-gray-700 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
                        <table className="dark:divide-gray-700 min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Cutlery
                              </th>

                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="dark:divide-gray-700 divide-y divide-stroke bg-white dark:bg-boxdark">
                            {categoryData.items.map((cutlery: any) => (
                              <tr
                                key={cutlery.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="text-gray-900 whitespace-nowrap px-4 py-2 text-sm font-medium dark:text-white">
                                  <div className="font-medium">
                                    {cutlery.name}
                                  </div>
                                </td>

                                <td className="text-gray-500 dark:text-gray-400 whitespace-nowrap px-4 py-2 text-sm">
                                  {cutlery.fieldIndex !== undefined && (
                                    <div className="w-24">
                                      <GenericInputField
                                        name={`cutleries.${cutlery.fieldIndex}.quantity`}
                                        type="number"
                                        min="0"
                                        max={cutlery.inventory}
                                        defaultValue={
                                          cutlery.givenQuantity > 0
                                            ? cutlery.givenQuantity
                                            : 1
                                        }
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
            ) : (
              <div className="border-gray-200 text-gray-500 rounded-lg border bg-white py-12 text-center">
                No cutlery data to display. Enter people count and click
                "Update" to load cutlery data.
              </div>
            )}

            {fields.length > 0 && (
              <div className="mt-8 flex justify-end gap-4">
                <GenericButton
                  type="submit"
                  disabled={isSaving}
                  className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save '}
                </GenericButton>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default EventCutlery;
