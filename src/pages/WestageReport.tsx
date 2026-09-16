/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {useWestageReport} from '@/lib/api/admin/report';
import React, {useMemo, useState} from 'react';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';

interface WestageReportProps {
  hasEditAccess?: boolean;
}

const WestageReport = ({
  hasEditAccess: propHasEditAccess,
}: WestageReportProps) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.inwordStore;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';
  const {data: westageData} = useWestageReport();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const formattedMonth = month.toString().padStart(2, '0');
  const defaultStart = `${year}-${formattedMonth}-01`;
  const defaultEnd = `${year}-${formattedMonth}-30`;

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [openCategory, setOpenCategory] = useState<{[key: string]: boolean}>(
    {},
  );

  const toggleCategory = (cat: string) => {
    setOpenCategory((prev) => ({...prev, [cat]: !prev[cat]}));
  };

  const filteredData = useMemo(() => {
    if (!westageData) return [];

    return westageData.filter((item: any) => {
      const created = new Date(item?.dish?.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && created < start) return false;
      if (end && created > end) return false;

      return true;
    });
  }, [westageData, startDate, endDate]);

  // Get unique dates from filtered data
  const dates = useMemo(() => {
    if (!filteredData) return [];
    const dateSet = new Set<string>();
    filteredData.forEach((item: any) => {
      if (item?.dish?.createdAt) {
        const date = new Date(item.dish.createdAt).toISOString().split('T')[0];
        dateSet.add(date);
      }
    });
    return Array.from(dateSet).sort();
  }, [filteredData]);

  // Group data by category first, then by dish within each category
  const groupedByCategory = useMemo(() => {
    const categoryMap: any = {};

    filteredData.forEach((item: any) => {
      const category = item.dish?.category?.name || 'Uncategorized';
      const dishId = item.dishId;
      const dishName = item.dish?.name || 'Unknown Dish';
      const date = new Date(item.dish?.createdAt).toISOString().split('T')[0];
      const quantity = Number(item.quantity) || 0;

      // Initialize category if not exists
      if (!categoryMap[category]) {
        categoryMap[category] = {};
      }

      // Initialize dish if not exists in this category
      if (!categoryMap[category][dishId]) {
        categoryMap[category][dishId] = {
          dishId,
          dishName,
          totalQuantity: 0,
          dates: {},
        };
      }

      // Add quantity to dish total
      categoryMap[category][dishId].totalQuantity += quantity;

      // Track quantity per date
      if (!categoryMap[category][dishId].dates[date]) {
        categoryMap[category][dishId].dates[date] = 0;
      }
      categoryMap[category][dishId].dates[date] += quantity;
    });

    return categoryMap;
  }, [filteredData]);

  // Calculate total wastage for summary
  const totalWastage = useMemo(() => {
    let total = 0;
    Object.values(groupedByCategory).forEach((category: any) => {
      Object.values(category).forEach((dish: any) => {
        total += (dish as any).totalQuantity;
      });
    });
    return total;
  }, [groupedByCategory]);

  // Add this function inside your WestageReport component (after your existing code, before the return statement)

  // PDF Download function for Wastage Report
  const handleDownloadPDF = () => {
    try {
      if (Object.keys(groupedByCategory).length === 0) {
        alert('No data available to generate report');
        return;
      }

      const printedDate = new Date();
      const printedDateStr = printedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
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
      <h2 style="margin:0; font-size:16px;">Wastage Report</h2>
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

      // TOTALS SECTION
      htmlContent += `
    <div style="display:flex; justify-content:space-around; margin-bottom:15px; font-family: Arial, sans-serif;">
      <div style="text-align:center;">
        <div style="font-size:12px; font-weight:bold; color:#666;">Total Categories</div>
        <div style="font-size:16px; font-weight:bold; color:#2563eb;">${Object.keys(groupedByCategory).length}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:12px; font-weight:bold; color:#666;">Total Wastage</div>
        <div style="font-size:16px; font-weight:bold; color:#dc2626;">${totalWastage}</div>
      </div>
    </div>
    `;

      // Generate Category Sections
      for (const [category, dishesObj] of Object.entries(groupedByCategory)) {
        const dishes = Object.values(dishesObj) as any[];
        const categoryTotal = dishes.reduce(
          (sum: number, dish: any) => sum + dish.totalQuantity,
          0,
        );

        // Category Header
        htmlContent += `
      <div style="margin-top:15px; margin-bottom:5px; font-family: Arial, sans-serif;">
        <div style="background:#1E3A8A; color:#fff; padding:8px 12px; font-weight:bold; font-size:13px;">
          ${category} (Total: ${categoryTotal})
        </div>
      `;

        // Table for this category
        htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:11px; margin-bottom:15px;">
          <thead>
            <tr style="background:#374151; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:left;">Dish Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total Wasted</th>
              ${dates
                .map(
                  (date) => `
                <th style="padding:8px; border:1px solid #ccc; text-align:center;">
                  ${new Date(date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}
                </th>
              `,
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
      `;

        // Table Rows for dishes
        dishes.forEach((dish: any, idx: number) => {
          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'}; page-break-inside: avoid; break-inside: avoid;">
            <td style="padding:6px 8px; border:1px solid #ddd; font-weight:600;">${dish.dishName}</td>
            <td style="padding:6px 8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#dc2626;">${dish.totalQuantity}</td>
            ${dates
              .map(
                (date) => `
              <td style="padding:6px 8px; border:1px solid #ddd; text-align:center;">${dish.dates[date] || 0}</td>
            `,
              )
              .join('')}
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
      <title>Wastage Report</title>
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
      console.error('Failed to generate wastage PDF', err);
      alert(
        'An error occurred while generating the wastage PDF. See console for details.',
      );
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-800 text-3xl font-bold dark:text-white">
          Wastage Report
        </h2>
        <button
          onClick={handleDownloadPDF}
          className="rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out"
        >
          Download
        </button>
      </div>

      {/* Date Filter Section */}
      <div className="mb-8 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
        <h3 className="text-gray-700 dark:text-gray-200 mb-4 text-lg font-semibold">
          Filter by Date Range
        </h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="overflow-hidden rounded-lg border border-stroke shadow-sm dark:border-strokedark dark:bg-boxdark">
        {/* Table Header */}
        <div className="overflow-x-auto border-b border-stroke dark:border-strokedark">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <colgroup>
              <col style={{width: '200px'}} />
              <col style={{width: '120px'}} />
              {dates.map(() => (
                <col style={{width: '120px'}} />
              ))}
            </colgroup>
            <thead className="bg-gray-100 dark:bg-meta-4">
              <tr>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Dish Name
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Total Wasted
                </th>
                {dates.map((date) => (
                  <th
                    key={date}
                    className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {/* Category Groups */}
        {Object.entries(groupedByCategory).map(
          ([category, dishesObj]: [string, any]) => {
            const dishes = Object.values(dishesObj);
            const categoryTotal = dishes.reduce(
              (sum: number, dish: any) => sum + dish.totalQuantity,
              0,
            );

            return (
              <div
                key={category}
                className="border-b border-stroke dark:border-strokedark"
              >
                {/* Category Header - Clickable */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between bg-neutral-100 px-4 py-3 hover:bg-neutral-200 dark:bg-meta-4 dark:hover:bg-meta-3"
                >
                  <div className="flex items-center gap-3">
                    {openCategory[category] ? (
                      <FaAngleDown />
                    ) : (
                      <FaAngleRight />
                    )}
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                      {category}
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {categoryTotal} total
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {dishes.length} dish{dishes.length !== 1 ? 'es' : ''}
                  </span>
                </button>

                {/* Expanded Category Content */}
                {openCategory[category] && (
                  <div className="bg-gray-50/50 overflow-x-auto px-2 py-2 dark:bg-meta-2/50">
                    <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                      <colgroup>
                        <col style={{width: '200px'}} />
                        <col style={{width: '120px'}} />
                        {dates.map(() => (
                          <col style={{width: '120px'}} />
                        ))}
                      </colgroup>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {dishes.map((dish: any, index: number) => (
                          <tr
                            key={dish.dishId}
                            className="hover:bg-gray-50 dark:hover:bg-meta-2"
                          >
                            <td className="text-gray-900 dark:text-gray-100 px-4 py-3 text-sm font-medium">
                              {dish.dishName}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                              {dish.totalQuantity}
                            </td>
                            {dates.map((date) => (
                              <td
                                key={date}
                                className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm"
                              >
                                {dish.dates[date] || 0}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          },
        )}

        {/* Empty State */}
        {Object.keys(groupedByCategory).length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="text-gray-400 dark:text-gray-500 mb-4 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                No wastage data found for the selected period
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {Object.keys(groupedByCategory).length > 0 && (
        <div className="text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-between text-sm">
          <div>
            Showing {Object.keys(groupedByCategory).length} categor
            {Object.keys(groupedByCategory).length !== 1 ? 'ies' : 'y'}
          </div>
          <div className="font-medium text-red-600 dark:text-red-400">
            Total Wastage: {totalWastage}
          </div>
        </div>
      )}
    </div>
  );
};

export default WestageReport;
