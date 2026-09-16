/* eslint-disable  */

import React, {useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {
  useBulkReturnEventUtensils,
  useGetEventUtensils,
} from '@/lib/react-query/queriesAndMutations/cateror/eventUtensils';
import {Route} from '@/routes/_app/_event/events.$id';
import {
  useGetUtensils,
  useGetUtensilCategories,
} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import z from 'zod';
import {
  bulkReturnUtensilToEventSchema,
  eventUtensilSchema,
} from '@/lib/validation/eventSchema';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {FiSave} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';

// Extend your utensil schema with a default utensil type.
const UtensilSchema = eventUtensilSchema.extend({
  utensilType: z.string().default('FORK'),
});

type EventUtensil = z.infer<typeof UtensilSchema>;
type FormValues = z.infer<typeof bulkReturnUtensilToEventSchema>;

const UtensilChecking: React.FunctionComponent = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.utensilChecking;
  const role = user?.role;

  const [isOpen, setIsOpen] = useState(true);
  const methods = useForm<FormValues>({
    defaultValues: {
      eventId: '',
      utensils: [],
    },
  });
  const [reportType, setReportType] = useState<'regular' | 'missing'>(
    'regular',
  );

  const {handleSubmit, setValue, reset} = methods;
  const {id: EventId} = Route.useParams();
  const {data: eventUtensils} = useGetEventUtensils(EventId);
  console.log('====================================');
  console.log(eventUtensils);
  console.log('====================================');
  const {data: utensils} = useGetUtensils(
    localStorage.getItem('languageId') || '',
  );
  const {data: subEventResponse} = useGetSubevent(EventId);

  const {data: utensilCategories} = useGetUtensilCategories();

  // State for category and utensil names
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {},
  );
  const [utensilNames, setUtensilNames] = useState<Record<string, string>>({});
  const [utensilList, setUtensilList] = useState<EventUtensil[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

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

  // Initialize utensil list with category and utensil names
  useEffect(() => {
    if (eventUtensils && utensils?.data) {
      const transformedData = eventUtensils.map((utensil: EventUtensil) => {
        const foundUtensil = utensils.data.find(
          (u: any) => u.id === utensil.utensilId,
        );
        return {
          ...utensil,
          utensilType: 'FORK', // Default value
          taken: utensil.taken,
          returned: utensil.returned,
          fetchedReturned: utensil.returned,
          updateReturned: utensil.returned,
          categoryName: foundUtensil
            ? categoryNames[foundUtensil.categoryId]
            : 'Unknown',
          utensilName: foundUtensil ? utensilNames[foundUtensil.id] : 'Unknown',
        };
      });
      setUtensilList(transformedData);
      setValue('utensils', transformedData);
    }
  }, [eventUtensils, utensils, categoryNames, utensilNames, setValue]);

  const {mutateAsync: bulkReturnUtensils, isPending} =
    useBulkReturnEventUtensils();

  const onSubmit = async (data: FormValues) => {
    const transformedData = data.utensils
      .map((utensil) => ({
        ...utensil,
        returned: Number(utensil.updateReturned),
      }))
      .filter((utensil) => utensil.returned > 0); // Exclude utensils with returned <= 0

    await bulkReturnUtensils({
      eventId: EventId,
      utensils: transformedData,
    });
  };

  const handleDownloadPDF = () => {
    try {
      if (!utensilList || !utensilCategories) return;

      // gather form data same as your original
      const formValues = methods.getValues();
      // const reportType = formValues?.reportType || 'regular';

      const currentUtensils = (formValues.utensils || []).map((formUtensil) => {
        const original = utensilList.find((u) => u.id === formUtensil.id) || {};
        return {
          ...formUtensil,
          categoryName: original.categoryName || 'Unknown',
          utensilName: original.utensilName || 'Unknown',
          taken: original.taken || 0,
          updateReturned: Number(formUtensil.updateReturned) || 0,
        };
      });

      const utensilsToShow =
        reportType === 'missing'
          ? currentUtensils.filter((item) => item.updateReturned < item.taken)
          : currentUtensils;

      const eventName = eventUtensils?.[0]?.event?.name || 'N/A';
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

      // Build htmlContent using canonical layout (matches your Sub Event Dish Report)
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
        Event: ${subEventResponse?.data?.name || 'N/A'} |
        Start Date: ${
          subEventResponse?.data?.startDate
            ? new Date(subEventResponse.data.startDate).toLocaleDateString(
                'en-GB',
                {day: '2-digit', month: 'short', year: 'numeric'},
              )
            : 'N/A'
        } |
        End Date: ${
          subEventResponse?.data?.endDate
            ? new Date(subEventResponse.data.endDate).toLocaleDateString(
                'en-GB',
                {day: '2-digit', month: 'short', year: 'numeric'},
              )
            : 'N/A'
        }
        </div>
      </div>
    `;

      // Table header (same columns as your original)
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

      // Rows (preserve values, zebra rows)
      utensilsToShow.forEach((item, idx) => {
        const missing = (item.taken || 0) - (item.updateReturned || 0);
        htmlContent += `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'}; page-break-inside: avoid; break-inside: avoid;">
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.categoryName}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.utensilName}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.taken ?? 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.updateReturned ?? 0}</td>
          ${reportType === 'missing' ? `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#d9534f;">${missing}</td>` : ''}
        </tr>
      `;
      });

      htmlContent += `
        </tbody>
      </table>
    `;

      // final printable document (canonical CSS + repeat-title shown on pages 2+)
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
        <title>${reportType === 'missing' ? 'Missing Utensils Report' : 'Event Utensil Report'} - ${subEventResponse?.data?.name}</title>
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
          table { width:100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          @media print {
            .repeat-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { page-break-after: auto; }
            tr    { page-break-inside: avoid; page-break-after: auto; }
            td    { page-break-inside: avoid; page-break-after: auto; }
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
          // allow first-page render, then print and close
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
    } catch (err) {
      console.error('Failed to generate utensil PDF', err);
      alert(
        'An error occurred while generating the utensil PDF. See console for details.',
      );
    }
  };
  const groupedUtensils = React.useMemo(() => {
    return utensilList.reduce(
      (acc, item, index) => {
        const cat = item.categoryName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({...item, originalIndex: index});
        return acc;
      },
      {} as Record<string, (EventUtensil & {originalIndex: number})[]>,
    );
  }, [utensilList]);

  // 3. ROBUST AUTO-SELECT EFFECT
  useEffect(() => {
    const categories = Object.keys(groupedUtensils);

    // Only proceed if we actually have data grouped
    if (categories.length > 0) {
      // Logic: If no category is open, OR the currently open category
      // is no longer in the list (invalid), select the first one.
      if (!openCategory || !groupedUtensils[openCategory]) {
        setOpenCategory(categories[0]);
      }
    }
  }, [groupedUtensils, openCategory]);

  // 3. EFFECT: Auto-select the first category by default
  useEffect(() => {
    const categories = Object.keys(groupedUtensils);
    // Only set if categories exist and no category is currently selected
    if (categories.length > 0 && !openCategory) {
      setOpenCategory(categories[0]);
    }
  }, [groupedUtensils, openCategory]);

  // 3. Auto-select the first category on load
  useEffect(() => {
    const categories = Object.keys(groupedUtensils);
    if (categories.length > 0 && !openCategory) {
      setOpenCategory(categories[0]);
    }
  }, [groupedUtensils, openCategory]);

  return (
    <div className="bg-transparent">
      {' '}
      <div className="dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 rounded-t-lg bg-blue-900 px-4 py-4 text-white sm:px-6 sm:py-5">
          {/* Mobile: Compact, Desktop: Normal */}
          <div className="flex items-center justify-between sm:flex-row sm:items-center sm:justify-between">
            {/* Title */}
            <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
              Utensil Checking
            </h2>

            {/* Controls - Hidden on mobile until expanded */}
            <div className="flex items-center gap-2">
              {/* Mobile: Show only toggle button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="rounded-full p-2 text-white hover:bg-blue-800"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <BiChevronUp size={20} />
                  ) : (
                    <BiChevronDown size={20} />
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
                  className="border-gray-300 dark:border-gray-600 rounded-md border bg-white px-3 py-1.5 text-sm text-neutral-700 dark:bg-meta-4 dark:text-white"
                >
                  <option value="regular">Regular Report</option>
                  <option value="missing">Missing Report</option>
                </select>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                >
                  Download PDF
                </button>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="rounded-full p-1.5 text-white hover:bg-blue-800"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <BiChevronUp size={20} />
                  ) : (
                    <BiChevronDown size={20} />
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
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 w-full rounded-md border bg-white px-4 py-3 text-sm text-neutral-700 dark:text-white"
              >
                <option value="regular">Regular Report</option>
                <option value="missing">Missing Report</option>
              </select>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={tableRef} className="space-y-4">
                {/* --- TABS SECTION --- */}
                <div className="overflow-x-auto">
                  <div className="bg-gray-50 flex items-center border-b border-stroke dark:border-strokedark dark:bg-boxdark-2">
                    <div className="scrollbar-hide flex-1 overflow-x-auto">
                      <div className="flex min-w-max gap-1">
                        {Object.keys(groupedUtensils).map((category) => {
                          const isActive = openCategory === category;
                          return (
                            <div
                              key={category}
                              onClick={() => setOpenCategory(category)}
                              className={`cursor-pointer select-none whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-purple-50 dark:hover:bg-purple-800/50 ${
                                isActive
                                  ? 'border-purple-600 bg-purple-100 text-purple-600 shadow-sm dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-purple-300'
                              }`}
                            >
                              {category}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- TABLE SECTION --- */}
                {/* --- TABLE SECTION --- */}
                {openCategory && groupedUtensils[openCategory] && (
                  <div className="rounded-lg border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke p-3 dark:border-strokedark">
                      <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                        {openCategory}
                      </h3>
                    </div>

                    <div className="overflow-x-auto p-2">
                      <table className="w-full table-fixed border-collapse text-sm">
                        <thead className="text-gray-600 dark:text-gray-300 bg-blue-100 text-xs font-semibold uppercase dark:bg-meta-4">
                          <tr>
                            {/* Reduced py-3 to py-2 for headers */}
                            <th className="w-2/5 px-4 py-2 text-left">
                              Utensil
                            </th>
                            <th className="w-1/5 px-4 py-2 text-center">
                              Outward
                            </th>
                            <th className="w-2/5 px-4 py-2 text-left">
                              Inward
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-gray-200 dark:divide-gray-700 divide-y">
                          {groupedUtensils[openCategory].map((item) => (
                            <tr
                              key={`${item.categoryName}-${item.utensilId}`}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              {/* Reduced py-3 to py-1 for tighter rows */}
                              <td className="text-gray-900 px-4 py-3 font-medium dark:text-white">
                                {item.utensilName || 'Unknown'}
                              </td>

                              <td className="text-gray-800 px-4 py-3 text-center dark:text-white">
                                {item.taken || 0}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex max-w-[150px] items-center">
                                  <GenericInputField
                                    name={`utensils.${item.originalIndex}.updateReturned`}
                                    type="number"
                                    placeholder="0"
                                    className="w-full"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* --- SUBMIT BUTTON --- */}
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-6 flex justify-end">
                  <GenericButton
                    type="submit"
                    disabled={isPending}
                    className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save'}
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

export default UtensilChecking;

{
  /* 
        {isOpen && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={tableRef} className="overflow-x-auto">
                <table className="text-gray-500 dark:text-gray-400 w-full text-left text-sm">
                  <thead className="text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 bg-gray-2 text-xs uppercase dark:bg-black">
                    <tr className="bg-blue-100 p-2">
                      <th scope="col" className="px-6 py-6">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Utensil
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Outward
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Inward
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {utensilList.map((item, index) => (
                      <tr
                        key={index}
                        className="dark:bg-gray-800 dark:border-gray-700 border-b bg-transparent"
                      >
                        <td className="text-gray-900 px-6 py-4 font-medium dark:text-white">
                          {item.categoryName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          {item.utensilName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">{item.taken}</td>
                        <td className="w-40 px-6 py-4">
                          <GenericInputField
                            name={`utensils.${index}.updateReturned`}
                            type="number"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <GenericButton
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <FiSave /> {isPending ? 'Saving...' : 'Save '}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        )} */
}
