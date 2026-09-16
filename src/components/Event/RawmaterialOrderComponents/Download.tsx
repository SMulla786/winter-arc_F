/* eslint-disable */
import React, {useCallback} from 'react';
import {FaFileExcel, FaFilePdf} from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface RawMaterial {
  id?: string;
  name: string;
  unit: string;
  quantity: number;
  orderQuantity?: number;
  inventory?: number;
  inventory_value?: number;
  category?: string;
  rawMaterialId?: string;
  subEvent?: string;
  maharaj?: string;
  peopleType?: string;
  extra?: number;
}

interface DownloadProps {
  groupedData: any;
  selectedColumns: {
    inventory: boolean;
    inventory_value: boolean;
    totalQuantity: boolean;
    orderQuantity: boolean;
    requiredQuantity: boolean;
    extraQuantity: boolean;
  };
  extraQty: {[key: string]: number};
  newinitialOrderQuanity: {[key: string]: number};
  startInventoryValue: {[key: string]: number};
  inventoryQuantities: {[key: string]: string | number};
  user?: {
    fullname?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
  };
  subEventResponse?: {
    data?: {
      name?: string;
      startDate?: string;
      endDate?: string;
      subEvents?: Array<{address?: string; expectedPeople?: number}>;
      client?: {user?: {fullname?: string}};
    };
  };
  extraPercentage: {[key: string]: number};
  catererLogo?: string;
  eventName?: string;
  eventPeople?: number;
}

const flattenGroupedData = (data: any, context: any = {}): any[] => {
  let rows: any[] = [];

  if (Array.isArray(data)) {
    data.forEach((item: any) => {
      rows.push({
        Category: context.category || item.category || '',
        SubEvent: context.subEvent || item.subEvent || '',
        Maharaj: context.maharaj || item.maharaj || '',
        Name: item.name,
        Unit: item.unit,
        Inventory: Number(item.inventory ?? 0).toFixed(3),
        RequiredQty: Number(item.quantity ?? 0).toFixed(3),
        ExtraQty: Number(context.extraQty?.[item.id] ?? 0).toFixed(3),
        TotalQty: (
          Number(item.quantity ?? 0) + Number(context.extraQty?.[item.id] ?? 0)
        ).toFixed(3),
        OrderQty: Number(
          context.orderQty?.[item.id] ?? item.orderQuantity ?? 0,
        ).toFixed(3),
        InventoryValue: Number(
          context.inventoryValue?.[item.id] ?? item.inventory_value ?? 0,
        ).toFixed(3),
      });
    });
  } else {
    Object.keys(data).forEach((key) => {
      rows = rows.concat(
        flattenGroupedData(data[key], {
          ...context,
          category: context.category || key,
        }),
      );
    });
  }

  return rows;
};

// Function to create Excel with header
const createExcelWithHeader = (
  rows: any[],
  headerInfo: any,
  fileName: string,
) => {
  const worksheetData: any[][] = [];

  // Title header: Event Name / Client Name / People / Location
  worksheetData.push([
    `${headerInfo.eventName} / ${headerInfo.clientName} / ${headerInfo.expectedPeople} / ${headerInfo.location}`,
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  worksheetData.push(['', '', '', '', '', '', '']);

  // Add column headers
  const columnHeaders = Object.keys(rows[0] || {});
  worksheetData.push(columnHeaders);

  // Add data rows
  rows.forEach((row) => {
    worksheetData.push(columnHeaders.map((header) => row[header]));
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const colWidths = columnHeaders.map(() => ({wch: 18}));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Raw Material Order');
  XLSX.writeFile(workbook, fileName);
};

const Download: React.FC<DownloadProps> = ({
  groupedData,
  selectedColumns,
  extraQty,
  newinitialOrderQuanity,
  startInventoryValue,
  inventoryQuantities,
  user,
  subEventResponse,
  extraPercentage,
  catererLogo,
  eventName,
  eventPeople,
}) => {
  const handleDownloadExcel = useCallback(() => {
    if (!groupedData) {
      toast.error('No data available for export');
      return;
    }

    const rows = flattenGroupedData(groupedData, {
      extraQty,
      orderQty: newinitialOrderQuanity,
      inventoryValue: startInventoryValue,
    });

    if (!rows.length) {
      toast.error('No data available for export');
      return;
    }

    // Prepare header information
    const location = subEventResponse?.data?.subEvents?.[0]?.address || 'N/A';
    const clientName = subEventResponse?.data?.client?.user?.fullname || 'N/A';
    const expectedPeople =
      eventPeople ||
      subEventResponse?.data?.subEvents?.reduce((total, subEvent) => {
        return total + (subEvent.expectedPeople || 0);
      }, 0) ||
      'N/A';

    const headerInfo = {
      eventName: eventName || subEventResponse?.data?.name || 'N/A',
      clientName: clientName,
      expectedPeople: expectedPeople,
      location: location,
    };

    const fileName = `Raw_Material_Order_${
      eventName || subEventResponse?.data?.name || 'Event'
    }.xlsx`;

    createExcelWithHeader(rows, headerInfo, fileName);
    toast.success('Excel file downloaded successfully');
  }, [
    groupedData,
    extraQty,
    newinitialOrderQuanity,
    startInventoryValue,
    eventName,
    subEventResponse?.data?.name,
    subEventResponse?.data?.subEvents,
    subEventResponse?.data?.client?.user?.fullname,
    eventPeople,
  ]);

  const handleDownloadPDF = useCallback(() => {
    try {
      if (!groupedData) {
        toast.error('No data available for export');
        return;
      }

      const renderGroupedDataHTML = (data: any, depth = 0): string => {
        let html = '';
        if (Array.isArray(data)) {
          if (data.length === 0) return '';

          html += `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:20px;">`;

          const headers = ['Name'];
          if (selectedColumns?.inventory) headers.push('Inventory');
          if (selectedColumns?.requiredQuantity) headers.push('Required Qty');
          if (selectedColumns?.extraQuantity) headers.push('Extra Qty');
          if (selectedColumns?.totalQuantity) headers.push('Total Qty');
          if (selectedColumns?.orderQuantity) headers.push('Order Qty');
          headers.push('Inventory Value');

          html += `<thead><tr style="background:#1E3A8A; color:#fff; font-weight:700;">`;
          headers.forEach((h) => {
            html += `<th style="padding:6px 8px; border:1px solid #ccc; text-align:center;">${h}</th>`;
          });
          html += `</tr></thead><tbody>`;

          data.forEach((item: any, index: number) => {
            const orderQty =
              item.orderQuantity !== undefined && item.orderQuantity !== null
                ? item.orderQuantity
                : (newinitialOrderQuanity?.[item.id ?? ''] ??
                  item.quantity ??
                  0);

            html += `<tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8f8f8'};">`;

            headers.forEach((headerText) => {
              let cellText = '';
              switch (headerText) {
                case 'Name': {
                  cellText = item.name ?? item.rawMaterial?.name ?? '';
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700;">${cellText}</td>`;
                  break;
                }
                case 'Inventory Value': {
                  let currentInvValue = item.inventory ?? 0;
                  if (startInventoryValue?.[item.id ?? ''] !== undefined) {
                    const stateVal = startInventoryValue[item.id ?? ''];
                    const initialVal = item.inventory_value ?? 0;
                    if (stateVal !== initialVal) {
                      currentInvValue = stateVal;
                    }
                  }
                  const qty = Number(currentInvValue);
                  cellText = qty.toFixed(3);
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${cellText}</td>`;
                  break;
                }
                case 'Required Qty': {
                  const requiredQty = Number(item.quantity ?? 0);
                  cellText = requiredQty.toFixed(3);
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${cellText}</td>`;
                  break;
                }
                case 'Extra Qty': {
                  const extraQtyVal =
                    extraQty?.[item.id ?? ''] !== undefined
                      ? Number(extraQty[item.id ?? '']).toFixed(3)
                      : '0';
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${extraQtyVal}</td>`;
                  break;
                }
                case 'Total Qty': {
                  const totalQty =
                    Number(item.quantity ?? 0) +
                    (extraQty?.[item.id ?? ''] ?? 0);
                  cellText = totalQty.toFixed(3);
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${cellText}</td>`;
                  break;
                }
                case 'Order Qty': {
                  cellText = `${Number(orderQty).toFixed(3)} ${item.unit ?? item.rawMaterial?.unit ?? ''}`;
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${cellText}</td>`;
                  break;
                }
                case 'Inventory': {
                  const inventoryVal =
                    inventoryQuantities?.[item.id ?? ''] !== undefined
                      ? Number(inventoryQuantities[item.id ?? '']).toFixed(3)
                      : item.inventory !== undefined
                        ? Number(item.inventory).toFixed(3)
                        : '0';
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${inventoryVal}</td>`;
                  break;
                }
                default:
                  html += `<td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;"></td>`;
              }
            });
            html += `</tr>`;
          });
          html += `</tbody></table>`;
        } else {
          Object.keys(data).forEach((groupKey) => {
            const bg =
              depth === 0
                ? '#e3f2fd'
                : depth === 1
                  ? '#f3e5f5'
                  : depth === 2
                    ? '#e8f5e8'
                    : '#fff3e0';
            const borderColor =
              depth === 0
                ? '#2196f3'
                : depth === 1
                  ? '#9c27b0'
                  : depth === 2
                    ? '#4caf50'
                    : '#ff9800';

            let groupHtml = `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin:5px 0; background:${bg}; border-left:4px solid ${borderColor}; text-align:left; font-weight:bold; font-size:${depth === 0 ? '14px' : '13px'}; color:#333; margin-left:${depth * 20}px;">`;
            groupHtml += `<span>› ${groupKey}</span>`;
            if (extraPercentage[groupKey] !== undefined) {
              groupHtml += `<span style="font-size:11px; color:#666;">Extra: ${extraPercentage[groupKey]}%</span>`;
            }
            groupHtml += `</div>`;
            html += groupHtml;
            html += renderGroupedDataHTML(data[groupKey], depth + 1);
          });
        }
        return html;
      };

      let htmlContent = `
      <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
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
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
      <h2 style="margin:0; font-size:16px;">Raw Material Order Report</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        Event: ${subEventResponse?.data?.name ?? 'N/A'} |
        Start Date: ${
          subEventResponse?.data?.startDate
            ? new Date(subEventResponse.data.startDate).toLocaleDateString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                },
              )
            : 'N/A'
        } |
        End Date: ${
          subEventResponse?.data?.endDate
            ? new Date(subEventResponse.data.endDate).toLocaleDateString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                },
              )
            : 'N/A'
        }
      </div>
      <div style="font-size:11px; margin-top:2px; opacity:0.95;">
      Address: ${subEventResponse?.data?.subEvents?.[0]?.address || 'N/A'} |
      ClientName: ${subEventResponse?.data?.client?.user?.fullname || 'N/A'}
      </div>
    </div>
  `;

      if (groupedData && Object.keys(groupedData).length > 0) {
        htmlContent += `<div style="font-family: Arial, sans-serif;">`;
        htmlContent += `<h3 style="margin:15px 0 10px 0; font-size:16px; font-weight:700; color:#000; text-align:left; border-bottom:2px solid #1E3A8A; padding-bottom:5px;">Main Raw Materials</h3>`;
        htmlContent += renderGroupedDataHTML(groupedData, 0);
        htmlContent += `</div>`;
      }

      if (!groupedData || Object.keys(groupedData).length === 0) {
        htmlContent += `<p style="text-align:center; color:#666; margin:20px 0; font-style:italic;">No raw materials data available with current filters</p>`;
      }

      const fullHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Raw Material Order Report</title>
  <style>
    @page { margin: 12mm 8mm; size: A4; }
    html, body { margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: Arial, sans-serif; color: #000; }
    body.first-page { padding-top:0 !important; }
    .repeat-title {
      position: fixed;
      top: 8px;
      left: 8px;
      background: #0D47A1;
      color: #fff;
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 0 0 4px 0;
      z-index: 9999;
    }
    body.first-page .repeat-title { display: none !important; }
    .container { padding:12px; box-sizing: border-box; }
    table { width:100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; break-inside: avoid; }
    @media print {
      .repeat-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      td { page-break-inside: avoid; page-break-after: auto; }
      @page { margin: 12mm 8mm; }
      body { margin: 0; }
    }
  </style>
</head>
<body class="first-page">
  <div class="container">
    ${htmlContent}
  </div>
  <script>
    setTimeout(() => {
      document.body.classList.remove('first-page');
      window.print();
      setTimeout(() => window.close(), 600);
    }, 350);
  </script>
</body>
</html>`;

      const printWindow = window.open(
        '',
        'printWindow',
        'width=1000,height=800,scrollbars=yes',
      );

      if (!printWindow) {
        alert('Please allow popups for this site to generate PDF');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    } catch (err) {
      console.error('Failed to generate Raw Material Order PDF:', err);
      toast.error(
        'An error occurred while generating the PDF. See console for details.',
      );
    }
  }, [
    groupedData,
    selectedColumns,
    startInventoryValue,
    extraQty,
    newinitialOrderQuanity,
    inventoryQuantities,
    user?.fullname,
    user?.address,
    user?.email,
    user?.phoneNumber,
    subEventResponse?.data?.name,
    subEventResponse?.data?.startDate,
    subEventResponse?.data?.endDate,
    subEventResponse?.data?.subEvents,
    subEventResponse?.data?.client?.user?.fullname,
    extraPercentage,
    catererLogo,
  ]);

  return (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownloadExcel();
        }}
        className="flex items-center gap-2 rounded bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200"
        title="Download Excel"
      >
        <span className="hidden sm:inline">Download Excel</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownloadPDF();
        }}
        className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
        title="Download PDF"
      >
        <span className="hidden sm:inline">Download PDF</span>
      </button>
    </div>
  );
};

export default React.memo(Download);
