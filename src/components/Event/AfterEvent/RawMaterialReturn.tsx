/* eslint-disable  */
import React, {useEffect, useMemo, useState} from 'react';
import {
  FormProvider,
  useForm,
  UseFormReturn,
  SubmitHandler,
} from 'react-hook-form';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import GenericSearchDropdown from '@/components/Forms/SearchDropDown/GenericSearchDropdown';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {Route} from '@/routes/_app/_event/events.$id';
import {
  useGetAllRawMaterialFromSubEvent,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {FiSave, FiDownload} from 'react-icons/fi';
import {
  useAddRawMaterialToInventory,
  useGetRawMaterialReturn,
  useSaveRawMaterialReturn,
} from '@/lib/react-query/queriesAndMutations/cateror/inventorydata';
import {useAuthContext} from '@/context/AuthContext';

interface RawMaterialItem {
  rawMaterialId: string;
  quantity: number;
  unit: string;
  categoryId: string;
  categoryName?: string;
}

interface FlattenedRawMaterial extends RawMaterialItem {
  [key: string]: any;
}

interface CategoryGroup {
  categoryId: string;
  categoryName: string;
  rawMaterials: FlattenedRawMaterial[];
}

interface FormValues {
  rawMaterials: {
    rawMaterialId: string;
    totalQuantity: number;
    unit: string;
    type: string;
    vendor: string;
    categoryId: string;
    categoryName?: string;
  }[];
}
interface SubEvent {
  id: string;
  name: string;
  address: string;
  date: string;
  time: string;
  actualPeople?: number;
  expectedPeople?: number;
  dishes: Array<{
    dish: {
      id: string;
      name: string;
      categoryId: string;
      category: {name: string};
      quantity?: number; // Assuming preparation quantity is here
    };
    quantity?: number; // Fallback for preparation
  }>;
  [key: string]: any;
}

interface SubEventResponse {
  data: {
    subEvents: SubEvent[];
    name?: string;
    startDate?: string;
    endDate?: string;
  };
}

const RawMaterialReturn: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const methods: UseFormReturn<FormValues> = useForm<FormValues>({
    defaultValues: {
      rawMaterials: [],
    },
  });
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialReturn;
  const role = user?.role;

  const {control, reset, watch, handleSubmit} = methods;
  const {id: EventId} = Route.useParams();

  const {data: rawMaterial} = useGetAllRawMaterialFromSubEvent(EventId);

  const {data: rawMaterialResponse} = useGetRawMaterialsCateror();

  const {mutateAsync: addRawMaterialToInventory, isPending} =
    useAddRawMaterialToInventory();

  const {mutateAsync: saveRawMaterialReturn, isPending: isSavePending} =
    useSaveRawMaterialReturn(EventId);

  const {data: rawMaterialReturn, refetch} = useGetRawMaterialReturn(EventId);
  const {data: subEventResponse} = useGetSubevent(EventId) as {
    data?: SubEventResponse;
  };

  const rawMaterialOptions =
    rawMaterialResponse?.data.rawMaterials?.map(
      (item: {
        id: string;
        name: string;
        category: {id: string; name: string};
      }) => ({
        label: item.name,
        value: item.id,
        categoryId: item.category.id,
        categoryName: item.category.name,
      }),
    ) || [];

  const flattenResult: FlattenedRawMaterial[] = useMemo(() => {
    if (!rawMaterial || !Array.isArray(rawMaterial.data)) return [];

    return rawMaterial.data.reduce(
      (
        acc: FlattenedRawMaterial[],
        item: {
          rawMaterials: RawMaterialItem[];
          categoryId: string;
          categoryName?: string;
        },
      ) => {
        if (Array.isArray(item.rawMaterials)) {
          item.rawMaterials.forEach((rawMaterial) => {
            acc.push({
              ...rawMaterial,
              unit: rawMaterial.unit || 'kg',
              categoryId: item.categoryId,
              // categoryName: item.categoryName || `Category ${item.categoryId}`,
            });
          });
        }
        return acc;
      },
      [],
    );
  }, [rawMaterial]);

  // Group by category
  const categoryGroups: CategoryGroup[] = useMemo(() => {
    const mergedData = flattenResult.reduce((acc, item) => {
      const existingItem = acc.find(
        (i) =>
          i.rawMaterialId === item.rawMaterialId &&
          i.categoryId === item.categoryId,
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        acc.push({...item});
      }
      // console.log("item",item);
      return acc;
    }, [] as FlattenedRawMaterial[]);

    // Group by category
    const grouped = mergedData.reduce((acc, item) => {
      const category = acc.find((c) => c.categoryId === item.categoryId);
      if (category) {
        category.rawMaterials.push(item);
      } else {
        acc.push({
          categoryId: item.categoryId,
          categoryName: item.categoryName || `Category ${item.categoryName}`,
          rawMaterials: [item],
        });
      }
      return acc;
    }, [] as CategoryGroup[]);
    return grouped;
  }, [flattenResult]);

  // useEffect(() => {
  //   const initialFormValues = categoryGroups.flatMap((group) =>
  //     group.rawMaterials.map((rawMaterial) => ({
  //       rawMaterialId: rawMaterial.rawMaterialId,
  //       totalQuantity: 0,
  //       unit: rawMaterial.unit || 'kg',
  //       type: '1',
  //       vendor: '',
  //       categoryId: rawMaterial.categoryId,
  //       categoryName: rawMaterial.categoryName,
  //     })),
  //   );
  //   reset({
  //     rawMaterials: initialFormValues,
  //   });
  // }, [categoryGroups, reset]);

  useEffect(() => {
    if (!categoryGroups.length) return;

    const initialFormValues = categoryGroups.flatMap((group) =>
      group.rawMaterials.map((rawMaterial) => {
        const returned = rawMaterialReturn?.data?.find(
          (r: {id: string}) => r.id === rawMaterial.rawMaterialId,
        );

        return {
          rawMaterialId: rawMaterial.rawMaterialId,
          totalQuantity: returned ? returned.quantity : 0,
          unit: rawMaterial.unit || 'kg',
          type: returned?.vendorName ? '2' : '1',
          vendor: returned?.vendorName || '',
          categoryId: rawMaterial.categoryId,
          categoryName: rawMaterial.categoryName,
        };
      }),
    );

    reset({
      rawMaterials: initialFormValues,
    });
  }, [categoryGroups, rawMaterialReturn, reset]);

  useEffect(() => {
    if (categoryGroups.length > 0 && !openCategoryId) {
      const firstCategory = categoryGroups[0];
      setOpenCategoryId(firstCategory.categoryId);
    }
  }, [categoryGroups, openCategoryId]);

  // const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
  //   const mappedInventoryRawMaterials = data.rawMaterials
  //     .filter((item) => Number(item.totalQuantity) > 0)
  //     .map((item) => ({
  //       rawMaterialId: item.rawMaterialId,
  //       quantity: parseFloat(Number(item.totalQuantity).toFixed(2)),
  //       unit: item.unit,
  //       type: item.type,
  //       vendor: item.type === '2' ? item.vendor : null,
  //     }));

  //   if (mappedInventoryRawMaterials.length === 0) {
  //     return;
  //   }

  //   await addRawMaterialToInventory(mappedInventoryRawMaterials, {
  //     onSuccess: () => {},
  //     onError: () => {},
  //   });
  // };

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    if (!EventId) return;

    const mappedReturnRawMaterials = data.rawMaterials.map((item) => ({
      id: item.rawMaterialId,
      quantity: parseFloat(Number(item.totalQuantity).toFixed(2)),
      vendorName: item.type === '2' ? item.vendor : undefined,
    }));

    if (mappedReturnRawMaterials.length === 0) {
      return;
    }

    try {
      await saveRawMaterialReturn(mappedReturnRawMaterials);
      refetch();
    } catch (error) {
      console.error('Failed to save raw material return:', error);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const allRawMaterials = watch('rawMaterials') || [];

      // Build HTML content (keeps table structure and data unchanged)
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
        <h2 style="margin:0; font-size:16px;">Raw Material Return Report</h2>
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

      // For each category group, add a section with a table
      categoryGroups.forEach((group) => {
        const itemsForGroup = allRawMaterials.filter(
          (itm) => itm.categoryId === group.categoryId,
        );
        if (!itemsForGroup.length) return; // skip empty categories

        htmlContent += `
        <!-- CATEGORY HEADER -->
        <div style="font-family: Arial, sans-serif; margin-top:8px; margin-bottom:6px;">
          <h3 style="margin:0; font-size:14px; font-weight:700; color:#1E3A8A;">${group.categoryName}</h3>
        </div>

        <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:11px; margin-bottom:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
              <th style="padding:6px 6px; border:1px solid #ccc; text-align:center; width:40%;">Raw Material</th>
              <th style="padding:6px 6px; border:1px solid #ccc; text-align:center; width:20%;">Quantity</th>
              <th style="padding:6px 6px; border:1px solid #ccc; text-align:center; width:20%;">Self/Vendor</th>
              <th style="padding:6px 6px; border:1px solid #ccc; text-align:center; width:20%;">Vendor</th>
            </tr>
          </thead>
          <tbody>
      `;

        itemsForGroup.forEach((item, idx) => {
          const rawMaterialOption = rawMaterialOptions?.find(
            (opt) => opt.value === item.rawMaterialId,
          );
          const name = rawMaterialOption
            ? rawMaterialOption.label
            : item.rawMaterialId || 'N/A';
          const quantityText = `${item.totalQuantity ?? 0} ${item.unit ?? ''}`;
          const typeLabel =
            item.type === '1'
              ? 'Self'
              : item.type === '2'
                ? 'Vendor'
                : (item.type ?? 'N/A');
          const inventoryOrVendor =
            item.type === '1'
              ? item.inventory || 'Inventory'
              : item.vendor || '';

          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
            <td style="padding:8px 6px; border:1px solid #ddd; text-align:left; font-weight:700;">${name}</td>
            <td style="padding:8px 6px; border:1px solid #ddd; text-align:center; font-weight:700;">${quantityText}</td>
            <td style="padding:8px 6px; border:1px solid #ddd; text-align:center; font-weight:700;">${typeLabel}</td>
            <td style="padding:8px 6px; border:1px solid #ddd; text-align:center; font-weight:700;">${inventoryOrVendor}</td>
          </tr>
        `;
        });

        htmlContent += `
          </tbody>
        </table>
      `;
      });

      //   // Notes section (included as requested)
      //   htmlContent += `
      //   <div style="margin-top:8px; border-top:1px solid #0D47A1; padding-top:8px; font-family: Arial, sans-serif; font-size:12px;">
      //     <h3 style="margin:0 0 6px 0; font-size:14px; color:#1E3A8A;">Notes:</h3>
      //     <div style="min-height:80px; border:1px solid #ddd; padding:10px; border-radius:4px; background:#f9f9f9;"></div>
      //   </div>
      // `;

      //   // Footer (small)
      //   htmlContent += `
      //   <div style="margin-top:12px; font-size:10px; color:#666; text-align:center;">
      //     &copy; All Rights Reserved by ${user?.fullname ?? 'PhygitalTech'}. Contact: ${user?.phoneNumber ?? '95116 40351'}.
      //   </div>
      // `;

      // Build final printable document with canonical CSS (repeat-title etc.)
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
        <title>Raw Material Return Report</title>
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
            /* ensure content uses full printable width */
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
          // allow the first page/styling to render, then print and close window
          setTimeout(() => {
            document.body.classList.remove('first-page');
            window.print();
            setTimeout(() => window.close(), 600);
          }, 400);
        </script>
      </body>
      </html>`);

      printWindow.document.close();
    } catch (err) {
      console.error('Failed to generate Raw Material Return PDF', err);
      alert(
        'An error occurred while generating the PDF. See console for details.',
      );
    }
  };

  // const handleDownloadPDF = () => {
  //   const reportContainer = document.createElement('div');
  //   reportContainer.style.width = '800px';
  //   reportContainer.style.padding = '20px';
  //   reportContainer.style.background = 'white';
  //   reportContainer.style.fontFamily = 'Arial, sans-serif';
  //   reportContainer.style.fontSize = '12px';
  //   reportContainer.style.color = 'black';
  //   reportContainer.style.textAlign = 'center';

  //   // 🔹 Header (Standard Caterer Info Box)
  //   const headerWrapper = document.createElement('div');
  //   headerWrapper.style.padding = '6px';
  //   headerWrapper.style.border = '1px solid #0D47A1';
  //   headerWrapper.style.textAlign = 'center';
  //   headerWrapper.style.color = 'black';

  //   const centerInfo = document.createElement('div');
  //   centerInfo.innerHTML = `
  //   <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
  //     ${user?.fullname || 'Caterer Name'}
  //   </h1>
  //   <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
  //   <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
  //     ${user?.address || ''}<br/>
  //     ${user?.email ? `इमेल - ${user?.email}<br/>` : ''}मो. ${user?.phoneNumber || ''}
  //   </p>
  // `;
  //   headerWrapper.appendChild(centerInfo);
  //   reportContainer.appendChild(headerWrapper);

  //   // 🔹 Title
  //   const titleWrapper = document.createElement('div');
  //   titleWrapper.style.marginTop = '5px';
  //   titleWrapper.style.textAlign = 'center';
  //   titleWrapper.innerHTML = `
  //   <h2 style="font-size: 18px; font-weight: bold; margin:0; color:black;">
  //     Raw Material Return Report
  //   </h2>
  //   <div style="margin-bottom: 10px; color:black;">
  //     <span style="display: inline-block; margin: 0 8px; color:black;"><strong>Event:</strong> ${rawMaterial?.data[0]?.eventName || 'N/A'}</span>
  //     <span style="display: inline-block; margin: 0 8px; color:black;"><strong>Date:</strong> ${new Date().toLocaleDateString(
  //       'en-GB',
  //       {day: '2-digit', month: 'short', year: 'numeric'},
  //     )}</span>
  //     <span style="display: inline-block; margin: 0 8px; color:black;"><strong>Time:</strong> ${new Date().toLocaleTimeString(
  //       'en-US',
  //       {hour: '2-digit', minute: '2-digit', hour12: true},
  //     )}</span>
  //   </div>
  // `;
  //   reportContainer.appendChild(titleWrapper);

  //   // 🔹 Tables per Category
  //   categoryGroups.forEach((group) => {
  //     const categoryHeader = document.createElement('h3');
  //     categoryHeader.style.margin = '10px 0 5px 0';
  //     categoryHeader.style.fontSize = '14px';
  //     categoryHeader.style.fontWeight = 'bold';
  //     categoryHeader.style.color = '#444';
  //     categoryHeader.textContent = group.categoryName;
  //     reportContainer.appendChild(categoryHeader);

  //     const table = document.createElement('table');
  //     table.style.width = '100%';
  //     table.style.borderCollapse = 'collapse';
  //     table.style.fontSize = '11px';
  //     table.style.backgroundColor = 'white';
  //     table.style.marginBottom = '15px';

  //     const colWidths = ['40%', '20%', '20%', '20%'];

  //     const headerRow = table.insertRow();
  //     headerRow.style.verticalAlign = 'middle';
  //     ['Raw Material', 'Quantity', 'Self/Vendor', 'Vendor'].forEach(
  //       (text, i) => {
  //         const th = document.createElement('th');
  //         th.innerText = text;
  //         th.style.border = '1px solid #ccc';
  //         th.style.paddingBottom = '8px';
  //         th.style.backgroundColor = '#1E3A8A';
  //         th.style.color = 'white';
  //         th.style.textAlign = 'center';
  //         th.style.verticalAlign = 'middle';
  //         th.style.fontWeight = 'bold';
  //         th.style.width = colWidths[i];
  //         headerRow.appendChild(th);
  //       },
  //     );

  //     watch('rawMaterials')
  //       ?.filter((item) => item.categoryId === group.categoryId)
  //       .forEach((item, index) => {
  //         const row = table.insertRow();
  //         row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f8f8';
  //         row.style.verticalAlign = 'middle';

  //         const rawMaterialOption = rawMaterialOptions.find(
  //           (opt: {value: string}) => opt.value === item.rawMaterialId,
  //         );
  //         const name = rawMaterialOption
  //           ? rawMaterialOption.label
  //           : item.rawMaterialId;
  //         const typeLabel =
  //           item.type === '1'
  //             ? 'Self'
  //             : item.type === '2'
  //               ? 'Vendor'
  //               : item.type;
  //         const inventoryOrVendor =
  //           item.type === '1' ? 'Inventory' : item.vendor;

  //         [
  //           name,
  //           `${item.totalQuantity} ${item.unit}`,
  //           typeLabel,
  //           inventoryOrVendor,
  //         ].forEach((text, i) => {
  //           const cell = row.insertCell();
  //           cell.innerText = text;
  //           cell.style.border = '1px solid #ddd';
  //           cell.style.font = 'bold 12px Arial, sans-serif';
  //           cell.style.paddingBottom = '10px';
  //           cell.style.textAlign = 'center';
  //           cell.style.verticalAlign = 'middle';
  //           cell.style.color = 'black';
  //           cell.style.fontSize = '12px';
  //           cell.style.width = colWidths[i];
  //         });
  //       });

  //     reportContainer.appendChild(table);
  //   });

  //   // 🔹 Notes Section
  //   const notesSection = document.createElement('div');
  //   notesSection.style.marginTop = '10px';
  //   notesSection.style.marginBottom = '15px';

  //   const notesTitle = document.createElement('h3');
  //   notesTitle.innerText = 'Notes:';
  //   notesTitle.style.fontSize = '14px';
  //   notesTitle.style.marginBottom = '8px';
  //   notesTitle.style.color = '#333';
  //   notesSection.appendChild(notesTitle);

  //   const notesBox = document.createElement('div');
  //   notesBox.style.border = '1px solid #ddd';
  //   notesBox.style.borderRadius = '4px';
  //   notesBox.style.padding = '10px';
  //   notesBox.style.minHeight = '80px';
  //   notesBox.style.backgroundColor = '#f9f9f9';
  //   notesBox.innerHTML = `<div style="display: flex; flex-direction: column; gap: 60px;"></div>`;
  //   notesSection.appendChild(notesBox);
  //   reportContainer.appendChild(notesSection);

  //   // 🔹 Footer
  //   const footer = document.createElement('div');
  //   footer.style.marginTop = '15px';
  //   footer.style.fontSize = '9px';
  //   footer.style.textAlign = 'center';
  //   footer.style.color = '#666';
  //   footer.innerHTML = `<p>&copy; All Rights Reserved by PhygitalTech. Contact: 95116 40351.</p>`;
  //   reportContainer.appendChild(footer);

  //   // 🔹 Generate PDF
  //   document.body.appendChild(reportContainer);

  //   html2canvas(reportContainer, {
  //     scale: 3,
  //     useCORS: true,
  //     backgroundColor: '#ffffff',
  //   })
  //     .then((canvas) => {
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //       const imgWidth = pdf.internal.pageSize.getWidth();
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //       const pageWidth = pdf.internal.pageSize.getWidth();
  //       const pageHeight = pdf.internal.pageSize.getHeight();
  //       const bottomMargin = 14;
  //       const topMargin = 18;

  //       let heightLeft = imgHeight;
  //       let pageNumber = 1;

  //       while (heightLeft > 0) {
  //         if (pageNumber > 1) pdf.addPage();

  //         const currentTopMargin = pageNumber === 1 ? 0 : topMargin;
  //         const usableHeight = pageHeight - currentTopMargin - bottomMargin;

  //         const pageCanvas = document.createElement('canvas');
  //         pageCanvas.width = canvas.width;
  //         pageCanvas.height = (usableHeight * canvas.width) / imgWidth;

  //         const ctx = pageCanvas.getContext('2d');
  //         if (ctx) {
  //           ctx.fillStyle = '#ffffff';
  //           ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
  //           ctx.drawImage(
  //             canvas,
  //             0,
  //             (imgHeight - heightLeft) * (canvas.width / imgWidth),
  //             canvas.width,
  //             pageCanvas.height,
  //             0,
  //             0,
  //             pageCanvas.width,
  //             pageCanvas.height,
  //           );
  //         }

  //         const pageImgData = pageCanvas.toDataURL('image/jpeg', 1);

  //         pdf.addImage(
  //           pageImgData,
  //           'JPEG',
  //           0,
  //           currentTopMargin,
  //           imgWidth,
  //           usableHeight,
  //           undefined,
  //           'FAST',
  //         );

  //         // Page counter
  //         pdf.setFontSize(9);
  //         pdf.setTextColor(0, 0, 0);
  //         pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, {
  //           align: 'center',
  //         });

  //         heightLeft -= usableHeight;
  //         pageNumber++;
  //       }

  //       pdf.save(
  //         `RawMaterialReturnReport_${new Date().toISOString().split('T')[0]}.pdf`,
  //       );
  //     })
  //     .finally(() => {
  //       document.body.removeChild(reportContainer);
  //     });
  // };

  return (
    <div className="bg-transparent">
      {' '}
      <div className="rounded-lg bg-transparent dark:border-strokedark dark:bg-boxdark">
        <div className="mb- flex items-center justify-between rounded-t-lg bg-blue-900 px-4 py-5 text-white">
          <h2 className="text-gray-800 text-xl font-bold dark:text-white">
            Raw Material Return
          </h2>
          <div className="flex items-center">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
            >
              Download PDF
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
            >
              {isCollapsed ? (
                <BiChevronDown size={24} />
              ) : (
                <BiChevronUp size={24} />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <FormProvider {...methods}>
            <form>
              {/* Category Buttons */}
              <div className="overflow-x-auto">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Category Buttons (Card Style) */}
                  {!isCollapsed && (
                    <div className="">
                      <div className="bg-gray-50 flex items-center border-b border-stroke dark:border-strokedark dark:bg-boxdark-2">
                        <div className="scrollbar-hide flex-1 overflow-x-auto">
                          <div className="flex min-w-max gap-1">
                            {categoryGroups.map((group) => {
                              const isActive =
                                openCategoryId === group.categoryId;

                              return (
                                <div
                                  key={group.categoryId}
                                  onClick={() =>
                                    setOpenCategoryId((prev) =>
                                      prev === group.categoryId
                                        ? null
                                        : group.categoryId,
                                    )
                                  }
                                  className={`transform cursor-pointer select-none whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md ${
                                    isActive
                                      ? 'border-purple-600 bg-purple-100 text-purple-600 shadow-lg dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-400'
                                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-600 dark:hover:bg-purple-800/50'
                                  } `}
                                >
                                  {group.categoryName}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Category Tables */}
              {categoryGroups.map((group) =>
                openCategoryId === group.categoryId ? (
                  <div
                    key={group.categoryId}
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 mb-8 rounded-md bg-white p-4 shadow-sm dark:bg-black"
                  >
                    <h3 className="text-gray-700 dark:text-gray-300 mb-3 text-lg font-semibold">
                      {group.categoryName}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="text-gray-700 dark:text-gray-300 w-full min-w-[600px] table-fixed border-collapse text-sm">
                        <thead className="text-gray-600 dark:text-gray-300 bg-blue-100 text-xs font-semibold uppercase dark:bg-meta-4">
                          <tr>
                            <th className="w-2/5 px-3 py-2 text-left sm:px-4 sm:py-3">
                              Raw Material
                            </th>
                            <th className="w-1/5 px-3 py-2 text-left sm:px-4 sm:py-3">
                              Quantity
                            </th>
                            <th className="w-1/5 px-3 py-2 text-left sm:px-4 sm:py-3">
                              Self/Vendor
                            </th>
                            <th className="w-1/5 px-3 py-2 text-left sm:px-4 sm:py-3">
                              Vendor
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-gray-200 dark:divide-gray-700 divide-y">
                          {watch('rawMaterials')
                            ?.filter(
                              (item) => item.categoryId === group.categoryId,
                            )
                            .map((field, index) => {
                              const globalIndex = watch(
                                'rawMaterials',
                              ).findIndex(
                                (item) =>
                                  item.rawMaterialId === field.rawMaterialId &&
                                  item.categoryId === field.categoryId,
                              );
                              const typeValue = watch(
                                `rawMaterials[${globalIndex}].type`,
                              );
                              const isVendor =
                                typeof typeValue === 'string' &&
                                typeValue === '2';
                              const rawMaterialOption = rawMaterialOptions.find(
                                (opt: {value: string}) =>
                                  opt.value === field.rawMaterialId,
                              );
                              const name = rawMaterialOption
                                ? rawMaterialOption.label
                                : field.rawMaterialId;

                              return (
                                <tr
                                  key={`${group.categoryId}-${field.rawMaterialId}`}
                                >
                                  <td className="text-gray-900 px-3 py-3 text-sm font-medium dark:text-white sm:px-4 sm:py-4 sm:text-base">
                                    {name}
                                    <input
                                      type="hidden"
                                      name={`rawMaterials[${globalIndex}].rawMaterialId`}
                                      value={field.rawMaterialId}
                                    />
                                    <input
                                      type="hidden"
                                      name={`rawMaterials[${globalIndex}].categoryId`}
                                      value={field.categoryId}
                                    />
                                  </td>
                                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <input
                                        {...methods.register(
                                          `rawMaterials[${globalIndex}].totalQuantity`,
                                        )}
                                        type="number"
                                        placeholder="Qty"
                                        className="w-16 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white sm:w-24"
                                      />
                                      <span className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm">
                                        {watch(
                                          `rawMaterials[${globalIndex}].unit`,
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                                    <select
                                      {...methods.register(
                                        `rawMaterials[${globalIndex}].type`,
                                      )}
                                      className="w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                    >
                                      <option value="1">Self</option>
                                      <option value="2">Vendor</option>
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                                    {isVendor ? (
                                      <input
                                        {...methods.register(
                                          `rawMaterials[${globalIndex}].vendor`,
                                        )}
                                        type="text"
                                        placeholder="Vendor"
                                        className="w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                      />
                                    ) : (
                                      <span className="text-gray-500 dark:text-gray-300 text-sm">
                                        Inventory
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null,
              )}

              {/* Submit button */}
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-6 flex justify-end">
                  <GenericButton
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
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

export default RawMaterialReturn;
