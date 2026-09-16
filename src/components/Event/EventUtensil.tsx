/* eslint-disable */
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {FiSave, FiPrinter} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {
  useAddEventUtensils,
  useGetUtensilsPeople,
} from '@/lib/react-query/queriesAndMutations/cateror/assignpreople';
import {Loader} from '../Loader/Loader';
import {toast} from 'react-hot-toast';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
// Define the form data structure
interface UtensilFormData {
  utensilId: string;
  quantity: number;
  baseQuantity?: number;
  templatePeople?: number;
  calculatedQuantity?: number;
}

interface FormValues {
  utensils: UtensilFormData[];
}

// Define the API payload structure
interface EventUtensilsPayload {
  eventId: string;
  utensils: {
    utensilId: string;
    taken: number;
  }[];
}

interface UtensilTemplateItem {
  id: string;
  utensilId: string;
  quantity: number;
  utensil: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface UtensilTemplate {
  id: string;
  people: number;
  utensilTemplateItems: UtensilTemplateItem[];
}

const EventUtensil: React.FC = () => {
  const {user} = useAuthContext();
  const [peopleCount, setPeopleCount] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>('100');
  const [isEditing, setIsEditing] = useState<boolean>(true); // Always editable now
  const {id} = Route.useParams();
  const languageId = localStorage.getItem('languageId') || '';
  const catererId = user?.caterorId || '';
  const {data: catererData} = useGetCaterorById(catererId);
  const catererLogo = catererData?.data?.image || '';

  const {
    data: apiData,
    isPending: isLoading,
    error,
  } = useGetUtensilsPeople(languageId);
  console.log('Full API response:', apiData);

  const {mutate: saveEventUtensils, isPending: isSaving} =
    useAddEventUtensils();

  const methods = useForm<FormValues>({
    defaultValues: {utensils: []},
  });

  const {control, handleSubmit, watch, reset, setValue} = methods;
  const {fields, replace} = useFieldArray({control, name: 'utensils'});

  // Watch form values
  const formValues = watch('utensils');

  // Extract templates from API data
  const templates: UtensilTemplate[] = Array.isArray(apiData?.data)
    ? apiData.data
    : Array.isArray(apiData)
      ? apiData
      : [];
  console.log('Extracted templates:', templates);

  const findBestTemplate = (people: number) => {
    if (templates.length === 0) {
      console.log('No templates available');
      return null;
    }

    // First try to find template for 100 people (since our formula is based on 100)
    const templateFor100 = templates.find(
      (t) =>
        t.people === 100 &&
        t.utensilTemplateItems &&
        t.utensilTemplateItems.length > 0,
    );

    if (templateFor100) {
      console.log('Found template for 100 people');
      return templateFor100;
    }

    // Then try exact match
    const exactMatch = templates.find(
      (t) =>
        t.people === people &&
        t.utensilTemplateItems &&
        t.utensilTemplateItems.length > 0,
    );
    if (exactMatch) {
      console.log(
        'Found exact match:',
        exactMatch.people,
        'people with',
        exactMatch.utensilTemplateItems.length,
        'items',
      );
      return exactMatch;
    }

    // Then try any template with items
    const templatesWithItems = templates.filter(
      (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
    );
    console.log(
      'Templates with items:',
      templatesWithItems.map((t) => t.people),
    );

    if (templatesWithItems.length === 0) {
      console.log('No templates with items found');
      return null;
    }

    // Find closest match
    const closest = templatesWithItems.reduce((prev, curr) =>
      Math.abs(curr.people - people) < Math.abs(prev.people - people)
        ? curr
        : prev,
    );

    console.log('Using closest match:', closest.people, 'people');
    return closest;
  };

  const loadQuantities = (people: number) => {
    const template = findBestTemplate(people);

    if (
      !template ||
      !template.utensilTemplateItems ||
      template.utensilTemplateItems.length === 0
    ) {
      console.log('No valid template found for', people, 'people');
      const availableTemplates = templates
        .filter(
          (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
        )
        .map((t) => t.people);
      alert(
        `No template data found for ${people} people. Available templates: ${availableTemplates.join(', ')}`,
      );
      return;
    }

    // Calculate scaled quantities using the formula: (baseQuantity * people) / 100
    // Since template quantities are based on 100 people, we assume baseQuantity is for 100 people
    const scaled = template.utensilTemplateItems.map(
      (item: UtensilTemplateItem) => {
        // The new formula: (quantity * people) / 100
        const calculatedQuantity = Math.ceil((item.quantity * people) / 100);

        return {
          utensilId: item.utensilId,
          quantity: calculatedQuantity,
          baseQuantity: item.quantity, // This is quantity for 100 people
          templatePeople: 100, // Always assume base is 100 people
          calculatedQuantity: calculatedQuantity,
        };
      },
    );

    console.log('Scaled quantities for', people, 'people:', scaled);

    // First replace the entire array
    replace(scaled);

    // Then manually set each field value to trigger re-render
    scaled.forEach((item, index) => {
      setValue(`utensils.${index}.quantity`, item.quantity);
    });

    setPeopleCount(people);
    setInputValue(people.toString());
    setIsEditing(true);
  };

  // Update the useEffect to find template for 100 people
  useEffect(() => {
    console.log(
      'useEffect triggered - templates:',
      templates.length,
      'fields:',
      fields.length,
    );
    if (templates.length > 0 && fields.length === 0) {
      console.log('Auto-loading quantities for 100 people');
      // Find template with 100 people specifically
      const templateFor100 = templates.find(
        (t) =>
          t.people === 100 &&
          t.utensilTemplateItems &&
          t.utensilTemplateItems.length > 0,
      );

      if (templateFor100) {
        loadQuantities(100);
      } else {
        // Fallback to any template but show warning
        console.warn(
          'No template found specifically for 100 people, using available template',
        );
        loadQuantities(100);
      }
    }
  }, [templates, fields.length]);

  const handlePeopleSubmit = () => {
    const num = parseInt(inputValue);
    if (num > 0) {
      loadQuantities(num);
    } else {
      alert('Please enter a valid number of people');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePeopleSubmit();
    }
  };

  const groupedUtensils = useMemo(() => {
    // Since we're using (quantity * people) / 100 formula,
    // we don't need template people for calculation

    // Find a template (any will do since base is always 100)
    const template = templates.find(
      (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
    );

    if (!template) {
      console.log('No template found for grouping');
      return {};
    }

    const groups: Record<
      string,
      {
        categoryName: string;
        items: any[];
      }
    > = {};

    template.utensilTemplateItems.forEach(
      (item: UtensilTemplateItem, index: number) => {
        const utensil = item.utensil;
        const category = utensil.category;
        const catId = category.id;

        if (!groups[catId]) {
          groups[catId] = {
            categoryName: category.name,
            items: [],
          };
        }

        // Get the current quantity from form or calculate using new formula
        const formQuantity = formValues?.[index]?.quantity;
        const calculatedQuantity = Math.ceil(
          (item.quantity * peopleCount) / 100,
        );
        const currentQty =
          formQuantity !== undefined ? formQuantity : calculatedQuantity;

        groups[catId].items.push({
          ...utensil,
          id: utensil.id,
          currentQuantity: currentQty,
          fieldIndex: index,
          baseQuantity: item.quantity, // Quantity for 100 people
          templatePeople: 100, // Always 100 as base
          calculatedQuantity: calculatedQuantity,
          utensilId: item.utensilId,
        });
      },
    );

    console.log('Grouped utensils:', Object.keys(groups).length, 'categories');
    return groups;
  }, [templates, peopleCount, formValues]);

  // Helper function to get the current quantity value
  const getCurrentQuantity = (utensil: any) => {
    if (utensil.fieldIndex !== undefined) {
      // Get the current value from form or use the calculated quantity
      const formValue = methods.getValues(
        `utensils.${utensil.fieldIndex}.quantity`,
      );
      return formValue !== undefined ? formValue : utensil.calculatedQuantity;
    }
    return utensil.calculatedQuantity;
  };
  // Submit handler
  const onSubmit = (data: FormValues) => {
    console.log('Submitting form data:', data);

    if (!data.utensils || data.utensils.length === 0) {
      toast.error('No utensil data available to save');
      return;
    }

    // Validate that all required fields are present
    const validUtensils = data.utensils.filter((u) => {
      const isValid =
        u &&
        u.utensilId &&
        u.utensilId.trim() !== '' &&
        u.quantity !== undefined &&
        u.quantity !== null;
      if (!isValid) {
        console.warn('Invalid utensil data:', u);
      }
      return isValid;
    });

    if (validUtensils.length === 0) {
      toast.error('Please enter valid quantities for at least one utensil');
      return;
    }

    // Prepare the payload in the exact format the API expects
    const payload: EventUtensilsPayload = {
      eventId: id,
      utensils: validUtensils.map((u) => ({
        utensilId: u.utensilId.trim(),
        taken: Number(u.quantity) || 0,
      })),
    };

    console.log('Sending to API:', JSON.stringify(payload, null, 2));

    saveEventUtensils(payload, {
      onSuccess: (response) => {
        console.log('Successfully saved utensil quantities:', response);
        toast.success('Saved successfully!');
        // Keep editing enabled after save
        setIsEditing(true);
      },
      onError: (error) => {
        console.error('Failed to save:', error);
        toast.error('Failed to save utensil quantities. Please try again.');
      },
    });
  };

  // Print functionality (keep exactly the same as your original)
  const handlePrint = () => {
    const utensilList = methods.getValues('utensils') || [];

    if (utensilList.length === 0) {
      toast.error('No utensils data available to print');
      return;
    }

    // Group by category (assuming groupedUtensils is available in scope as before)
    const groupedByCategory: Record<string, any[]> = {};

    Object.entries(groupedUtensils).forEach(([categoryId, categoryData]) => {
      groupedByCategory[categoryId] = categoryData.items.map((item, index) => ({
        name: item.name,
        quantity: getCurrentQuantity(item),
        fieldIndex: item.fieldIndex,
        index: index,
      }));
    });

    // Split categories into two balanced columns by total item count
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

    const allCategoryEntries = Object.entries(groupedByCategory);
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

    // Build HTML content using your STANDARD layout
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
      <h2 style="margin:0; font-size:16px;">Event Utensils Report</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        People Count: ${peopleCount} |
        Date: ${printedDateStr} ${printedTimeStr}
      </div>
    </div>

    <!-- TWO-COLUMN LAYOUT -->
    <div style="display: flex; gap: 20px; justify-content: space-between;">
      <div style="width: 48%;">

  `;

    // Left column categories
    leftCategories.forEach(([categoryId, utensils]) => {
      const categoryName =
        groupedUtensils[categoryId]?.categoryName || 'Uncategorized';
      htmlContent += `
      <div style="margin-bottom: 16px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; text-align: left;">
          ${categoryName}
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Sr.</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Utensil Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Quantity</th>
            </tr>
          </thead>
          <tbody>
    `;

      utensils.forEach((utensil, idx) => {
        htmlContent += `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${idx + 1}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700; padding-left:12px;">${utensil.name}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${utensil.quantity}</td>
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
    rightCategories.forEach(([categoryId, utensils]) => {
      const categoryName =
        groupedUtensils[categoryId]?.categoryName || 'Uncategorized';
      htmlContent += `
      <div style="margin-bottom: 16px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; text-align: left;">
          ${categoryName}
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Sr.</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Utensil Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center; font-weight:700;">Quantity</th>
            </tr>
          </thead>
          <tbody>
    `;

      utensils.forEach((utensil, idx) => {
        htmlContent += `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${idx + 1}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700; padding-left:12px;">${utensil.name}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${utensil.quantity}</td>
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

    // Open print window with identical styling and behavior as your standard PDF
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
      <title>Event Utensils Report</title>
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
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="mb-4 text-2xl font-bold">Error Loading Templates</h2>
          <p>{(error as Error)?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Check if we have any templates with data
  // const templatesWithData = templates.filter(
  //   (t) => t.utensilTemplateItems && t.utensilTemplateItems.length > 0,
  // );

  // if (templates.length === 0) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-gray-700 mb-4 text-2xl font-bold">
  //           No Templates Found
  //         </h2>
  //         <p className="text-gray-600">
  //           Please create utensil templates first.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (templatesWithData.length === 0) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-gray-700 mb-4 text-2xl font-bold">
  //           No Template Data
  //         </h2>
  //         <p className="text-gray-600">
  //           Templates exist but contain no utensil data. Available templates:{' '}
  //           {templates.map((t) => t.people).join(', ')}
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
            {/* Header Section - Mobile responsive, desktop unchanged */}
            <div className="mb-6 flex flex-col rounded-lg bg-blue-900 p-4 shadow-md sm:flex-row sm:justify-between sm:p-6">
              {/* Title - Full width on mobile, auto width on desktop */}
              <h2 className="mb-4 text-center text-xl font-bold text-white sm:mb-0 sm:text-left sm:text-2xl">
                Event Utensils
              </h2>

              {/* Controls - Full width on mobile, auto width on desktop */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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

                {/* Print Button - Full width on mobile, auto on desktop */}
                <button
                  type="button"
                  className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                  onClick={handlePrint}
                >
                  Download PDF
                </button>
              </div>
            </div>

            {/* People Count Display */}
            {/* <div className="mb-4 rounded-md bg-blue-50 p-3">
              <p className="text-blue-800">
                <span className="font-semibold">Current People Count:</span>{' '}
                {peopleCount}
              </p>
              <p className="mt-1 text-sm text-blue-600">
                When you change the people count and click "Update", quantities
                will automatically scale. You can also edit quantities manually.
              </p>
            </div> */}

            {/* Categories Grid - 3 per row - Same as original */}
            {Object.keys(groupedUtensils).length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedUtensils).map(
                  ([catId, categoryData]) => (
                    <div key={catId} className="space-y-2">
                      {/* Category Card - Same as original */}
                      <div className="cursor-pointer rounded-lg border-b-2 border-blue-100 bg-sky-50 p-4 text-sm text-blue-500 transition-all duration-200 dark:border-blue-400 dark:bg-meta-4 dark:text-blue-400">
                        <div className="flex items-center justify-between">
                          <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                            {categoryData.categoryName}
                          </h3>
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
                          <tbody className="dark:divide-gray-700 divide-y divide-stroke bg-white dark:bg-boxdark">
                            {categoryData.items.map((utensil: any) => (
                              <tr
                                key={utensil.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="text-gray-900 whitespace-nowrap px-4 py-2 text-sm font-medium dark:text-white">
                                  <div className="font-medium">
                                    {utensil.name}
                                  </div>
                                </td>
                                <td className="text-gray-500 dark:text-gray-400 whitespace-nowrap px-4 py-2 text-sm">
                                  {utensil.fieldIndex !== undefined && (
                                    <div className="w-24">
                                      <GenericInputField
                                        name={`utensils.${utensil.fieldIndex}.quantity`}
                                        type="number"
                                        min="0"
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
              <div className="border-gray-200 text-gray-500 rounded-lg border bg-white py-12 text-center dark:bg-meta-4">
                No utensil data to display. Enter people count and click
                "Update" to load template data.
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

export default EventUtensil;
