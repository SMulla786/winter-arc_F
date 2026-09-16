/* eslint-disable */
import React, {useState, useRef, useEffect} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';
import {
  useGetSubevent,
  useGetWastages,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {FiDownload} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DishWastage from './DishWastage';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

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
      quantity?: number; // Assuming preparationQuantity quantity is here
    };
    quantity?: number; // Fallback for preparationQuantity
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

const WastageReport: React.FC = () => {
  const {user} = useAuthContext();

  const dishWastageRef = useRef<{submit: () => void}>(null);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const {id: EventId} = Route.useParams<{id: string}>();
  const {data: wastagesData, refetch} = useGetWastages(EventId);
  const {data: subEventResponse} = useGetSubevent(EventId) as {
    data?: SubEventResponse;
  };
  console.log('sub eventsssssssss...', subEventResponse);

  const subEvents: SubEvent[] = subEventResponse?.data.subEvents || [];

  const [selectedSubEvent, setSelectedSubEvent] = useState<string | null>(null);

  const [selectedSubEventName, setSelectedSubEventName] = useState<string>();
  const [isPDFLoading, setIsPDFLoading] = useState(false);

  useEffect(() => {
    if (subEvents.length > 0 && !selectedSubEvent) {
      const firstSubEvent = subEvents[0];
      setSelectedSubEvent(firstSubEvent.id);
      setSelectedSubEventName(firstSubEvent.name);
    }
  }, [subEvents, selectedSubEvent]);

  const getMappedWastagesForPDF = () => {
    const wastageSubEvents = wastagesData?.data || []; // Updated to match your API response
    return subEvents.map((subEvent) => {
      const matchingWastageSubEvent = wastageSubEvents.find(
        (wse: any) => wse.subeventid === subEvent.id, // Changed to subeventid
      );

      const wastageMap = new Map(
        matchingWastageSubEvent?.wastage?.map((w: any) => [w.dishId, w]),
      );

      const mappedDishes = subEvent.dishes.map((dish) => {
        const wastage = wastageMap.get(dish.dish.id);
        // Get preparationQuantity from wastage data, not from dish
        const preparationQuantity = wastage?.preparationQuantity ?? 0;

        return {
          dishId: dish.dish.id,
          dishname: dish.dish.name,
          categoryId: dish.dish.categoryId,
          categoryname: dish.dish.category.name,
          preparationQuantity, // Use from wastage
          quantity: wastage?.quantity ?? 0,
          measurement: wastage?.measurement ?? 'kg',
          reason: wastage?.reason,
          actual: wastage?.actual ?? 0,
          unit: 'kg', // Add unit field
        };
      });

      return {
        subEventName: subEvent.name,
        subEventAddress: subEvent.address,
        subEventDate: subEvent.date,
        subEventTime: subEvent.time,
        actualPeople: subEvent.actualPeople,
        expectedPeople: subEvent.expectedPeople,
        dishes: mappedDishes,
      };
    });
  };

  const handleDownloadPDF = () => {
    if (!subEvents || !wastagesData) return;

    setIsPDFLoading?.(true);

    const reportData = getMappedWastagesForPDF();

    const grouped = reportData.reduce((acc, subEvent) => {
      acc[subEvent.subEventName] = {
        name: subEvent.subEventName,
        address: subEvent.subEventAddress,
        date: subEvent.subEventDate,
        time: subEvent.subEventTime,
        actualPeople: subEvent.actualPeople,
        expectedPeople: subEvent.expectedPeople,
        dishes: subEvent.dishes || [],
      };
      return acc;
    }, {});

    const allEntries = Object.entries(grouped);
    const docTitle = 'Wastage Report';

    const htmlContent = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${docTitle}</title>
<style>
  :root {
    --blue-1: #0D47A1;
    --blue-2: #1E3A8A;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: #000;
  }

  body.first-page .repeat-title { display: none !important; }

  .repeat-title {
    position: fixed;
    top: 8px;
    left: 8px;
    background: var(--blue-1);
    color: white;
    font-weight: 700;
    font-size: 13px;
    padding: 6px 10px;
    z-index: 9999;
    border-radius: 0 0 4px 0;
  }

  .container { padding: 28px; }

  .first-header {
    text-align: center;
    border: 1px solid var(--blue-1);
    padding: 8px;
    background: #E3F2FD;
    margin-bottom: 12px;
  }

  .first-header h1 {
    margin: 0;
    font-size: 22px;
    color: var(--blue-1);
    font-weight: 800;
  }

  .first-header .divider {
    background: var(--blue-1);
    height: 2px;
    margin: 4px auto;
    width: 80%;
  }

  .first-header p {
    margin: 6px 0 0;
    font-size: 11px;
    font-weight: bold;
  }

  .title-bar {
    text-align: left;
    background: var(--blue-1);
    color: white;
    padding: 10px 14px;
    margin-bottom: 12px;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  background: #011536;

  }

  .event-info {
    font-size: 13px;
    font-weight: 600;
  }

.subevent-row {
  margin-bottom: 10px;
  page-break-inside: avoid;
  break-inside: avoid;
}

.subevent-info-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; 
  align-items: flex-start;    
  background: var(--blue-2);
  color: white;
  padding: 6px 2px;
  font-weight: 700;
  font-size: 12px;
  gap: 2px;
}


  .subevent-info-line > div { flex: 1; min-width: 80px; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-bottom: 12px;
  }

  thead { display: table-header-group; }

  th {
    background: var(--blue-2);
    color: white;
    padding: 6px 8px;
    border: 1px solid #ccc;
    font-weight: 700;
    font-size: 12px;
    text-align: left;
  }

  td {
    padding: 6px 8px;
    border: 1px solid #ddd;
    vertical-align: middle;
    font-weight: 700;
    font-size: 12px;
  }

  td.reason { width: 30%; }

  tr:nth-child(even) { background-color: #f8f8f8; }

  .no-data { border: 1px solid #ddd; padding: 10px; text-align: center; color: #999; font-style: italic; }

  .footer { margin-top: 18px; font-size: 10px; text-align: center; color: #666; }

  @media print {
    body { margin: 0; }
    .container { padding: 16px 16px 16px 16px; }
    .subevent-row { page-break-inside: avoid; }
  }
</style>
</head>
<body class="first-page">

  <div class="container">
    <div class="first-header">
      <h1>${user?.fullname || 'Caterer Name'}</h1>
      <div class="divider"></div>
      <p>
        ${user?.address ? `${user.address}<br/>` : ''}
        ${user?.email ? `Email - ${user.email}<br/>` : ''}
        Mob. ${user?.phoneNumber || ''}
      </p>
    </div>
     <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
        <h2 style="margin:0; font-size:16px;">Wastage Report</h2>
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

    ${allEntries
      .map(([key, data]) => {
        const groupedByCategory = (data.dishes || []).reduce(
          (acc: Record<string, any[]>, dish: any) => {
            const category = dish.categoryname || 'Others';
            if (!acc[category]) acc[category] = [];
            acc[category].push(dish);
            return acc;
          },
          {},
        );

        const rows = Object.entries(groupedByCategory)
          .map(([categoryName, dishes]) => {
            const categoryRow = `
      <tr>
        <td colspan="5"
          style="
            background:#E3F2FD;
            font-weight:800;
            color:#0D47A1;
            border:1px solid #ccc;
            padding:6px 8px;
          ">
          ${categoryName}
        </td>
      </tr>
    `;

            const dishRows = dishes
              .map(
                (d, i) => `
        <tr style="${i % 2 === 0 ? '' : 'background-color:#f8f8f8;'}">
          <td style="width:25%;">${d.dishname || 'N/A'}</td>
          <td style="width:15%; text-align:center;">${d.preparationQuantity ?? 0} kg</td>
          <td style="width:15%; text-align:center;">${d.actual ?? 0} kg</td>
          <td style="width:15%; text-align:center;">${d.quantity ?? 0} kg</td>
          <td class="reason">${d.reason || 'N/A'}</td>
        </tr>
      `,
              )
              .join('');

            return categoryRow + dishRows;
          })
          .join('');

        const formattedTime = data.time
          ? new Date(data.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'N/A';
        const people = data.actualPeople || data.expectedPeople || 'N/A';

        return `
      <div class="subevent-row">
        <div class="subevent-info-line">
          <div>Name: ${data.name || 'Unnamed Sub Event'}</div>
          <div>Address: ${data.address || 'N/A'}</div>
          <div>Date: ${data.date ? new Date(data.date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : 'N/A'}</div>
          <div>Time: ${formattedTime}</div>
          <div>People: ${people}</div>
        </div>

        ${
          rows.length > 0
            ? `<table>
          <thead>
            <tr>
              <th>Dish</th>
              <th>Preparation Quantity(kg)</th>
              <th>Actual</th>
              <th>Wastage(kg)</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`
            : `<div class="no-data">No wastage recorded for ${data.name || 'this sub event'}</div>`
        }
      </div>`;
      })
      .join('')}

    <div class="footer">
      Generated on: ${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}
    </div>
  </div>

  <script>
    setTimeout(()=>{document.body.classList.remove('first-page');setTimeout(()=>{try{window.print();}catch(e){}},300);},250);
    setTimeout(()=>{try{window.close();}catch(e){}},2200);
  </script>
</body>
</html>`;

    const printWindow = window.open(
      '',
      '_blank',
      'width=1200,height=900,scrollbars=yes',
    );
    if (!printWindow) {
      alert('Please allow popups for PDF generation');
      setIsPDFLoading?.(false);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.title = docTitle;
    printWindow.document.close();

    setTimeout(() => {
      try {
        printWindow.focus();
      } catch (e) {}
      setTimeout(() => {
        setIsPDFLoading?.(false);
      }, 800);
    }, 600);
  };

  const handleDownloadSelectedSubEventPDF = async () => {
    if (!selectedSubEvent || !wastagesData) return;

    try {
      await dishWastageRef.current?.submit();

      const {data: updatedWastagesData} = await refetch();

      const subEvent = subEvents.find((se) => se.id === selectedSubEvent);
      const wastageSubEvent = updatedWastagesData?.data?.subEvents?.find(
        (wse) => wse.id === selectedSubEvent,
      );

      if (!subEvent || !wastageSubEvent) return;

      const wastageMap = new Map(
        wastageSubEvent?.wastage?.map((w: any) => [w.dishId, w]) || [],
      );

      const dishes =
        subEvent.dishes?.map((dish) => {
          const wastage = wastageMap.get(dish.dish.id);
          const preparationQuantity = dish.dish.quantity ?? dish.quantity ?? 0;
          return {
            categoryname: dish.dish.category.name,
            dishname: dish.dish.name,
            preparationQuantity,
            actual: wastage?.actual ?? 0,
            quantity: wastage?.quantity ?? 0,
            reason: wastage?.reason,
          };
        }) || [];

      const groupedByCategory = dishes.reduce(
        (acc: Record<string, any[]>, dish: any) => {
          const category = dish.categoryname || 'Others';
          if (!acc[category]) acc[category] = [];
          acc[category].push(dish);
          return acc;
        },
        {},
      );

      // SAME HTML + STYLE AS FIRST FUNCTION
      const htmlContent = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Wastage Report</title>
<style>
  ${/* USE EXACT SAME CSS FROM FIRST PDF */ ''}
  :root {
    --blue-1: #0D47A1;
    --blue-2: #1E3A8A;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: #000;
  }

  body.first-page .repeat-title { display: none !important; }

  .container { padding: 28px; }

  .first-header {
    text-align: center;
    border: 1px solid var(--blue-1);
    padding: 8px;
    background: #E3F2FD;
    margin-bottom: 12px;
  }

  .first-header h1 { margin: 0; font-size: 22px; color: var(--blue-1); font-weight: 800; }
  .first-header .divider { background: var(--blue-1); height: 2px; margin: 4px auto; width: 80%; }
  .first-header p { margin: 6px 0 0; font-size: 11px; font-weight: bold; }

  .subevent-info-line {
    display: flex;
    flex-wrap: wrap;
    background: var(--blue-2);
    color: white;
    padding: 6px 2px;
    font-weight: 700;
    font-size: 12px;
    gap: 2px;
  }

  .subevent-info-line > div { flex: 1; min-width: 80px; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-bottom: 12px;
  }

  thead { display: table-header-group; }
  th {
    background: var(--blue-2);
    color: white;
    padding: 6px 8px;
    border: 1px solid #ccc;
    font-weight: 700;
    font-size: 12px;
  }
  td {
    padding: 6px 8px;
    border: 1px solid #ddd;
    font-weight: 700;
    font-size: 12px;
  }
  tr:nth-child(even) { background-color: #f8f8f8; }

  .footer { margin-top: 18px; font-size: 10px; text-align: center; color: #666; }
</style>
</head>

<body class="first-page">

<div class="container">

  <div class="first-header">
    <h1>${user?.fullname || 'Caterer Name'}</h1>
    <div class="divider"></div>
    <p>
      ${user?.address || ''}<br/>
      ${user?.email ? `Email - ${user.email}<br/>` : ''}
      Mob. ${user?.phoneNumber || ''}
    </p>
  </div>

  <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold;">
    <h2 style="margin:0; font-size:16px;">Wastage Report</h2>
    <div style="font-size:11px; margin-top:4px;">
      Event: ${subEventResponse?.data?.name || 'N/A'} |
      Start: ${new Date(subEventResponse?.data?.startDate).toLocaleDateString('en-GB')} |
      End: ${new Date(subEventResponse?.data?.endDate).toLocaleDateString('en-GB')}
    </div>
  </div>

  <!-- SINGE SUB EVENT -->
  <div class="subevent-info-line">
    <div>Name: ${subEvent.name}</div>
    <div>Address: ${subEvent.address}</div>
    <div>Date: ${new Date(subEvent.date).toLocaleDateString('en-GB')}</div>
    <div>Time: ${
      new Date(subEvent.time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) || 'N/A'
    }</div>
    <div>People: ${subEvent.actualPeople || subEvent.expectedPeople || 'N/A'}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Dish</th>
        <th>Preparation Quantity(kg)</th>
        <th>Actual</th>
        <th>Wastage(kg)</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(groupedByCategory)
        .map(([categoryName, categoryDishes]) => {
          const categoryRow = `
      <tr>
        <td colspan="5"
          style="
            background:#E3F2FD;
            font-weight:800;
            color:#0D47A1;
            border:1px solid #ccc;
            padding:6px 8px;
          "> ${categoryName}
        </td>
      </tr>
    `;

          const dishRows = categoryDishes
            .map(
              (d: any, i: number) => `
        <tr style="${i % 2 === 0 ? '' : 'background-color:#f8f8f8;'}">
          <td>${d.dishname}</td>
          <td style="text-align:center">${d.preparationQuantity} kg</td>
          <td style="text-align:center">${d.actual} kg</td>
          <td style="text-align:center">${d.quantity} kg</td>
          <td>${d.reason || 'N/A'}</td>
        </tr>
      `,
            )
            .join('');

          return categoryRow + dishRows;
        })
        .join('')}

    </tbody>
  </table>

  <div class="footer">
    Generated on: ${new Date().toLocaleDateString('en-GB')}
  </div>

</div>

<script>
  setTimeout(()=>{document.body.classList.remove('first-page'); setTimeout(()=>{window.print();},300);},250);
  setTimeout(()=>{window.close();},2000);
</script>

</body>
</html>
`;

      const pdfWindow = window.open('', '_blank', 'width=1200,height=900');
      if (!pdfWindow) return alert('Allow popups to download PDF.');

      pdfWindow.document.open();
      pdfWindow.document.write(htmlContent);
      pdfWindow.document.close();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-transparent">
      {' '}
      <div className="rounded-lg dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between rounded-t-lg bg-blue-900 px-4 py-5 text-white">
          <h2 className="text-gray-800 text-xl font-bold dark:text-white">
            Wastage Report
          </h2>
          <div className="flex items-center">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
            >
              Download All Events Wastage Report
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
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subEvents.map((subEvent) => (
              <>
                {' '}
                <div
                  key={subEvent.id}
                  className={`min-w-[200px] flex-shrink-0 cursor-pointer rounded-lg p-5 transition-all duration-200 dark:bg-meta-4 dark:text-white ${
                    selectedSubEvent === subEvent.id
                      ? 'border-b-2 border-blue-600 bg-blue-50 shadow-sm dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-b border-neutral-500 bg-white'
                  }`}
                  onClick={() => {
                    setSelectedSubEvent((prev) =>
                      prev === subEvent.id ? null : subEvent.id,
                    );
                    setSelectedSubEventName(subEvent.name);
                  }}
                >
                  <div className="flex flex-col">
                    <h2 className="text-gray-800 dark:text-gray-100 truncate text-sm font-medium">
                      {subEvent.name}
                    </h2>
                  </div>
                </div>
              </>
            ))}
          </div>
        )}

        {selectedSubEvent &&
          (() => {
            const selectedEvent = subEvents.find(
              (sub) => sub.id === selectedSubEvent,
            );

            const dishes = selectedEvent?.dishes || [];
            console.log('dishess', dishes);
            return (
              <div className="mt-4 space-y-2">
                {dishes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300">
                    No dishes available.
                  </p>
                ) : (
                  <div key={selectedEvent?.id} className="flex flex-col gap-4">
                    <DishWastage
                      subEvent={selectedEvent}
                      handleDownloadSelectedSubEventPDF={
                        handleDownloadSelectedSubEventPDF
                      }
                      selectedSubEventName={selectedSubEventName}
                    />
                  </div>
                )}
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default WastageReport;
