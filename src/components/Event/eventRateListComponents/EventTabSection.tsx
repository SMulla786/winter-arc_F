/* eslint-disable @typescript-eslint/no-explicit-any */

import {useState} from 'react';
import AdditionalExtra from '@/components/EventSummary/AdditionalExtra';
import FuelAdd from '@/components/EventSummary/FuelAdd';
import TransportForm from '@/components/EventSummary/TransportForm';
import {useGetEventSummary} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  useGetTransport,
  useGetAdditional,
  useGetFuel,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';
import {Route} from '@/routes/_app/_event/events.$id';
import {useAuthContext} from '@/context/AuthContext';
import {FiDownload} from 'react-icons/fi';

const formatINR = (value: number = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);

const Line = ({label, value = 0}) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">{formatINR(value)}</span>
  </div>
);

const EventTabSection = () => {
  const {id: eventId} = Route.useParams();
  const {data: summary, isLoading} = useGetEventSummary(eventId);
  const {data: transportData} = useGetTransport(eventId);
  const {data: additionalData} = useGetAdditional(eventId);
  const {data: fuelData} = useGetFuel(eventId);
  const {user} = useAuthContext();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (isLoading)
    return (
      <div className="text-gray-500 flex justify-center py-16 text-lg">
        Loading summary...
      </div>
    );

  if (!summary?.subEvents)
    return (
      <div className="text-gray-500 py-16 text-center">
        No summary data available
      </div>
    );

  const subEvents = summary.subEvents;

  // Process transport data
  const transportsArray = Array.isArray(transportData)
    ? transportData
    : (transportData?.data ?? []);
  const rentalList = transportsArray.filter((t: any) => t.type === 'RENTAL');
  const ownList = transportsArray.filter((t: any) => t.type === 'OWN');
  const rentalTotal = rentalList.reduce(
    (sum, item) => sum + (item.total || 0),
    0,
  );
  const ownTotal = ownList.reduce((sum, item) => sum + (item.total || 0), 0);
  const transportTotal = rentalTotal + ownTotal;

  // Process additional extra data
  const additionalList = Array.isArray(additionalData) ? additionalData : [];
  const additionalTotal = additionalList.reduce(
    (sum, item) => sum + (item.total || 0),
    0,
  );

  // Process fuel data
  const fuelItems = fuelData?.data ?? [];
  const fuelTotal = fuelItems.reduce((sum, item) => sum + (item.total || 0), 0);

  // Calculate final totals
  const subEventsTotal = subEvents.reduce(
    (sum, e) => sum + (e.finalAmount ?? e.subEventTotal ?? 0),
    0,
  );

  const finalGrandTotal =
    subEventsTotal + transportTotal + additionalTotal + fuelTotal;

  const handleDownloadPDF = () => {
    if (!summary) return;

    setIsGeneratingPDF(true);

    const {subEvents: events} = summary;
    const eventName = summary.eventName || 'Event Summary';
    const startDate = summary.startDate;
    const endDate = summary.endDate;

    // ========== BUILD HTML ==========
    let htmlContent = `
    <!-- HEADER -->
    <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <!-- Logo (if available) -->
          <td width="10%" align="left" valign="middle">
            ${
              user?.logo
                ? `<img 
                    src="${user.logo}" 
                    alt="Company Logo"
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
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:15px; font-weight:bold;">
      <h2 style="margin:0; font-size:16px;">Complete Event Expense Summary</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        <strong>Event:</strong> ${eventName}
        ${
          startDate
            ? ` | <strong>Start Date:</strong> ${new Date(
                startDate,
              ).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}`
            : ''
        }
        ${
          endDate
            ? ` | <strong>End Date:</strong> ${new Date(
                endDate,
              ).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}`
            : ''
        }
      </div>
    </div>

   <!-- <!-- QUICK SUMMARY CARDS 
    <div style="margin-bottom:25px;">
      <h3 style="margin:0 0 10px; font-size:14px; color:#0D47A1; text-align:left;">Quick Summary</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
        <tr>
          <td style="padding:10px; background:#1E40AF; color:white; text-align:center; border-radius:4px 0 0 4px; font-size:12px;">
            <div style="font-weight:bold; margin-bottom:4px;">Sub-Events</div>
            <div style="font-size:14px; font-weight:bold;">${formatINR(subEventsTotal)}</div>
          </td>
          <td style="padding:10px; background:#7C3AED; color:white; text-align:center; font-size:12px;">
            <div style="font-weight:bold; margin-bottom:4px;">Transport</div>
            <div style="font-size:14px; font-weight:bold;">${formatINR(transportTotal)}</div>
          </td>
          <td style="padding:10px; background:#0F766E; color:white; text-align:center; font-size:12px;">
            <div style="font-weight:bold; margin-bottom:4px;">Additional</div>
            <div style="font-size:14px; font-weight:bold;">${formatINR(additionalTotal)}</div>
          </td>
          <td style="padding:10px; background:#D97706; color:white; text-align:center; border-radius:0 4px 4px 0; font-size:12px;">
            <div style="font-weight:bold; margin-bottom:4px;">Fuel</div>
            <div style="font-size:14px; font-weight:bold;">${formatINR(fuelTotal)}</div>
          </td>
        </tr>
      </table>
    </div> -->

    <!-- SUB-EVENTS SECTION -->
    <div style="margin-bottom:30px;">
      <h3 style="margin:20px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">
        Sub-Events Breakdown (Total: ${formatINR(subEventsTotal)})
      </h3>
      
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;">
        <thead>
          <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Sub-Event</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Raw Material</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Manpower</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Food Vendor</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Display</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Other</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Profit</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Add each sub-event
    events.forEach((event, index) => {
      const subtotal =
        (event.rawMaterial ?? 0) +
        (event.manpowerTotal ?? 0) +
        (event.foodVendor ?? 0) +
        (event.displayTotal ?? 0) +
        (event.additionalVendor ?? 0);

      const profitPercent = event.profit ?? 0;
      const profitAmount = (subtotal * profitPercent) / 100;
      const finalTotal = subtotal + profitAmount;
      const hasData = finalTotal > 0;

      htmlContent += `
          <tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8f8f8'}">
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700; color:${hasData ? '#0D47A1' : '#6B7280'}">
              ${event.subEventName}
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${hasData ? '#000' : '#6B7280'}">
              ${formatINR(event.rawMaterial)}
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${hasData ? '#000' : '#6B7280'}">
              ${formatINR(event.manpowerTotal)}
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${hasData ? '#000' : '#6B7280'}">
              ${formatINR(event.foodVendor)}
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${hasData ? '#000' : '#6B7280'}">
              ${formatINR(event.displayTotal)}
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${hasData ? '#000' : '#6B7280'}">
              ${formatINR(event.additionalVendor)}
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${hasData ? '#10B981' : '#6B7280'}">
              ${formatINR(profitAmount)} (${profitPercent}%)
            </td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:bold; color:${hasData ? '#0D47A1' : '#6B7280'}">
              ${formatINR(finalTotal)}
            </td>
          </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
    </div>

    <!-- TRANSPORT SECTION -->
    <div style="margin-bottom:30px;">
      <h3 style="margin:20px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">
        Transport Details (Total: ${formatINR(transportTotal)})
      </h3>

      <!-- Rental Vehicles -->
      <div style="margin-bottom:20px;">
        <h4 style="color:#1E40AF; font-size:13px; font-weight:bold; margin-bottom:8px;">
          Rental Vehicles (Total: ${formatINR(rentalTotal)})
        </h4>
    `;

    if (rentalList.length > 0) {
      htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:10px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Vendor Name</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Vehicle Number</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Rent</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Payment Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      rentalList.forEach((item: any, index: number) => {
        htmlContent += `
            <tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8f8f8'}">
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.vendorName || '-'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.vehicleNumber || '-'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:500;">${formatINR(item.total || 0)}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">
                ${
                  item.isPaid
                    ? '<span style="background:#D1FAE5; color:#065F46; padding:2px 6px; border-radius:3px; font-size:11px;">PAID</span>'
                    : '<span style="background:#FEF3C7; color:#92400E; padding:2px 6px; border-radius:3px; font-size:11px;">PENDING</span>'
                }
              </td>
            </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `
        <div style="padding:12px; text-align:center; color:#6B7280; font-style:italic; background:#F9FAFB; border-radius:4px;">
          No rental vehicles assigned
        </div>
      `;
    }

    // Own Vehicles
    htmlContent += `
      <!-- Own Vehicles -->
      <div style="margin-top:20px;">
        <h4 style="color:#1E40AF; font-size:13px; font-weight:bold; margin-bottom:8px;">
          Own Vehicles (Total: ${formatINR(ownTotal)})
        </h4>
    `;

    if (ownList.length > 0) {
      htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Vehicle</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Distance</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Trips</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total Cost</th>
            </tr>
          </thead>
          <tbody>
      `;

      ownList.forEach((item: any, index: number) => {
        const vehicleInfo = item.transport || {};
        htmlContent += `
            <tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8f8f8'}">
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">
                ${vehicleInfo.vehicleName || '-'} - ${vehicleInfo.vehicleNumber || '-'}
              </td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.distance || 0} Km</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.trip || 0}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:500;">${formatINR(item.total || 0)}</td>
            </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `
        <div style="padding:12px; text-align:center; color:#6B7280; font-style:italic; background:#F9FAFB; border-radius:4px;">
          No own vehicles assigned
        </div>
      `;
    }

    htmlContent += `
      </div>
    </div>

    <!-- ADDITIONAL EXTRAS SECTION -->
    <div style="margin-bottom:30px;">
      <h3 style="margin:20px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">
        Additional Extras (Total: ${formatINR(additionalTotal)})
      </h3>
    `;

    if (additionalList.length > 0) {
      htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Vendor</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Particular</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Quantity</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Price</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Payment Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      additionalList.forEach((item: any, index: number) => {
        htmlContent += `
            <tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8f8f8'}">
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.vendorName || '-'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.particular || '-'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity || 0}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:500;">${formatINR(item.price || 0)}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:bold;">${formatINR(item.total || 0)}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">
                ${
                  item.isPaid
                    ? '<span style="background:#D1FAE5; color:#065F46; padding:2px 6px; border-radius:3px; font-size:11px;">PAID</span>'
                    : '<span style="background:#FEF3C7; color:#92400E; padding:2px 6px; border-radius:3px; font-size:11px;">PENDING</span>'
                }
              </td>
            </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `
        <div style="padding:12px; text-align:center; color:#6B7280; font-style:italic; background:#F9FAFB; border-radius:4px;">
          No additional extras added yet
        </div>
      `;
    }

    htmlContent += `
    </div>

    <!-- FUEL DETAILS SECTION -->
    <div style="margin-bottom:30px;">
      <h3 style="margin:20px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">
        Fuel Details (Total: ${formatINR(fuelTotal)})
      </h3>
    `;

    if (fuelItems.length > 0) {
      htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Fuel Type</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Quantity</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Price per Unit</th>
              <th style="padding:8px; border:1px solid #ccc; text-align:center;">Total Cost</th>
            </tr>
          </thead>
          <tbody>
      `;

      fuelItems.forEach((item: any, index: number) => {
        htmlContent += `
            <tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8f8f8'}">
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:500;">${item.name || '-'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity || 0}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:500;">${formatINR(item.price || 0)}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:bold;">${formatINR(item.total || 0)}</td>
            </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `
        <div style="padding:12px; text-align:center; color:#6B7280; font-style:italic; background:#F9FAFB; border-radius:4px;">
          No fuel details added yet
        </div>
      `;
    }

    htmlContent += `
    </div>

    <!-- FINAL SUMMARY 
    <div style="background:#F8FAFC; border:2px solid #DC2626; border-radius:8px; padding:20px; margin-bottom:20px;">
      <h3 style="color:#DC2626; font-size:16px; font-weight:bold; margin:0 0 15px 0; text-align:center;">
        FINAL EVENT SUMMARY
      </h3>
      <table style="width:100%; border-collapse: collapse; font-size:13px;">
        <tr>
          <td style="padding:8px 0; color:#475569; font-weight:500;">Sub-Events Total</td>
          <td style="padding:8px 0; text-align:right; font-weight:500;">${formatINR(subEventsTotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#475569; font-weight:500;">Transport Total</td>
          <td style="padding:8px 0; text-align:right; font-weight:500;">${formatINR(transportTotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#475569; font-weight:500;">Additional Extras</td>
          <td style="padding:8px 0; text-align:right; font-weight:500;">${formatINR(additionalTotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#475569; font-weight:500;">Fuel Details</td>
          <td style="padding:8px 0; text-align:right; font-weight:500;">${formatINR(fuelTotal)}</td>
        </tr>
        <tr style="border-top:3px solid #CBD5E1;">
          <td style="padding:12px 0; font-size:15px; font-weight:bold; color:#DC2626;">GRAND TOTAL</td>
          <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; color:#DC2626;">${formatINR(finalGrandTotal)}</td>
        </tr>
      </table>
    </div> -->

  
    `;

    // ========== OPEN PRINT WINDOW ==========
    const fullHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Complete Event Expense Summary - ${eventName}</title>
  <style>
    @page { margin: 12mm 8mm; size: A4; }
    body { margin:0; padding:0; font-family: Arial, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table { width:100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    @media print {
      body { margin: 0; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div style="padding:12px;">
    ${htmlContent}
  </div>
  <script>
    setTimeout(() => {
      window.print();
      setTimeout(() => window.close(), 600);
    }, 400);
  </script>
</body>
</html>`;

    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );
    if (!printWindow) {
      alert('Please enable popups to download PDF');
      setIsGeneratingPDF(false);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    setIsGeneratingPDF(false);
  };

  const grandTotal =
    summary.grandTotal ??
    subEvents.reduce(
      (sum, e) => sum + (e.finalAmount ?? e.subEventTotal ?? 0),
      0,
    );

  return (
    <div className="mx-auto mt-2 md:mt-3">
      {/* Header with Download Button */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-blue-800 to-indigo-900 p-4 shadow-md">
          <h2 className="text-base font-medium text-white md:text-lg">
            Total Event Expenses
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-white md:text-xl">
              {formatINR(grandTotal)}
            </span>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 disabled:opacity-50"
            >
              <FiDownload className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </span>
              <span className="inline sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {subEvents.map((event) => {
          const subtotal =
            (event.rawMaterial ?? 0) +
            (event.manpowerTotal ?? 0) +
            (event.foodVendor ?? 0) +
            (event.displayTotal ?? 0) +
            (event.additionalVendor ?? 0);

          const profitPercent = event.profit ?? 0;
          const profitAmount = (subtotal * profitPercent) / 100;
          const finalTotal = subtotal + profitAmount;

          const hasData = finalTotal > 0;

          return (
            <details
              key={event.subEventId}
              className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-black"
            >
              <summary
                className={`flex cursor-pointer flex-col px-4 py-3 transition md:flex-row md:items-center md:justify-between ${
                  hasData
                    ? 'bg-indigo-50 text-indigo-900 dark:bg-boxdark dark:text-white'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                <span className="truncate text-sm font-medium md:text-base">
                  {event.subEventName}
                </span>

                <span className="text-sm font-semibold md:text-lg">
                  {formatINR(finalTotal)}
                </span>
              </summary>
              <div className="bg-gray-50 border-t border-stroke px-4 py-3 dark:border-strokedark">
                {!hasData ? (
                  <p className="text-gray-500 py-2 text-center italic">
                    No expenses recorded yet
                  </p>
                ) : (
                  <div className="flex flex-col gap-y-2">
                    <Line label="Raw Material" value={event.rawMaterial} />
                    <Line label="Manpower" value={event.manpowerTotal} />
                    <Line label="Food Vendor" value={event.foodVendor} />
                    <Line label="Display" value={event.displayTotal} />
                    <Line label="Other" value={event.additionalVendor} />
                    <div className="flex justify-between font-medium text-green-600">
                      <span>Profit ({profitPercent}%)</span>
                      <span>{formatINR(profitAmount)}</span>
                    </div>
                    <div className="border-gray-300 col-span-2 flex justify-between border-t pt-2 text-base font-semibold">
                      <span>Sub-Event Total</span>
                      <span>{formatINR(finalTotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      <div className="mt-2">
        <TransportForm />
      </div>
      <div className="mt-2">
        <AdditionalExtra />
      </div>
      <div className="mt-2">
        <FuelAdd />
      </div>
    </div>
  );
};

export default EventTabSection;
