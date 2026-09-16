/* eslint-disable */
import React, {useState, useMemo} from 'react';
import {useGetReportData} from '@/lib/api/admin/report';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'null';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'null'
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
};

interface ReportsProps {
  hasEditAccess?: boolean;
}

const Reports = ({hasEditAccess: propHasEditAccess}: ReportsProps) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openCustomer, setOpenCustomer] = useState<{[key: string]: boolean}>(
    {},
  );
  const {data} = useGetReportData();
  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.pendingBillReport;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((item: any) => {
      const eventStartDate = item?.startDate ? new Date(item.startDate) : null;
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (from && eventStartDate && eventStartDate < from) return false;
      if (to && eventStartDate && eventStartDate > to) return false;

      return true;
    });
  }, [data, dateFrom, dateTo]);

  // Group data by customer name
  const groupedByCustomer = useMemo(() => {
    const customerMap: any = {};

    filteredData.forEach((item: any) => {
      const customerName = item.customerName || 'Uncategorized';
      const eventId = item.id || Math.random().toString();

      // Initialize customer if not exists
      if (!customerMap[customerName]) {
        customerMap[customerName] = {
          customerName,
          events: [],
          totalPaid: 0,
          totalPending: 0,
          totalAmount: 0,
        };
      }

      // Add event to customer's events
      customerMap[customerName].events.push({
        eventName: item.eventName || 'null',
        startDate: formatDate(item.startDate),
        endDate: formatDate(item.endDate),
        paidAmount: item.paidAmount || 0,
        pendingAmount: item.pendingAmount || 0,
        totalAmount: item.totalAmount || 0,
        lastPaymentDate: formatDate(item.lastPaymentDate),
        nextFollowUpDate: formatDate(item.nextFollowUpDate),
      });

      // Update customer totals
      customerMap[customerName].totalPaid += item.paidAmount || 0;
      customerMap[customerName].totalPending += item.pendingAmount || 0;
      customerMap[customerName].totalAmount += item.totalAmount || 0;
    });

    return customerMap;
  }, [filteredData]);

  // Calculate overall totals
  const totals = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let total = 0;

    Object.values(groupedByCustomer).forEach((customer: any) => {
      paid += customer.totalPaid;
      pending += customer.totalPending;
      total += customer.totalAmount;
    });

    return {paid, pending, total};
  }, [groupedByCustomer]);

  const toggleCustomer = (customer: string) => {
    setOpenCustomer((prev) => ({...prev, [customer]: !prev[customer]}));
  };

  const handleDownload = () => {
    try {
      if (Object.keys(groupedByCustomer).length === 0) {
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
      <div style="text-align:center; border:1px solid #0D47A1; padding:8px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
        <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
          ${user?.fullname || 'Payment Reports'}
        </h1>
        <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
          ${user?.address ? `Address - ${user.address}` : ''}${
            user?.email ? ` | Email - ${user.email}` : ''
          } | Mob. ${user?.phoneNumber || ''}
        </p>
      </div>

      <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
        <h2 style="margin:0; font-size:16px;">Pending Payment Report</h2>
        <div style="font-size:11px; margin-top:4px; opacity:0.95;">
          Generated on: ${printedDateStr} |
          Date Range: ${
            dateFrom
              ? new Date(dateFrom).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'All'
          } - ${
            dateTo
              ? new Date(dateTo).toLocaleDateString('en-GB', {
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
          <div style="font-size:12px; font-weight:bold; color:#666;">Total Paid</div>
          <div style="font-size:16px; font-weight:bold; color:#059669;">₹${totals.paid.toLocaleString()}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12px; font-weight:bold; color:#666;">Total Pending</div>
          <div style="font-size:16px; font-weight:bold; color:#dc2626;">₹${totals.pending.toLocaleString()}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12px; font-weight:bold; color:#666;">Sub Total</div>
          <div style="font-size:16px; font-weight:bold; color:#2563eb;">₹${totals.total.toLocaleString()}</div>
        </div>
      </div>
    `;

      // TABLE HEADER
      htmlContent += `
      <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:12px; margin-bottom:12px;">
        <thead>
          <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Event Name</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Start Date</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">End Date</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Customer Name</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Paid Amount</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Pending Amount</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total Amount</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Last Payment</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Next Follow-up</th>
          </tr>
        </thead>
        <tbody>
    `;

      // TABLE ROWS grouped by customer
      Object.entries(groupedByCustomer).forEach(
        ([customerName, customerData]: [string, any]) => {
          // Customer header row
          htmlContent += `
          <tr style="background:#eef2ff; font-weight:bold;">
            <td colspan="9" style="padding:8px; border:1px solid #ddd;">
              Customer: ${customerName} (Total Pending: ₹${customerData.totalPending.toLocaleString()})
            </td>
          </tr>
        `;
          // Event rows for this customer
          customerData.events.forEach((row: any, idx: number) => {
            htmlContent += `
            <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${row.eventName}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${row.startDate}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${row.endDate}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${customerName}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; color:#059669;">₹${row.paidAmount.toLocaleString()}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; color:#dc2626;">₹${row.pendingAmount.toLocaleString()}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; color:#2563eb;">₹${row.totalAmount.toLocaleString()}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${row.lastPaymentDate}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${row.nextFollowUpDate}</td>
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
        'width=1200,height=800,scrollbars=yes',
      );
      if (!printWindow) {
        alert('Please allow popups for this site to generate PDF');
        return;
      }

      printWindow.document.write(`<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Pending Payment Report</title>
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
      console.error('Failed to generate payment PDF', err);
      alert(
        'An error occurred while generating the payment PDF. See console for details.',
      );
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-800 text-3xl font-bold dark:text-white">
          Payment Report
        </h2>
        {hasEditAccess && (
          <button
            onClick={handleDownload}
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
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
              End Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
            </colgroup>
            <thead className="bg-gray-100 dark:bg-meta-4">
              <tr>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Event Name
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  End Date
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Pending Amount
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="text-gray-700 dark:text-gray-300 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Next Follow-up
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Customer Groups */}
        {Object.entries(groupedByCustomer).map(
          ([customerName, customerData]: [string, any]) => (
            <div
              key={customerName}
              className="border-b border-stroke dark:border-strokedark"
            >
              {/* Customer Header - Clickable */}
              <button
                onClick={() => toggleCustomer(customerName)}
                className="flex w-full items-center justify-between bg-neutral-100 px-4 py-3 hover:bg-neutral-200 dark:bg-meta-4 dark:hover:bg-meta-3"
              >
                <div className="flex items-center gap-3">
                  {openCustomer[customerName] ? (
                    <FaAngleDown />
                  ) : (
                    <FaAngleRight />
                  )}
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {customerName}
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Pending: ₹{customerData.totalPending.toLocaleString()}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {customerData.events.length} event
                  {customerData.events.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Expanded Customer Content */}
              {openCustomer[customerName] && (
                <div className="bg-gray-50/50 overflow-x-auto px-2 py-2 dark:bg-meta-2/50">
                  <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                    <colgroup>
                      <col style={{width: '200px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                      <col style={{width: '120px'}} />
                    </colgroup>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {customerData.events.map((row: any, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-meta-2"
                        >
                          <td className="text-gray-900 dark:text-gray-100 px-4 py-3 text-sm font-medium">
                            {row.eventName}
                          </td>
                          <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
                            {row.startDate}
                          </td>
                          <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
                            {row.endDate}
                          </td>
                          <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
                            {customerName}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                            ₹{row.paidAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                            ₹{row.pendingAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ₹{row.totalAmount.toLocaleString()}
                          </td>
                          <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
                            {row.lastPaymentDate}
                          </td>
                          <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
                            {row.nextFollowUpDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ),
        )}

        {/* Empty State */}
        {Object.keys(groupedByCustomer).length === 0 && (
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
                No payment data found for the selected period
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
