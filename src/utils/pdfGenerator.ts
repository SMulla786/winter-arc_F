/* eslint-disable */
// utils/pdfGenerator.ts
export const generatePDFHTML = (
  categories: any[],
  totalAmount: number,
  listNo?: number,
  createdAt?: string,
  caterorInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  },
): string => {
  // Helper functions for formatting
  const formatDateForHTML = (
    dateString: string,
    formatType = 'dd MMM yyyy',
  ) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);

      if (formatType === 'dd MMM yyyy') {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }

      if (formatType === 'dd/MM/yyyy') {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }

      return date.toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  const formatTimeForHTML = (timeString: string): string => {
    if (!timeString) return '—';
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
      if (timeString.match(/^\d{1,2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const formatQuantityDisplay = (quantity: number): string => {
    if (quantity === undefined || quantity === null) return '';
    return parseFloat(quantity.toFixed(1)).toString();
  };

  // Calculate total items
  let totalItemsCount = 0;
  categories.forEach((category) => {
    category.materials.forEach((material: any) => {
      if (material.items.length > 0) {
        totalItemsCount += material.items.length;
      } else {
        totalItemsCount += 1;
      }
    });
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Purchase Order - ${listNo || 'N/A'}</title>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 12mm 8mm !important;
    }
    
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        font-family: Arial, sans-serif !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body.first-page {
        padding-top: 0 !important;
      }
      
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
      
      body.first-page .repeat-title {
        display: none !important;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      thead {
        display: table-header-group;
      }
      
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      td {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      .no-print {
        display: none !important;
      }
    }
    
    html, body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      color: #000;
    }
    
    body.first-page {
      padding-top: 0;
    }
    
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
    
    body.first-page .repeat-title {
      display: none;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead {
      display: table-header-group;
    }
    
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  </style>
</head>
<body class="first-page">
  

  <div style="padding: 12px;">
    <!-- FIRST PAGE HEADER -->
    <div style="text-align: center; border: 1px solid #0D47A1; padding: 8px; margin-bottom: 12px; background: #E3F2FD;">
      <h1 style="margin: 0; font-size: 24px; color: #0D47A1; font-weight: 800;">
        ${caterorInfo?.name || 'CATTEROR NAME'}
      </h1>
      <p style="margin: 6px 0 0; font-weight: bold; font-size: 11px; color: #000;">
        ${caterorInfo?.address ? `Address - ${caterorInfo.address}` : ''}
        ${caterorInfo?.email ? ` | Email - ${caterorInfo.email}` : ''}
        ${caterorInfo?.phone ? ` | Mob. ${caterorInfo.phone}` : ''}
      </p>
    </div>

    <!-- TITLE BAR -->
    <div style="text-align: center; background: #0D47A1; color: white; padding: 10px 6px; margin-bottom: 12px; font-weight: bold;">
      <h2 style="margin: 0; font-size: 16px;">EXTERNAL PURCHASE ORDER - COMPLETED</h2>
      <div style="font-size: 11px; margin-top: 4px; opacity: 0.95;">
        PO No: ${listNo || 'N/A'} | 
        Generated: ${formatDateForHTML(createdAt || new Date().toISOString(), 'dd MMM yyyy HH:mm')} |
        Total Items: ${totalItemsCount} |
        Total Amount: ₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
      </div>
    </div>

    <!-- ITEMS TABLE -->
    ${categories
      .map((category, catIndex) => {
        let categoryTotal = 0;
        let categoryItems = 0;

        // Calculate category totals
        category.materials.forEach((material: any) => {
          const materialTotal = material.items.reduce(
            (sum: number, item: any) => sum + (item.totalAmount || 0),
            0,
          );
          categoryTotal += materialTotal || material.header.totalAmount;
          categoryItems += material.items.length || 1;
        });

        return `
        <!-- Category Header -->
        <div style="background: #e3f2fd; padding: 8px; margin: 10px 0 5px 0; border-left: 4px solid #0D47A1; font-weight: bold; font-size: 13px;">
          ${category.name.toUpperCase()} (${categoryItems} items)
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px;">
          <thead>
            <tr style="background: #1E3A8A; color: #fff; font-weight: 700;">
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">#</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Material</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Particular</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Package Type</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Unit</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Date</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Time</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Location</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Vendor</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Price (₹)</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${category.materials
              .map((material: any, matIndex: number) => {
                const hasBreakdowns = material.items.length > 0;
                let materialTotal = 0;
                let materialItems = 0;

                const rows = hasBreakdowns
                  ? material.items
                      .map((item: any, itemIndex: number) => {
                        materialTotal += item.totalAmount || 0;
                        materialItems++;

                        return `
                      <tr style="background: ${itemIndex % 2 === 0 ? '#ffffff' : '#f8f8f8'}; page-break-inside: avoid; break-inside: avoid;">
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${itemIndex + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${item.name || material.header.name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${item.particular || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${item.packageType || 'LOOSE'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${formatQuantityDisplay(item.quantity)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${item.unit || material.header.unit}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${formatDateForHTML(item.date, 'dd/MM/yyyy')}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${formatTimeForHTML(item.time)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${item.location || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${item.vendorName || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">₹${(item.price || 0).toFixed(2)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">₹${(item.totalAmount || 0).toFixed(2)}</td>
                      </tr>
                    `;
                      })
                      .join('')
                  : `
                  <tr style="background: #ffffff; page-break-inside: avoid; break-inside: avoid;">
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">1</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${material.header.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${material.header.particular || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${material.header.packageType || 'LOOSE'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${formatQuantityDisplay(material.header.quantity)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${material.header.unit}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${formatDateForHTML(material.header.date, 'dd/MM/yyyy')}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${formatTimeForHTML(material.header.time)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${material.header.location || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${material.header.vendorName || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">₹${(material.header.price || 0).toFixed(2)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700;">₹${(material.header.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                `;

                return rows;
              })
              .join('')}
            
            <!-- Category Total Row -->
            <tr style="background: #e8f5e8; font-weight: bold; border-top: 2px solid #28a745;">
              <td colspan="11" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 12px;">
                ${category.name} Total:
              </td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 12px; color: #0D47A1;">
                ₹${categoryTotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      `;
      })
      .join('')}
  </div>

  <script>
    // Remove first-page class after initial render to show repeat-title on subsequent pages
    setTimeout(() => {
      document.body.classList.remove('first-page');
    }, 100);

    // Auto print after a short delay
    setTimeout(() => {
      window.print();
      // Close window after print (only works if opened via window.open)
      window.onafterprint = function() {
        window.close();
      };
    }, 500);
  </script>
</body>
</html>
  `;
};
