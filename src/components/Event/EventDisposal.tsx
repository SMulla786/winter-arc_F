/* eslint-disable */

/////////////////////////////////////////////

import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import {z} from 'zod';
import {bulkAddDisposalToEventSchema} from '@/lib/validation/eventSchema';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {Route} from '@/routes/_app/_event/events.$id';
import {useBulkAddEventDisposal} from '@/lib/react-query/queriesAndMutations/cateror/eventDisposal';
import {useState, useEffect, useMemo} from 'react';
import {FiPrinter, FiSave} from 'react-icons/fi';
import {Loader} from '../Loader/Loader';
import {useAuthContext} from '@/context/AuthContext';
import {useGetDisposalPeople} from '@/lib/react-query/queriesAndMutations/cateror/assignpreople';
import {useGetDisposals} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {toast} from 'react-hot-toast';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
interface Disposal {
  id: string;
  name: string;
  categoryId: string;
  inventory: number;
  category?: {
    id: string;
    name: string;
  };
}

interface DisposalTemplateItem {
  id: string;
  disposalId: string;
  quantity: number;
  disposal: {
    id: string;
    name: string;
    categoryId: string;
    inventory: number;
    category?: {
      id: string;
      name: string;
    };
  };
}

interface DisposalTemplate {
  id: string;
  people: number;
  utensilTemplateItems: DisposalTemplateItem[];
}

type FormValues = z.infer<typeof bulkAddDisposalToEventSchema>;

const EventDisposal: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.eventDisposals;
  const role = user?.role;
  const languageId = localStorage.getItem('languageId');
  const {id: EventId} = Route.useParams();
  const [peopleCount, setPeopleCount] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>('100');
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const catererId = user?.caterorId || '';
  const {data: catererData} = useGetCaterorById(catererId);
  // Fetch sub-event data for PDF
  const catererLogo = catererData?.data?.image || '';
  const {data: subEventResponse, isLoading: isLoadingSubEvent} =
    useGetSubevent(EventId);

  // Use disposals query for inventory data
  const {
    data: disposalsApiData,
    error: disposalsError,
    isLoading: isLoadingDisposals,
  } = useGetDisposals(languageId);

  const {
    data: apiData,
    isPending: isLoading,
    error,
  } = useGetDisposalPeople(languageId);

  // Transform disposals data to a map for quick lookup
  const disposalsMap = useMemo(() => {
    const map = new Map<string, Disposal>();
    if (disposalsApiData?.data) {
      disposalsApiData.data.forEach((disposal: Disposal) => {
        map.set(disposal.id, disposal);
      });
    }
    return map;
  }, [disposalsApiData]);

  const {mutate: bulkAddEventDisposal, isPending} = useBulkAddEventDisposal({
    onSuccess: () => {
      // toast.success('Saved successfully!');
      setHasSubmitted(true);
      setIsEditing(true);
    },
    onError: (error) => {
      console.error('Failed to save:', error);
      toast.error('Failed to save disposal quantities. Please try again.');
    },
  });

  const methods = useForm<FormValues>({
    defaultValues: {
      eventId: EventId,
      disposals: [],
    },
    shouldUnregister: false,
  });

  const {control, reset, handleSubmit, watch, setValue} = methods;
  const {fields, replace} = useFieldArray({
    name: 'disposals',
    control,
  });

  // Watch form values
  const formValues = watch('disposals');

  // Extract templates from API data
  const templates: DisposalTemplate[] = Array.isArray(apiData?.data)
    ? apiData.data
    : Array.isArray(apiData)
      ? apiData
      : [];

  // Find the best matching template
  const findBestTemplate = (people: number) => {
    if (templates.length === 0) {
      return null;
    }

    const exactMatch = templates.find(
      (t) =>
        t.people === people &&
        t.utensilTemplateItems &&
        t.utensilTemplateItems.length > 0,
    );
    if (exactMatch) {
      return exactMatch;
    }

    const templatesWithItems = templates.filter(
      (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
    );

    if (templatesWithItems.length === 0) {
      return null;
    }

    const closest = templatesWithItems.reduce((prev, curr) =>
      Math.abs(curr.people - people) < Math.abs(prev.people - people)
        ? curr
        : prev,
    );

    return closest;
  };

  // Load or scale from template
  const loadDisposalQuantities = (people: number) => {
    const template = findBestTemplate(people);

    if (
      !template ||
      !template.utensilTemplateItems ||
      template.utensilTemplateItems.length === 0
    ) {
      const availableTemplates = templates
        .filter(
          (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
        )
        .map((t) => t.people);
      alert(
        `No disposal template data found for ${people} people. Available templates: ${availableTemplates.join(', ')}`,
      );
      return;
    }

    const scaledDisposals = template.utensilTemplateItems.map(
      (item: DisposalTemplateItem, index: number) => {
        // Apply the formula: requiredQuantity = (quantity * people) / 100
        const baseQuantity = item.quantity;
        const requiredQuantity = Math.ceil((baseQuantity * people) / 100);

        const inventoryItem = disposalsMap.get(item.disposalId);
        const inventory =
          inventoryItem?.inventory || item.disposal.inventory || 0;

        const calculatedOrder = Math.max(0, requiredQuantity - inventory);

        const categoryId =
          inventoryItem?.categoryId || item.disposal.categoryId;
        const categoryName =
          inventoryItem?.category?.name ||
          item.disposal.category?.name ||
          'Uncategorized';

        return {
          disposalId: item.disposalId,
          taken: inventory,
          inventory: inventory,
          ordered: calculatedOrder,
          requiredQuantity: requiredQuantity,
          categoryId: categoryId,
          disposalName: inventoryItem?.name || item.disposal.name,
          categoryName: categoryName,
          originalTemplateQuantity: item.quantity,
          templatePeople: 100, // Always use 100 as base
          baseQuantity: item.quantity, // This is the quantity for 100 people
          calculatedRequiredQuantity: requiredQuantity,
        };
      },
    );

    replace(scaledDisposals);
    scaledDisposals.forEach((item, index) => {
      setValue(`disposals.${index}.requiredQuantity`, item.requiredQuantity);
      setValue(`disposals.${index}.taken`, item.taken);
      setValue(`disposals.${index}.ordered`, item.ordered);
    });

    setPeopleCount(people);
    setInputValue(people.toString());
    setIsEditing(true);
    setHasSubmitted(false);
  };

  // Auto-load on mount
  useEffect(() => {
    if (
      templates.length > 0 &&
      fields.length === 0 &&
      !hasSubmitted &&
      disposalsMap.size > 0
    ) {
      loadDisposalQuantities(100);
    }
  }, [templates, fields.length, hasSubmitted, disposalsMap]);

  const handlePeopleSubmit = () => {
    const num = parseInt(inputValue);
    if (num > 0) {
      loadDisposalQuantities(num);
    } else {
      alert('Please enter a valid number of people');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePeopleSubmit();
    }
  };

  // Watch for changes
  const watchDisposals = watch('disposals');
  useEffect(() => {
    if (watchDisposals && watchDisposals.length > 0 && isEditing) {
      watchDisposals.forEach((disposal: any, index: number) => {
        const requiredQuantity = Number(disposal.requiredQuantity) || 0;
        const inventory = Number(disposal.inventory) || 0;

        const calculatedOrder = Math.max(0, requiredQuantity - inventory);

        if (Number(disposal.ordered) !== calculatedOrder) {
          setValue(`disposals.${index}.ordered`, calculatedOrder);
        }

        if (Number(disposal.taken) !== inventory) {
          setValue(`disposals.${index}.taken`, inventory);
        }
      });
    }
  }, [watchDisposals, setValue, isEditing]);

  // Helper function to get current required quantity
  const getCurrentRequiredQuantity = (disposal: any) => {
    if (
      disposal.fieldIndex !== undefined &&
      formValues?.[disposal.fieldIndex]?.requiredQuantity !== undefined
    ) {
      return formValues[disposal.fieldIndex].requiredQuantity;
    }
    // Calculate using formula if not in form values
    const baseQuantity = disposal.baseQuantity || 0;
    return Math.ceil((baseQuantity * peopleCount) / 100);
  };

  // Group by category for display
  const groupedDisposals = useMemo(() => {
    const currentTemplate = findBestTemplate(peopleCount);
    if (
      !currentTemplate ||
      !currentTemplate.utensilTemplateItems ||
      currentTemplate.utensilTemplateItems.length === 0
    ) {
      return {};
    }

    const groups: Record<
      string,
      {
        categoryName: string;
        items: any[];
      }
    > = {};

    currentTemplate.utensilTemplateItems.forEach(
      (item: DisposalTemplateItem, index: number) => {
        const inventoryItem = disposalsMap.get(item.disposalId);
        const disposal = inventoryItem || item.disposal;

        const categoryId = disposal.categoryId || 'uncategorized';
        const categoryName = disposal.category?.name || 'Uncategorized';

        if (!groups[categoryId]) {
          groups[categoryId] = {
            categoryName: categoryName,
            items: [],
          };
        }

        // Calculate using formula: (baseQuantity * peopleCount) / 100
        const baseQuantity = item.quantity;
        const currentRequiredQty = Math.ceil(
          (baseQuantity * peopleCount) / 100,
        );

        const inventory = disposal.inventory || 0;
        const calculatedOrder = Math.max(0, currentRequiredQty - inventory);

        groups[categoryId].items.push({
          ...disposal,
          id: disposal.id,
          name: disposal.name,
          currentRequiredQuantity: currentRequiredQty,
          inventory: inventory,
          calculatedOrder: calculatedOrder,
          fieldIndex: index,
          baseQuantity: item.quantity, // Quantity for 100 people
          templatePeople: 100, // Always 100 as base
          categoryId: categoryId,
          categoryName: categoryName,
        });
      },
    );

    return groups;
  }, [templates, peopleCount, disposalsMap]); // Remove formValues from dependencies

  // WORKING PDF GENERATION FUNCTION
  const handleDownloadPDF = () => {
    const disposalList = methods.getValues('disposals') || [];
    if (!disposalList.length) {
      toast.error('No disposal data available to print');
      return;
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const getFormValue = (index: number, field: string) => {
      if (!watchDisposals || !watchDisposals[index]) return 0;
      return Number(watchDisposals[index][field]) || 0;
    };

    // Split categories into balanced left/right columns
    const allCategories = Object.entries(groupedDisposals || {});
    const leftCategories: [string, any[]][] = [];
    const rightCategories: [string, any[]][] = [];
    let leftCount = 0;
    let rightCount = 0;

    allCategories.forEach(([catId, catData]: any) => {
      const rowCount = catData.items.length;
      if (leftCount <= rightCount) {
        leftCategories.push([catId, catData.items]);
        leftCount += rowCount;
      } else {
        rightCategories.push([catId, catData.items]);
        rightCount += rowCount;
      }
    });

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

    // === Build HTML using STANDARD FORMAT ===
    let htmlContent = `
      <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <!-- Logo -->
      <td width="10%" align="left" valign="middle">
        ${
          catererLogo
            ? `<img 
                src="${catererLogo}" 
                alt="Caterer Logo"
                style="max-height:60px; max-width:150px; object-fit:contain;"
              />`
            : ''
        }
      </td>

      <!-- Text -->
      <td width="90%" align="center">
        <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
          ${user?.fullname || 'Caterer Name'}
        </h1>

        <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
          ${user?.address ? `Address - ${user.address}` : ''} ${
            user?.email ? ` | Email - ${user.email}` : ''
          } | Mob.${user?.phoneNumber || ''}
        </p>
      </td>
    </tr>
  </table>
</div>

    <!-- TITLE BAR -->
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
      <h2 style="margin:0; font-size:16px;">Event Disposals Report</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        Event: ${subEventResponse?.data?.name || 'N/A'} |
        Start: ${formatDate(subEventResponse?.data?.startDate)} |
        End: ${formatDate(subEventResponse?.data?.endDate)} |
        People: ${peopleCount || 'N/A'}
      </div>
    </div>

    <!-- TWO-COLUMN LAYOUT -->
    <div style="display: flex; gap: 20px; justify-content: space-between;">
      <div style="width: 48%;">
  `;

    // Left Column
    leftCategories.forEach(([categoryId, items]: [string, any[]]) => {
      const categoryName =
        groupedDisposals[categoryId]?.categoryName || 'Uncategorized';
      htmlContent += `
      <div style="margin-bottom: 16px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; text-align: left; color: #0D47A1;">
          ${categoryName}
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Sr.</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Disposal Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Inventory</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Taken</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Order</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Required Qty</th>
            </tr>
          </thead>
          <tbody>
    `;

      items.forEach((item: any, idx: number) => {
        htmlContent += `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${idx + 1}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700; padding-left:12px;">${item.name}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.inventory || 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${getFormValue(item.fieldIndex, 'taken') || item.inventory || 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${getFormValue(item.fieldIndex, 'ordered') || item.calculatedOrder || 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${getFormValue(item.fieldIndex, 'requiredQuantity') || item.currentRequiredQuantity || 0}</td>
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

    // Right Column
    rightCategories.forEach(([categoryId, items]: [string, any[]]) => {
      const categoryName =
        groupedDisposals[categoryId]?.categoryName || 'Uncategorized';
      htmlContent += `
      <div style="margin-bottom: 16px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; text-align: left; color: #0D47A1;">
          ${categoryName}
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Sr.</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Disposal Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Inventory</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Taken</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Order</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Required Qty</th>
            </tr>
          </thead>
          <tbody>
    `;

      items.forEach((item: any, idx: number) => {
        htmlContent += `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${idx + 1}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700; padding-left:12px;">${item.name}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.inventory || 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${getFormValue(item.fieldIndex, 'taken') || item.inventory || 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${getFormValue(item.fieldIndex, 'ordered') || item.calculatedOrder || 0}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${getFormValue(item.fieldIndex, 'requiredQuantity') || item.currentRequiredQuantity || 0}</td>
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

    // <!-- SIGNATURE LINE -->
    // <div style="margin-top: 30px; text-align: right;">
    //   <p style="border-top: 1px solid #0D47A1; padding-top: 8px; display: inline-block;">
    //     Signature: _______________________________
    //   </p>
    // </div>

    // === Open print window with STANDARD print styling ===
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
      <title>Event Disposals Report - ${subEventResponse?.data?.name || 'N/A'}</title>
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

  const onSubmit = (data: FormValues) => {
    const filteredDisposals = data.disposals
      .filter(
        (disposal) => disposal.ordered > 0 || disposal.requiredQuantity > 0,
      )
      .map((disposal) => ({
        disposalId: disposal.disposalId,
        taken: Number(disposal.taken),
        ordered: Number(disposal.ordered),
        requiredQuantity: Number(disposal.requiredQuantity),
        total_taken: Number(disposal.requiredQuantity),
      }));

    if (filteredDisposals.length === 0) {
      alert('No disposals to save. Please check your entries.');
      return;
    }

    bulkAddEventDisposal({
      eventId: EventId,
      disposals: filteredDisposals,
    });
  };

  // Update loading state
  if (isPending || isLoading || isLoadingDisposals || isLoadingSubEvent) {
    return <Loader />;
  }

  // Show error state if API fails
  if (error || disposalsError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">
          Error loading data:{' '}
          {(error as Error)?.message || (disposalsError as Error)?.message}
        </div>
      </div>
    );
  }

  // Check if we have any templates with data
  const templatesWithData = templates.filter(
    (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
  );

  // if (templates.length === 0) {
  //   return (
  //     <div className="flex h-64 items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-gray-700 mb-4 text-2xl font-bold">
  //           No Disposal Templates Found
  //         </h2>
  //         <p className="text-gray-600">
  //           Please create disposal templates first.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (templatesWithData.length === 0) {
  //   return (
  //     <div className="flex h-64 items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-gray-700 mb-4 text-2xl font-bold">
  //           No Disposal Template Data
  //         </h2>
  //         <p className="text-gray-600">
  //           Templates exist but contain no disposal data. Available templates:{' '}
  //           {templates.map((t) => t.people).join(', ')}
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="bg-transparent">
        <div className="mb-6 flex flex-col rounded-lg bg-blue-900 p-4 shadow-md sm:flex-row sm:justify-between sm:p-6">
          <h2 className="mb-4 text-center text-xl font-bold text-white sm:mb-0 sm:text-left sm:text-2xl">
            Event Disposals
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* People Count Input - Stack on mobile, row on desktop */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="mb-1 text-center text-sm font-medium text-white sm:mb-0 sm:text-left">
                People:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-gray-300 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-meta-4 sm:w-32"
                  placeholder="Enter people count..."
                />
                <button
                  type="button"
                  onClick={handlePeopleSubmit}
                  className="whitespace-nowrap rounded-md border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-2">
              {Object.entries(groupedDisposals).map(
                ([categoryId, categoryData]) => (
                  <div key={categoryId} className="space-y-2">
                    <div className="cursor-pointer rounded-lg border-b-2 border-blue-100 bg-sky-50 p-4 text-sm text-blue-500 transition-all duration-200 dark:border-blue-400 dark:bg-meta-4 dark:text-blue-400">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                          {categoryData.categoryName}
                          <span className="text-gray-600 ml-2 text-sm">
                            ({categoryData.items.length} items)
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
                      <div className="max-h-96 overflow-x-auto overflow-y-auto">
                        <table className="w-full min-w-full table-auto">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                              <th className="text-gray-700 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
                                Name
                              </th>
                              <th className="text-gray-700 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
                                Inventory
                              </th>
                              <th className="text-gray-700 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
                                Taken
                              </th>
                              <th className="text-gray-700 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
                                Order
                              </th>
                              <th className="text-gray-700 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider dark:text-white">
                                Required Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stroke bg-white dark:divide-neutral-600 dark:bg-boxdark">
                            {categoryData.items?.map((disposal: any) => {
                              const fieldIndex = disposal.fieldIndex;

                              if (
                                fieldIndex === undefined ||
                                fieldIndex === -1
                              ) {
                                return null;
                              }

                              const currentRequiredQty =
                                getCurrentRequiredQuantity(disposal);
                              const inventory = disposal.inventory || 0;
                              const calculatedOrder = Math.max(
                                0,
                                currentRequiredQty - inventory,
                              );

                              return (
                                <tr
                                  key={disposal.id}
                                  className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <td className="text-gray-700 dark:text-gray-300 whitespace-nowrap px-3 py-3 text-center text-sm font-medium">
                                    {disposal.name}
                                  </td>
                                  <td className="text-gray-700 dark:text-gray-300 whitespace-nowrap px-3 py-3 text-center text-sm">
                                    {inventory}
                                  </td>

                                  {/* Taken Field */}
                                  <td className="whitespace-nowrap px-3 py-3 text-center">
                                    <GenericInputField
                                      name={`disposals.${fieldIndex}.taken`}
                                      type="number"
                                      defaultValue={inventory}
                                      min={0}
                                      disabled={true}
                                      className="w-20 text-center"
                                    />
                                  </td>

                                  {/* Order Field */}
                                  <td className="whitespace-nowrap px-3 py-3 text-center">
                                    <GenericInputField
                                      name={`disposals.${fieldIndex}.ordered`}
                                      type="number"
                                      defaultValue={calculatedOrder}
                                      min={0}
                                      disabled={true}
                                      className="w-20 text-center"
                                    />
                                  </td>

                                  {/* Required Quantity Field */}
                                  <td className="whitespace-nowrap px-3 py-3 text-center">
                                    <GenericInputField
                                      name={`disposals.${fieldIndex}.requiredQuantity`}
                                      type="number"
                                      defaultValue={currentRequiredQty}
                                      min={0}
                                      className="w-20 text-center"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {fields.length > 0 &&
              (role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-8 flex justify-end">
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
      </div>
    </div>
  );
};

export default EventDisposal;
