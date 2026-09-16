/* eslint-disable */
import React from 'react';
import {useParams, useNavigate} from '@tanstack/react-router';
import {useGetMaharajById} from '@/lib/react-query/queriesAndMutations/cateror/maharaj';

type SubEventRow = {
  id: string;
  event: string;
  subEvent: string;
  dateTime: string;
  dish: string;
  dishKg: string;
  address: string;
  paidAmount: string;
  pendingAmount: string;
  total: string;
};

const MaharajById: React.FC = () => {
  const navigate = useNavigate();
  const {id} = useParams({from: '/_app/maharaj/maharajdata/$id'}) as {
    id: string;
  };
  const {data} = useGetMaharajById(id);

  // 🔹 Prepare rows
  const rows: SubEventRow[] =
    data?.map((item: any) => {
      const dateStr = item.date
        ? new Date(item.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'N/A';
      const timeStr = item.time
        ? new Date(item.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'N/A';
      return {
        id: item.id || '',
        event: item.event,
        subEvent: item.subEvent || 'N/A',
        dateTime: `${dateStr}${timeStr !== 'N/A' ? `, ${timeStr}` : ''}`,
        dish: item.dish || 'N/A',
        dishKg: item.dishKg ?? '-',
        address: item.address ?? '-',
        paidAmount: item.paidAmount ?? '-',
        pendingAmount: item.pendingAmount ?? '-',
        total: item.total ?? '-',
      };
    }) || [];

  // 🔹 Group by event
  const groupedData: Record<string, SubEventRow[]> = {};
  rows.forEach((row) => {
    if (!groupedData[row.event]) groupedData[row.event] = [];
    groupedData[row.event].push(row);
  });

  // 🔹 Sort each group by date only (latest first)
  Object.keys(groupedData).forEach((eventName) => {
    groupedData[eventName].sort((a, b) => {
      const dateA = new Date(a.dateTime.split(',')[0].trim()).getTime();
      const dateB = new Date(b.dateTime.split(',')[0].trim()).getTime();
      return dateB - dateA;
    });
  });

  // 🔹 Sort event groups themselves by newest date in the group
  const sortedEventGroups = Object.entries(groupedData).sort(
    ([, rowsA], [, rowsB]) => {
      const latestA = new Date(
        rowsA[0].dateTime.split(',')[0].trim(),
      ).getTime();
      const latestB = new Date(
        rowsB[0].dateTime.split(',')[0].trim(),
      ).getTime();
      return latestB - latestA; // newest group first
    },
  );
  // 🔹 Print functionality - only table (with blue theme design)
  const handlePrint = () => {
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-container, .print-container * {
        visibility: visible;
      }
      .print-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.style.width = '100%';
    printContainer.style.background = 'white';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    printContainer.style.color = 'black';
    printContainer.style.textAlign = 'center';

    // Header with blue theme
    const headerWrapper = document.createElement('div');
    headerWrapper.style.border = '2px solid #1E3A8A';
    headerWrapper.style.textAlign = 'center';
    headerWrapper.style.color = 'black';

    const centerInfo = document.createElement('div');
    centerInfo.innerHTML = `
    <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
      Maharaj Event Details
    </h1>
    <div style="background:#1E3A8A; height:3px; margin:4px auto; width:80%;"></div>
    <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
      Generated on: ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}
    </p>
  `;
    headerWrapper.appendChild(centerInfo);
    printContainer.appendChild(headerWrapper);

    // Event Information
    if (sortedEventGroups.length > 0) {
      const eventInfo = document.createElement('div');
      eventInfo.style.textAlign = 'center';
      eventInfo.innerHTML = `
      <div style="font-size: 14px; color: #1E40AF;">
        <strong style="color: #1E3A8A;">Event:</strong> ${sortedEventGroups[0][0]}
      </div>
    `;
      printContainer.appendChild(eventInfo);
    }

    // Create main table container
    const tableContainer = document.createElement('div');
    tableContainer.style.width = '100%';
    tableContainer.style.overflow = 'hidden';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '11px';
    table.style.backgroundColor = 'white';
    table.style.textAlign = 'center';
    table.style.verticalAlign = 'middle';

    // Table header with blue theme
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    ['Event', 'Sub Event', 'Date & Time', 'Dish', 'Kg', 'Address'].forEach(
      (text) => {
        const th = document.createElement('th');
        th.innerText = text;
        th.style.border = '1px solid #1E3A8A';
        th.style.padding = '6px 4px';
        th.style.backgroundColor = '#1E3A8A';
        th.style.color = 'white';
        th.style.fontWeight = 'bold';
        th.style.fontSize = '11px';
        th.style.textTransform = 'uppercase';
        th.style.letterSpacing = '0.3px';
        th.style.whiteSpace = 'nowrap';
        headerRow.appendChild(th);
      },
    );

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');

    sortedEventGroups.forEach(([eventName, rows]) => {
      rows.forEach((row, idx) => {
        const isFirstInEvent = idx === 0;
        const isFirstInSubEvent =
          idx === 0 || row.subEvent !== rows[idx - 1].subEvent;
        const subEventRowSpan = rows.filter(
          (r) => r.subEvent === row.subEvent,
        ).length;

        const tr = document.createElement('tr');
        tr.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

        // Event cell (with rowspan if first in event)
        if (isFirstInEvent) {
          const eventCell = document.createElement('td');
          eventCell.innerText = eventName;
          eventCell.style.border = '1px solid #cbd5e1';
          eventCell.style.padding = '6px 4px';
          eventCell.style.fontWeight = 'bold';
          eventCell.style.color = '#1E3A8A';
          eventCell.style.backgroundColor = '#eff6ff';
          eventCell.style.verticalAlign = 'middle';
          eventCell.rowSpan = rows.length;
          tr.appendChild(eventCell);
        }

        // Sub Event cell (with rowspan if first in sub-event)
        if (isFirstInSubEvent) {
          const subEventCell = document.createElement('td');
          subEventCell.innerText = row.subEvent;
          subEventCell.style.border = '1px solid #cbd5e1';
          subEventCell.style.padding = '6px 4px';
          subEventCell.style.fontWeight = '600';
          subEventCell.style.color = '#334155';
          subEventCell.style.backgroundColor = '#f1f5f9';
          subEventCell.style.verticalAlign = 'middle';
          subEventCell.rowSpan = subEventRowSpan;
          tr.appendChild(subEventCell);
        }

        // Date & Time cell (with rowspan if first in sub-event)
        if (isFirstInSubEvent) {
          const dateTimeCell = document.createElement('td');
          dateTimeCell.innerText = row.dateTime;
          dateTimeCell.style.border = '1px solid #cbd5e1';
          dateTimeCell.style.padding = '6px 4px';
          dateTimeCell.style.color = '#475569';
          dateTimeCell.style.verticalAlign = 'middle';
          dateTimeCell.rowSpan = subEventRowSpan;
          tr.appendChild(dateTimeCell);
        }

        // Dish cell
        const dishCell = document.createElement('td');
        dishCell.innerText = row.dish;
        dishCell.style.border = '1px solid #cbd5e1';
        dishCell.style.padding = '6px 4px';
        dishCell.style.color = '#0f172a';
        dishCell.style.fontWeight = '500';
        dishCell.style.verticalAlign = 'middle';
        tr.appendChild(dishCell);

        // Kg cell
        const kgCell = document.createElement('td');
        kgCell.innerText = row.dishKg;
        kgCell.style.border = '1px solid #cbd5e1';
        kgCell.style.padding = '6px 4px';
        kgCell.style.color = '#1E3A8A';
        kgCell.style.fontWeight = '600';
        kgCell.style.verticalAlign = 'middle';
        tr.appendChild(kgCell);

        // Address cell (with rowspan if first in sub-event)
        if (isFirstInSubEvent) {
          const addressCell = document.createElement('td');
          addressCell.innerText = row.address;
          addressCell.style.border = '1px solid #cbd5e1';
          addressCell.style.padding = '6px 4px';
          addressCell.style.color = '#475569';
          addressCell.style.fontSize = '10.5px';
          addressCell.style.lineHeight = '1.3';
          addressCell.style.verticalAlign = 'middle';
          addressCell.rowSpan = subEventRowSpan;
          tr.appendChild(addressCell);
        }

        tbody.appendChild(tr);
      });
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    printContainer.appendChild(tableContainer);

    // Summary section
    const summary = document.createElement('div');
    summary.style.backgroundColor = '#f0f9ff';
    summary.style.border = '1px solid #bae6fd';
    summary.style.textAlign = 'center';

    let totalEvents = 0;
    let totalSubEvents = 0;
    const uniqueSubEvents = new Set();

    sortedEventGroups.forEach(([eventName, rows]) => {
      totalEvents++;
      rows.forEach((row) => uniqueSubEvents.add(row.subEvent));
    });
    totalSubEvents = uniqueSubEvents.size;

    summary.innerHTML = `
    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
      <div style="color: #1E3A8A;">
        <strong style="display: block; font-size: 12px;">Total Events</strong>
        <span style="font-size: 20px; font-weight: bold;">${totalEvents}</span>
      </div>
      <div style="color: #1E3A8A;">
        <strong style="display: block; font-size: 12px;">Total Sub Events</strong>
        <span style="font-size: 20px; font-weight: bold;">${totalSubEvents}</span>
      </div>
      <div style="color: #1E3A8A;">
        <strong style="display: block; font-size: 12px;">Total Entries</strong>
        <span style="font-size: 20px; font-weight: bold;">${rows.length}</span>
      </div>
    </div>
  `;

    printContainer.appendChild(summary);

    // Footer
    const footer = document.createElement('div');
    footer.style.borderTop = '2px solid #1E3A8A';
    footer.style.color = '#64748b';
    footer.style.fontSize = '10px';

    const signatureLine = document.createElement('div');
    signatureLine.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="width: 30%; text-align: left;">
        <div style="border-top: 1px solid #94a3b8; padding-top: 3px;">
          <strong>Prepared By</strong><br/>
          ___________________
        </div>
      </div>
      <div style="width: 30%;">
        <div style="text-align: center; color: #1E3A8A; font-weight: bold; font-size: 11px;">
          © ${new Date().getFullYear()} Maharaj Management System
        </div>
      </div>
      <div style="width: 30%; text-align: right;">
        <div style="border-top: 1px solid #94a3b8; padding-top: 3px;">
          <strong>Approved By</strong><br/>
          ___________________
        </div>
      </div>
    </div>
  `;

    footer.appendChild(signatureLine);
    printContainer.appendChild(footer);

    document.head.appendChild(printStyle);
    document.body.appendChild(printContainer);

    // Trigger print
    window.print();

    // Clean up after printing
    setTimeout(() => {
      document.head.removeChild(printStyle);
      document.body.removeChild(printContainer);
    }, 100);
  };

  // 🔹 WhatsApp share functionality (removed financial details)
  const handleWhatsAppShare = (eventName: string, rows: SubEventRow[]) => {
    if (!rows || rows.length === 0) return;

    const firstRow = rows[0];

    const dishesText = rows
      .map((r, index) => `${index + 1}. ${r.dish} - ${r.dishKg}`)
      .join('\n');

    const message = `Event Details:\n
Event: ${eventName}
Sub Event: ${firstRow.subEvent}
Date & Time: ${firstRow.dateTime}
Address: ${firstRow.address}

Dishes:
${dishesText}
`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="mb-4">
      <div className="no-print mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate({to: '/foodvendor'})}
          className="dark:text-gray-200 px-4 py-2 text-xl font-bold transition"
        >
          ← Back
        </button>

        <button
          onClick={handlePrint}
          className="hover:bg-primary-dark flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print
        </button>
      </div>

      <div className="no-print rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
        <h2 className="mb-3 text-lg font-semibold">Sub Events</h2>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Event
                </th>
                <th className="min-w-[120px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Sub Event
                </th>
                <th className="min-w-[120px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Date & Time
                </th>
                <th className="min-w-[120px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Dish
                </th>
                <th className="min-w-[120px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Kg
                </th>
                <th className="min-w-[120px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Address
                </th>
                <th className="min-w-[100px] px-3 py-2.5 text-center font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedEventGroups.map(([eventName, rows]) =>
                rows.map((row, idx) => (
                  <tr key={idx} className="text-sm">
                    {idx === 0 && (
                      <td
                        rowSpan={rows.length}
                        className="border-b border-[#eee] px-3 py-2 text-center align-middle font-semibold dark:border-strokedark"
                      >
                        {eventName}
                      </td>
                    )}

                    {idx === 0 || row.subEvent !== rows[idx - 1].subEvent ? (
                      <td
                        rowSpan={
                          rows.filter((r) => r.subEvent === row.subEvent).length
                        }
                        className="border-b border-[#eee] px-3 py-2 text-center align-middle dark:border-strokedark"
                      >
                        {row.subEvent}
                      </td>
                    ) : null}

                    {idx === 0 || row.subEvent !== rows[idx - 1].subEvent ? (
                      <td
                        rowSpan={
                          rows.filter((r) => r.subEvent === row.subEvent).length
                        }
                        className="border-b border-[#eee] px-3 py-2 text-center align-middle dark:border-strokedark"
                      >
                        {row.dateTime}
                      </td>
                    ) : null}

                    <td className="border-b border-[#eee] px-3 py-2 text-center align-middle dark:border-strokedark">
                      {row.dish}
                    </td>
                    <td className="border-b border-[#eee] px-3 py-2 text-center align-middle dark:border-strokedark">
                      {row.dishKg}
                    </td>

                    {idx === 0 || row.subEvent !== rows[idx - 1].subEvent ? (
                      <td
                        rowSpan={
                          rows.filter((r) => r.subEvent === row.subEvent).length
                        }
                        className="border-b border-[#eee] px-3 py-2 text-center align-middle dark:border-strokedark"
                      >
                        {row.address}
                      </td>
                    ) : null}

                    {/* WhatsApp Action Column */}
                    {idx === 0 && (
                      <td
                        rowSpan={rows.length}
                        className="border-b border-[#eee] px-3 py-2 text-center align-middle dark:border-strokedark"
                      >
                        <button
                          onClick={() => handleWhatsAppShare(eventName, rows)}
                          className="mx-auto flex items-center justify-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-green-600"
                          title="Share via WhatsApp"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.18-1.24-6.169-3.495-8.418" />
                          </svg>
                          Share
                        </button>
                      </td>
                    )}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-only table (removed financial columns) */}
      <div className="hidden print:block">
        <div className="print-header">
          <h1>Maharaj Event Details</h1>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Sub Event</th>
              <th>Date & Time</th>
              <th>Dish</th>
              <th>Kg</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {sortedEventGroups.map(([eventName, rows]) =>
              rows.map((row, idx) => {
                const isFirstInEvent = idx === 0;
                const isFirstInSubEvent =
                  idx === 0 || row.subEvent !== rows[idx - 1].subEvent;
                const subEventRowSpan = rows.filter(
                  (r) => r.subEvent === row.subEvent,
                ).length;

                return (
                  <tr key={`print-${idx}`}>
                    {isFirstInEvent && (
                      <td rowSpan={rows.length}>{eventName}</td>
                    )}
                    {isFirstInSubEvent && (
                      <td rowSpan={subEventRowSpan}>{row.subEvent}</td>
                    )}
                    {isFirstInSubEvent && (
                      <td rowSpan={subEventRowSpan}>{row.dateTime}</td>
                    )}
                    <td>{row.dish}</td>
                    <td>{row.dishKg}</td>
                    {isFirstInSubEvent && (
                      <td rowSpan={subEventRowSpan}>{row.address}</td>
                    )}
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
        <div className="print-footer">
          <p>© {new Date().getFullYear()} Maharaj Management System</p>
        </div>
      </div>
    </div>
  );
};

export default MaharajById;
