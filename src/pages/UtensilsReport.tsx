/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {useUtensilsReport} from '@/lib/api/admin/report';
import React, {useMemo, useState} from 'react';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';

const UtensilsReport = () => {
  const {user} = useAuthContext();
  const {data: utensilsData} = useUtensilsReport();
  console.log('utensilssss', utensilsData);
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

  const filteredEvents = useMemo(() => {
    if (!utensilsData) return [];

    return utensilsData.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      const filterStart = startDate ? new Date(startDate) : null;
      const filterEnd = endDate ? new Date(endDate) : null;

      if (filterStart && filterEnd)
        return eventStart >= filterStart && eventEnd <= filterEnd;

      if (filterStart) return eventStart >= filterStart;
      if (filterEnd) return eventEnd <= filterEnd;

      return true;
    });
  }, [utensilsData, startDate, endDate]);

  const eventNames = useMemo(() => {
    if (!filteredEvents) return [];
    return [...new Set(filteredEvents.map((e) => e.name))];
  }, [filteredEvents]);

  const flattenedData = useMemo(() => {
    const result: any[] = [];

    filteredEvents.forEach((event) => {
      event.utensils.forEach((u) => {
        result.push({
          category: u.category,
          utensil: u.utensil,
          eventName: event.name,
          missing: u.missing,
        });
      });
    });

    return result;
  }, [filteredEvents]);

  const groupedByCategory = useMemo(() => {
    const categoryMap: any = {};

    flattenedData.forEach((item) => {
      const key = item.category + '-' + item.utensil;

      if (!categoryMap[item.category]) {
        categoryMap[item.category] = {};
      }

      if (!categoryMap[item.category][key]) {
        categoryMap[item.category][key] = {
          category: item.category,
          utensil: item.utensil,
          totalMissing: 0,
          events: {},
        };
      }

      categoryMap[item.category][key].totalMissing += item.missing;
      categoryMap[item.category][key].events[item.eventName] = item.missing;
    });

    return categoryMap;
  }, [flattenedData]);

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

      // Calculate total missing utensils
      let totalMissingAll = 0;
      Object.values(groupedByCategory).forEach((category: any) => {
        Object.values(category).forEach((utensil: any) => {
          totalMissingAll += utensil.totalMissing;
        });
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
      <h2 style="margin:0; font-size:16px;">Utensils Missing Report</h2>
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
      for (const [category, utensilsObj] of Object.entries(groupedByCategory)) {
        const utensils = Object.values(utensilsObj) as any[];

        // Calculate category total
        const categoryTotal = utensils.reduce(
          (sum: number, utensil: any) => sum + utensil.totalMissing,
          0,
        );

        // Category Header
        htmlContent += `
      <div style="margin-top:15px; margin-bottom:5px; font-family: Arial, sans-serif;">
        <div style="background:#1E3A8A; color:#fff; padding:8px 12px; font-weight:bold; font-size:13px;">
          ${category} (Total Missing: ${categoryTotal})
        </div>
      `;

        // Table for this category
        htmlContent += `
        <table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:10px; margin-bottom:15px;">
          <thead>
            <tr style="background:#374151; color:#fff; font-weight:700;">
              <th style="padding:6px 8px; border:1px solid #ccc; text-align:left;">Utensil Name</th>
              <th style="padding:6px 8px; border:1px solid #ccc; text-align:center;">Total Missing</th>
              ${eventNames
                .map(
                  (event) => `
                <th style="padding:6px 8px; border:1px solid #ccc; text-align:center;">${event}</th>
              `,
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
      `;

        // Table Rows for utensils
        utensils.forEach((utensil: any, idx: number) => {
          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'}; page-break-inside: avoid; break-inside: avoid;">
            <td style="padding:6px 8px; border:1px solid #ddd; font-weight:600;">${utensil.utensil}</td>
            <td style="padding:6px 8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#dc2626;">${utensil.totalMissing}</td>
            ${eventNames
              .map(
                (event) => `
              <td style="padding:6px 8px; border:1px solid #ddd; text-align:center;">${utensil.events[event] || 0}</td>
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
      <title>Utensils Missing Report</title>
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
      console.error('Failed to generate utensils PDF', err);
      alert(
        'An error occurred while generating the utensils PDF. See console for details.',
      );
    }
  };

  return (
    <div className="bg-white p-6 dark:bg-boxdark dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utensils Missing Report</h1>
        <button
          onClick={handleDownloadPDF}
          className="rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out"
        >
          Download
        </button>
      </div>

      {/* DATE FILTER */}
      <div className="mb-8 rounded-lg bg-white p-4 dark:bg-boxdark">
        <h2 className="mb-4 text-lg font-semibold">Filter by Date Range</h2>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-stroke px-2 py-1 text-sm dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-stroke px-2 py-1 text-sm dark:bg-form-input dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto border-b border-stroke dark:border-strokedark">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <colgroup>
              <col style={{width: '200px'}} />
              <col style={{width: '120px'}} />
              {eventNames.map(() => (
                <col style={{width: '120px'}} />
              ))}
            </colgroup>

            <thead className="bg-gray-100 dark:bg-meta-4">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Utensil
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Total Missing
                </th>

                {eventNames.map((event) => (
                  <th
                    key={event}
                    className="px-4 py-3 text-left text-xs font-medium uppercase"
                  >
                    {event}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {Object.entries(groupedByCategory).map(
          ([category, utensilsObj]: any) => {
            const utensils = Object.values(utensilsObj);

            return (
              <div
                key={category}
                className="border-b border-stroke dark:border-strokedark"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between bg-neutral-100 px-4 py-2 dark:bg-meta-4"
                >
                  <span className="">{category}</span>
                  {openCategory[category] ? <FaAngleDown /> : <FaAngleRight />}
                </button>

                {openCategory[category] && (
                  <div className="overflow-x-auto px-2 py-2">
                    <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                      <colgroup>
                        <col style={{width: '200px'}} />
                        <col style={{width: '120px'}} />
                        {eventNames.map(() => (
                          <col style={{width: '120px'}} />
                        ))}
                      </colgroup>

                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {utensils.map((item: any, i: number) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50 dark:hover:bg-meta-2"
                          >
                            <td className="px-4 py-2 text-sm">
                              {item.utensil}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold">
                              {item.totalMissing}
                            </td>

                            {eventNames.map((event) => (
                              <td key={event} className="px-4 py-2 text-sm">
                                {item.events[event] || 0}
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
      </div>
    </div>
  );
};

export default UtensilsReport;
