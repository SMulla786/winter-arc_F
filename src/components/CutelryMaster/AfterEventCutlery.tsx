/* eslint-disable  */

import React, {useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {Route} from '@/routes/_app/_event/events.$id';
import z from 'zod';
import {FiSave} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  bulkAddCutleryToEventSchema,
  eventCutlerySchema,
  useBulkReturnEventCutleries,
  useGetCutleryCategories,
  useGetEventCutleries,
  useGetMasterCutlery,
} from '@/lib/api/cateror/cutlerymaster';

// Extend your utensil schema with a default utensil type.
const UtensilSchema = eventCutlerySchema.extend({
  utensilType: z.string().default('FORK'),
});

type EventUtensil = z.infer<typeof UtensilSchema>;

type EnrichedEventUtensil = EventUtensil & {
  categoryName: string;
  utensilName: string;
};
type FormValues = z.infer<typeof bulkAddCutleryToEventSchema>;

const AfterEventCutlery: React.FunctionComponent = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.cutleryChecking;
  const role = user?.role;

  const [isOpen, setIsOpen] = useState(true);
  const methods = useForm<FormValues>({
    defaultValues: {
      eventId: '',
      cutleries: [],
    },
  });
  const [reportType, setReportType] = useState<'regular' | 'missing'>(
    'regular',
  );

  const {handleSubmit, setValue, reset} = methods;
  const {id: EventId} = Route.useParams();
  const {data: eventUtensils} = useGetEventCutleries(EventId);
  console.log('====================================');
  console.log(eventUtensils);
  console.log('====================================');
  const {data: utensils} = useGetMasterCutlery(
    localStorage.getItem('languageId') || '',
  );
  const {data: subEventResponse} = useGetSubevent(EventId);

  const {data: utensilCategories} = useGetCutleryCategories();

  // State for category and utensil names
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {},
  );
  const [utensilNames, setUtensilNames] = useState<Record<string, string>>({});
  const [utensilList, setUtensilList] = useState<EnrichedEventUtensil[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  // Initialize category names
  useEffect(() => {
    if (utensilCategories?.data) {
      const names: Record<string, string> = {};
      utensilCategories.data.forEach((category: {id: string; name: string}) => {
        names[category.id] = category.name;
      });
      setCategoryNames(names);
    }
  }, [utensilCategories]);

  // Initialize utensil names
  useEffect(() => {
    if (utensils?.data) {
      const names: Record<string, string> = {};
      utensils.data.forEach((utensil: {id: string; name: string}) => {
        names[utensil.id] = utensil.name;
      });
      setUtensilNames(names);
    }
  }, [utensils]);

  useEffect(() => {
    if (eventUtensils && utensils?.data) {
      const transformedData: EnrichedEventUtensil[] = eventUtensils.map(
        (utensil: any) => {
          const foundUtensil = utensils.data.find(
            (u: any) => u.id === utensil.cutleryId,
          );

          return {
            ...utensil,
            cutleryID: utensil.cutleryId,
            utensilType: 'FORK',
            taken: utensil.taken || 0,
            returned: utensil.returned || 0,
            fetchedReturned: utensil.returned || 0,
            updateReturned: utensil.returned || 0,
            categoryName:
              foundUtensil && utensilCategories?.data
                ? utensilCategories.data.find(
                    (c: any) => c.id === foundUtensil.categoryId,
                  )?.name || 'Unknown'
                : 'Unknown',
            utensilName: foundUtensil ? foundUtensil.name : 'Unknown',
          };
        },
      );

      setUtensilList(transformedData);

      const baseData = transformedData.map((item) => ({
        cutleryID: item.cutleryID,
        taken: item.taken,
        fetchedReturned: item.fetchedReturned,
        updateReturned: item.updateReturned,
      }));

      setValue('cutleries', baseData);
    }
  }, [eventUtensils, utensils, utensilCategories, setValue]);

  const {mutateAsync: bulkReturnUtensils, isPending} =
    useBulkReturnEventCutleries();

  const onSubmit = async (data: FormValues) => {
    console.log('Form data before transform:', data); // Debug log

    // Map the data properly - your schema expects cutleryID, taken, fetchedReturned, updateReturned
    const transformedData = data.cutleries
      .map((cutlery) => {
        console.log('Processing cutlery:', cutlery); // Debug log
        return {
          cutleryID: cutlery.cutleryID,
          taken: cutlery.taken,
          fetchedReturned: cutlery.fetchedReturned,
          updateReturned: cutlery.updateReturned,
          returned: Number(cutlery.updateReturned), // Add returned field for API
        };
      })
      .filter((cutlery) => cutlery.updateReturned > 0); // Only send items with updates

    console.log('Transformed data to send:', transformedData);

    if (transformedData.length === 0) {
      alert('No changes to save. Please enter values in the inward column.');
      return;
    }

    try {
      await bulkReturnUtensils({
        eventId: EventId,
        cutleries: transformedData,
      });
      alert('Cutlery return data saved successfully!');
    } catch (error) {
      console.error('Error saving cutlery data:', error);
      alert('Failed to save cutlery return data');
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (!utensilList || utensilList.length === 0) {
        alert('No utensil data available. Please wait for data to load.');
        return;
      }

      // Get current form values
      const formValues = methods.getValues();

      // Create a map of form values by cutleryID for quick lookup
      const formValuesMap = {};
      (formValues.cutleries || []).forEach((item) => {
        if (item && item.cutleryID) {
          formValuesMap[item.cutleryID] = item;
        }
      });

      // Merge utensilList with form values
      const currentUtensils = utensilList.map((item) => {
        const formItem = formValuesMap[item.cutleryID] || {};
        return {
          ...item,
          taken: item.taken || 0,
          updateReturned: Number(formItem.updateReturned) || 0,
          // Ensure we have the names
          categoryName: item.categoryName || 'Unknown',
          utensilName: item.utensilName || item.cutlery?.name || 'Unknown',
        };
      });

      const utensilsToShow =
        reportType === 'missing'
          ? currentUtensils.filter(
              (item) => (item.updateReturned || 0) < (item.taken || 0),
            )
          : currentUtensils;

      if (utensilsToShow.length === 0) {
        alert(
          `No data available for ${reportType === 'missing' ? 'missing' : 'regular'} report.`,
        );
        return;
      }

      const eventName = subEventResponse?.data?.name || 'N/A';
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

      // Build htmlContent
      let htmlContent = `
    <!-- FIRST PAGE HEADER -->
    <div style="text-align:center; border:1px solid #0D47A1; padding:8px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
      <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
        ${user?.fullname || 'Name'}
      </h1>
      <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
        ${user?.address ? `Address - ${user.address}` : ''}${
          user?.email ? ` | Email - ${user.email}` : ''
        } | Mob. ${user?.phoneNumber || ''}
      </p>
    </div>

    <!-- TITLE BAR -->
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
      <h2 style="margin:0; font-size:16px;">${
        reportType === 'missing'
          ? 'Missing Utensils Report'
          : 'Event Utensil Report'
      }</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        Event: ${eventName} |
        Printed: ${printedDateStr} at ${printedTimeStr}
      </div>
    </div>
    `;

      // Table header
      htmlContent += `
    <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:12px; margin-bottom:12px;">
      <thead>
        <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
          <th style="padding:8px; border:1px solid #ccc; text-align:center;">Category</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:center;">Utensil</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:center;">Outward</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:center;">Inward</th>
          ${reportType === 'missing' ? `<th style="padding:8px; border:1px solid #ccc; text-align:center;">Missing</th>` : ''}
        </tr>
      </thead>
      <tbody>
    `;

      // Rows
      utensilsToShow.forEach((item, idx) => {
        const missing = (item.taken || 0) - (item.updateReturned || 0);
        htmlContent += `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
        <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.categoryName}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.utensilName}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.taken || 0}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.updateReturned || 0}</td>
        ${reportType === 'missing' ? `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#d9534f;">${missing}</td>` : ''}
      </tr>
    `;
      });

      htmlContent += `
      </tbody>
    </table>
    
    <!-- Summary -->
    <div style="margin-top:20px; padding:10px; border-top:2px solid #0D47A1; font-family: Arial, sans-serif;">
      <div style="display:flex; justify-content:space-between;">
        <div>
          <strong>Total Items:</strong> ${utensilsToShow.length}
        </div>
        <div>
          <strong>Total Outward:</strong> ${utensilsToShow.reduce((sum, item) => sum + (item.taken || 0), 0)}
        </div>
        <div>
          <strong>Total Inward:</strong> ${utensilsToShow.reduce((sum, item) => sum + (item.updateReturned || 0), 0)}
        </div>
        ${
          reportType === 'missing'
            ? `<div>
            <strong>Total Missing:</strong> ${utensilsToShow.reduce((sum, item) => sum + ((item.taken || 0) - (item.updateReturned || 0)), 0)}
          </div>`
            : ''
        }
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
        alert('Please allow popups for this site to generate PDF');
        return;
      }

      printWindow.document.write(`<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${reportType === 'missing' ? 'Missing Utensils Report' : 'Event Utensil Report'} - ${eventName}</title>
      <style>
        @media print {
          @page {
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #1E3A8A;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f8f8f8;
        }
        .summary {
          margin-top: 30px;
          padding: 15px;
          border-top: 2px solid #0D47A1;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        // Auto-print after a short delay
        setTimeout(() => {
          window.print();
          setTimeout(() => window.close(), 500);
        }, 500);
      </script>
    </body>
    </html>
  `);

      printWindow.document.close();
    } catch (err) {
      console.error('Failed to generate utensil PDF:', err);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  return (
    <div className="bg-transparent">
      {' '}
      <div className="dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 rounded-t-lg bg-blue-900 px-4 py-4 text-white sm:px-6 sm:py-5">
          {/* Mobile: Compact, Desktop: Normal */}
          <div className="flex items-center justify-between sm:flex-row sm:items-center sm:justify-between">
            {/* Title */}
            <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
              Cutlery Checking
            </h2>

            {/* Controls - Hidden on mobile until expanded */}
            <div className="flex items-center gap-2">
              {/* Mobile: Show only toggle button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <BiChevronUp size={24} />
                  ) : (
                    <BiChevronDown size={24} />
                  )}
                </button>
              </div>

              {/* Desktop: Show all controls */}
              <div className="hidden items-center gap-3 sm:flex">
                <select
                  value={reportType}
                  onChange={(e) =>
                    setReportType(e.target.value as 'regular' | 'missing')
                  }
                  className="border-gray-300 dark:bg-gray-800 rounded-md border px-3 py-1 text-sm text-neutral-700 dark:bg-meta-4 dark:text-white"
                >
                  <option value="regular">Regular Report</option>
                  <option value="missing">Missing Report</option>
                </select>

                <button
                  onClick={handleDownloadPDF}
                  className="flex gap-1 rounded bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
                >
                  <span>📄</span>
                  Download PDF
                </button>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <BiChevronUp size={24} />
                  ) : (
                    <BiChevronDown size={24} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Expanded controls (shown when isOpen is true) */}
          {isOpen && (
            <div className="mt-4 flex flex-col gap-3 sm:hidden">
              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value as 'regular' | 'missing')
                }
                className="border-gray-300 dark:bg-gray-800 w-full rounded-md border px-3 py-1 text-sm text-neutral-700 dark:bg-meta-4 dark:text-white"
              >
                <option value="regular">Regular Report</option>
                <option value="missing">Missing Report</option>
              </select>

              <button
                onClick={handleDownloadPDF}
                className="flex w-full gap-1 rounded bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
              >
                <span>📄</span>
                Download PDF
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={tableRef} className="space-y-6">
                {/* Grid with 3 cols on top and 2 cols on bottom */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {Object.entries(
                    utensilList.reduce(
                      (acc, item, index) => {
                        if (!acc[item.categoryName])
                          acc[item.categoryName] = [];
                        acc[item.categoryName].push({...item, index});
                        return acc;
                      },
                      {} as Record<
                        string,
                        (EnrichedEventUtensil & {index: number})[]
                      >,
                    ),
                  ).map(([category, utensils]) => (
                    <div key={category} className="space-y-2">
                      {/* Title Bar */}
                      <div className="cursor-pointer rounded-lg border-b-2 border-blue-100 bg-sky-50 p-4 text-sm text-blue-500 transition-all duration-200 dark:border-blue-400 dark:bg-meta-4 dark:text-blue-400">
                        <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                          {category || 'Uncategorized'}
                        </h3>
                      </div>

                      {/* Items */}
                      <div className="dark:border-gray-700 dark:bg-gray-800 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
                        <div className="h-50 overflow-y-auto">
                          {/* Header Row */}
                          <div className="border-gray-200 text-gray-500 mb-3 grid grid-cols-3 gap-3 border-b pb-2 text-xs font-semibold">
                            <div className="text-gray-700 py-2 font-semibold dark:text-white">
                              Cutlery
                            </div>
                            <div className="text-gray-700 py-2 text-center font-semibold dark:text-white">
                              Outward
                            </div>
                            <div className="text-gray-700 py-2 font-semibold dark:text-white">
                              Inward
                            </div>
                          </div>

                          {/* Utensil Rows */}
                          <div className="space-y-3">
                            {utensils.map((item, idx) => (
                              <div
                                className={`grid grid-cols-3 items-center gap-3 border-b border-stroke pb-2 ${
                                  idx === utensils.length - 1
                                    ? 'border-none'
                                    : ''
                                }`}
                                key={item.index}
                              >
                                {/* Utensil Name */}
                                <div className="text-gray-800 text-sm font-medium">
                                  {item.cutlery?.name || 'Unknown'}
                                </div>

                                {/* Outward */}
                                <div className="text-gray-800 text-center text-sm">
                                  {item.taken || '0'}
                                </div>

                                {/* Inward */}
                                <div>
                                  <GenericInputField
                                    name={`cutleries.${item.index}.updateReturned`} // Changed from utensils to cutleries
                                    type="number"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-6 flex justify-end">
                  <GenericButton
                    type="submit"
                    disabled={isPending}
                    className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save '}
                  </GenericButton>
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default AfterEventCutlery;
