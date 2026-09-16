/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {useDisposalsReport} from '@/lib/api/admin/report';
import React, {useState, useMemo} from 'react';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';

const DisposalReport = () => {
  const {user} = useAuthContext();
  const {data: disposalData} = useDisposalsReport();
  console.log('disposal data', disposalData);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const formattedMonth = month.toString().padStart(2, '0');

  const defaultStart = `${year}-${formattedMonth}-01`;
  const defaultEnd = `${year}-${formattedMonth}-30`;

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  // Filter + Merge Logic
  const filteredData = useMemo(() => {
    if (!disposalData) return [];

    const dateFiltered = disposalData.filter((item) => {
      const created = new Date(item.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) return created >= start && created <= end;
      if (start) return created >= start;
      if (end) return created <= end;
      return true;
    });

    const merged: Record<string, any> = {};
    dateFiltered.forEach((item) => {
      const id = item.disposal?.id;
      if (!merged[id]) {
        merged[id] = {...item};
      } else {
        merged[id].ordered += item.ordered;
        merged[id].taken += item.taken;
        merged[id].returned += item.returned;
      }
    });

    return Object.values(merged);
  }, [disposalData, startDate, endDate]);

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({...prev, [cat]: !prev[cat]}));
  };

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredData.forEach((item) => {
      const cat = item.disposal?.category?.name || 'No Category';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredData]);

  console.log('disposal group', groupedByCategory);

  const handleDownloadPDF = () => {
    try {
      if (filteredData.length === 0) {
        alert('No data available to generate report');
        return;
      }

      const printedDate = new Date();
      const printedDateStr = printedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Calculate totals
      let totalOrdered = 0;
      let totalPrice = 0;

      filteredData.forEach((item) => {
        totalOrdered += item.ordered || 0;
        totalPrice += item.price * item.ordered || 0;
      });

      // Build HTML content for the PDF
      let htmlContent = `
    <!-- FIRST PAGE HEADER -->
    <div style="text-align:center; border:1px solid #0D47A1; padding:8px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
      <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
        ${user?.fullname || 'Store Management'}
      </h1>
      <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
        ${user?.address ? `Address - ${user.address}` : ''}${
          user?.email ? ` | Email - ${user.email}` : ''
        } | Mob. ${user?.phoneNumber || ''}
      </p>
    </div>

    <!-- TITLE BAR -->
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
      <h2 style="margin:0; font-size:16px;">Disposal Report</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        Generated on: ${printedDateStr} |
        Date Range: ${
          startDate
            ? new Date(startDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'All'
        } - ${
          endDate
            ? new Date(endDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'All'
        }
      </div>
    </div>
    `;

      // Generate Category Sections
      for (const [category, items] of Object.entries(groupedByCategory)) {
        // Calculate category totals
        let categoryOrdered = 0;
        let categoryTotalPrice = 0;

        items.forEach((item: any) => {
          categoryOrdered += item.ordered || 0;
          categoryTotalPrice += item.price * item.ordered || 0;
        });

        // Category Header
        htmlContent += `
      <div style="margin-top:15px; margin-bottom:5px; font-family: Arial, sans-serif;">
        <div style="background:#1E3A8A; color:#fff; padding:8px 12px; font-weight:bold; font-size:13px;">
          ${category} (Total Ordered: ${categoryOrdered} | Total Amount: ₹${categoryTotalPrice.toFixed(2)})
        </div>
      `;

        // Table for this category
        htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:11px; margin-bottom:15px;">
          <thead>
            <tr style="background:#374151; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:left;">Item Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Ordered Qty</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Price (₹)</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total Price (₹)</th>
            </tr>
          </thead>
          <tbody>
      `;

        // Table Rows for items
        items.forEach((item: any, idx: number) => {
          const totalItemPrice = item.price * item.ordered || 0;
          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'}; page-break-inside: avoid; break-inside: avoid;">
            <td style="padding:6px 8px; border:1px solid #ddd; font-weight:600;">${item.disposal?.name || 'N/A'}</td>
            <td style="padding:6px 8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#059669;">${item.ordered || 0}</td>
            <td style="padding:6px 8px; border:1px solid #ddd; text-align:center;">₹${item.price?.toFixed(2) || '0.00'}</td>
            <td style="padding:6px 8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#dc2626;">₹${totalItemPrice.toFixed(2)}</td>
          </tr>
        `;
        });

        htmlContent += `
          </tbody>
        </table>
      </div>
      `;
      }

      // FOOTER
      htmlContent += `
    <div style="margin-top:20px; padding-top:10px; border-top:1px solid #ddd; font-family: Arial, sans-serif; font-size:10px; color:#666; text-align:center;">
      <p>© All Rights Reserved by PhygitalTech. Contact: 95116 40351.</p>
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
      <title>Disposal Report</title>
      <style>
        html, body { 
          margin:0; 
          padding:0; 
          font-family: Arial, sans-serif; 
          color:#000; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
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
          .repeat-title { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          table { page-break-after: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          td { page-break-inside: avoid; page-break-after: auto; }
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
    } catch (err) {
      console.error('Failed to generate disposal PDF', err);
      alert(
        'An error occurred while generating the disposal PDF. See console for details.',
      );
    }
  };

  return (
    <div className="bg-gray-50 bg-white p-6 dark:bg-boxdark dark:text-white">
      <div className="mx-auto">
        <div className="mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-2 text-3xl font-bold">
                Disposal Report
              </h1>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out"
            >
              Download
            </button>
          </div>

          {/* DATE FILTER */}
          <div className="mb-8 rounded-lg bg-white dark:bg-boxdark dark:text-white">
            <h2 className="text-gray-800 mb-4 text-lg font-semibold">
              Filter by Date Range
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* MAIN TABLE */}
          <div className="overflow-hidden border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                <thead>
                  <tr className="border-b border-stroke dark:bg-meta-4">
                    <th className="text-gray-500 px-6 py-2 text-left text-xs font-bold uppercase">
                      Name
                    </th>
                    <th className="text-gray-500 px-6 py-2 text-left text-xs font-bold uppercase">
                      Order Qty
                    </th>
                    <th className="text-gray-500 px-6 py-2 text-left text-xs font-bold uppercase">
                      Price
                    </th>
                    <th className="text-gray-500 px-6 py-2 text-left text-xs font-bold uppercase">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedByCategory).map(
                    ([category, items]) => (
                      <React.Fragment key={category}>
                        {/* CATEGORY HEADER ROW */}
                        <tr
                          onClick={() => toggleCategory(category)}
                          className="cursor-pointer bg-neutral-50 text-sm font-semibold dark:bg-meta-4"
                        >
                          <td colSpan={4} className="w-full px-6 py-2">
                            <div className="flex w-full items-center justify-between">
                              <span>{category}</span>
                              {openCategories[category] ? (
                                <FaAngleDown />
                              ) : (
                                <FaAngleRight />
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* CATEGORY ITEMS */}
                        {openCategories[category] &&
                          items.map((row) => (
                            <tr
                              key={row.disposal.id}
                              className="bg-white dark:bg-boxdark"
                            >
                              <td className="px-6 py-2 text-sm">
                                {row.disposal?.name}
                              </td>
                              <td className="px-6 py-2 text-sm">
                                {row.ordered}
                              </td>
                              <td className="px-6 py-2 text-sm">
                                {row.price || '-'}
                              </td>
                              <td className="px-6 py-2 text-sm">
                                {row.price * row.ordered || '-'}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ),
                  )}
                </tbody>
              </table>

              {/* EMPTY STATE */}
              {filteredData.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No records found</p>
                  <p className="text-gray-400 mt-1 text-sm">
                    {startDate || endDate
                      ? 'Try adjusting your date filters'
                      : 'No disposal data available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposalReport;
