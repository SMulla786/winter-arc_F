/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {useRawMaterialReport} from '@/lib/api/admin/report';
import React, {useState, useMemo} from 'react';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';

interface storReportProp {
  hasEditAccess?: boolean;
}

const RawMaterialReport = ({
  hasEditAccess: propHasEditAccess,
}: storReportProp) => {
  const {data: rawData} = useRawMaterialReport();
  const {user} = useAuthContext();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openCategory, setOpenCategory] = useState<{[key: string]: boolean}>(
    {},
  );

  const restriction = user?.employeeRestriction?.storeReport;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  // Step 1: Filter by date
  const filteredData = useMemo(() => {
    if (!rawData) return [];

    return rawData.filter((item: any) => {
      const created = new Date(item?.rawmaterial?.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && created < start) return false;
      if (end && created > end) return false;

      return true;
    });
  }, [rawData, startDate, endDate]);

  // Group by category first, then by material name within category
  const groupedByCategory = useMemo(() => {
    const categoryMap: any = {};

    filteredData.forEach((item: any) => {
      const category = item.rawmaterial?.category?.name || 'Uncategorized';
      const materialId = item.id;
      const materialName = item.name;
      const qty = Number(item.quantity) || 0;
      const invOrder = Number(item.inventoryOrder) || 0;
      const totalQty = qty + invOrder;
      const unitPrice = Number(item.rawmaterial?.amount) || 0;
      const pendingAmount = totalQty * unitPrice;
      const unit = item.rawmaterial?.unit || 'N/A';

      // Initialize category if not exists
      if (!categoryMap[category]) {
        categoryMap[category] = {};
      }

      // Initialize material if not exists in this category
      if (!categoryMap[category][materialId]) {
        categoryMap[category][materialId] = {
          id: materialId,
          name: materialName,
          totalQuantity: 0,
          unitPrice: unitPrice,
          totalPendingAmount: 0,
          unit: unit,
        };
      }

      // Add quantities and pending amounts
      categoryMap[category][materialId].totalQuantity += totalQty;
      categoryMap[category][materialId].totalPendingAmount += pendingAmount;
    });

    return categoryMap;
  }, [filteredData]);

  // Calculate summary totals
  const {totalItems, totalPendingAmount} = useMemo(() => {
    let items = 0;
    let pending = 0;

    Object.values(groupedByCategory).forEach((category: any) => {
      Object.values(category).forEach((material: any) => {
        items++;
        pending += material.totalPendingAmount;
      });
    });

    return {totalItems: items, totalPendingAmount: pending};
  }, [groupedByCategory]);

  const toggleCategory = (cat: string) => {
    setOpenCategory((prev) => ({...prev, [cat]: !prev[cat]}));
  };

  // PDF download function (kept from original)
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

      let htmlContent = `
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
        <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
          <h2 style="margin:0; font-size:16px;">Store Report - Raw Materials</h2>
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

      htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:12px; margin-bottom:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Material Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Quantity</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Unit Price</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Pending Amount</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Unit</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Category</th>
            </tr>
          </thead>
          <tbody>
      `;

      Object.entries(groupedByCategory).forEach(
        ([category, materialsObj]: [string, any]) => {
          const materials = Object.values(materialsObj);
          htmlContent += `
            <tr style="background:#eef2ff; font-weight:bold;">
              <td colspan="6" style="padding:8px; border:1px solid #ddd;">${category}</td>
            </tr>
          `;
          materials.forEach((material: any, idx: number) => {
            htmlContent += `
              <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
                <td style="padding:8px; border:1px solid #ddd;">${material.name}</td>
                <td style="padding:8px; border:1px solid #ddd; text-align:center;">${material.totalQuantity}</td>
                <td style="padding:8px; border:1px solid #ddd; text-align:center;">₹${material.unitPrice.toFixed(2)}</td>
                <td style="padding:8px; border:1px solid #ddd; text-align:center;">₹${material.totalPendingAmount.toFixed(2)}</td>
                <td style="padding:8px; border:1px solid #ddd; text-align:center;">${material.unit}</td>
                <td style="padding:8px; border:1px solid #ddd; text-align:center;">${category}</td>
              </tr>
            `;
          });
        },
      );

      htmlContent += `
          </tbody>
        </table>
        <div style="margin-top:20px; padding-top:10px; border-top:1px solid #ddd; font-family: Arial, sans-serif; font-size:10px; color:#666; text-align:center;">
          <p>© All Rights Reserved by PhygitalTech. Contact: 95116 40351.</p>
        </div>
      `;

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
          <title>Store Report - Raw Materials</title>
          <style>
            html, body { margin:0; padding:0; font-family: Arial, sans-serif; color:#000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { padding:12px; }
            @media print { @page { margin: 12mm 8mm; } }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            setTimeout(() => { window.print(); setTimeout(() => window.close(), 600); }, 400);
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Failed to generate store PDF', err);
      alert('An error occurred while generating the store PDF.');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-800 text-3xl font-bold dark:text-white">
          Store Report
        </h2>
        {hasEditAccess && (
          <button
            onClick={handleDownloadPDF}
            className="rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out"
          >
            Download
          </button>
        )}
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
              <col style={{width: '250px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '150px'}} />
              <col style={{width: '120px'}} />
            </colgroup>
            <thead className="bg-gray-100 dark:bg-meta-4">
              <tr>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Material Name
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Quantity
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Pending Amount
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Unit
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Category Groups */}
        {Object.entries(groupedByCategory).map(
          ([category, materialsObj]: [string, any]) => {
            const materials = Object.values(materialsObj);
            const categoryTotal = materials.reduce(
              (sum: number, material: any) => sum + material.totalPendingAmount,
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
                    {/* <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      ₹{categoryTotal.toFixed(2)} total
                    </span> */}
                  </div>
                  {/* <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {materials.length} item{materials.length !== 1 ? 's' : ''}
                  </span> */}
                </button>

                {/* Expanded Category Content */}
                {openCategory[category] && (
                  <div className="bg-gray-50/50 overflow-x-auto px-2 py-2 dark:bg-meta-2/50">
                    <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                      <colgroup>
                        <col style={{width: '250px'}} />
                        <col style={{width: '120px'}} />
                        <col style={{width: '120px'}} />
                        <col style={{width: '150px'}} />
                        <col style={{width: '120px'}} />
                      </colgroup>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {materials.map((material: any, index: number) => (
                          <tr
                            key={material.id}
                            className="hover:bg-gray-50 dark:hover:bg-meta-2"
                          >
                            <td className="text-gray-900 dark:text-gray-100 px-4 py-3 text-sm font-medium">
                              {material.name}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {material.totalQuantity}
                            </td>
                            <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
                              ₹{material.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                              ₹{material.totalPendingAmount.toFixed(2)}
                            </td>
                            <td className="text-gray-600 dark:text-gray-400 px-4 py-3 text-sm">
                              <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                {material.unit}
                              </span>
                            </td>
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
                No raw material data found for the selected period
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawMaterialReport;
