import React, {useState, useMemo} from 'react';
import {
  FiEye,
  FiDownload,
  FiArrowLeft,
  FiCalendar,
  FiPackage,
} from 'react-icons/fi';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {useAuthContext} from '@/context/AuthContext';
import {format} from 'date-fns';
import toast from 'react-hot-toast';

interface DishItem {
  id: string;
  category: string;
  dishId: string;
  dish: string;
  maharaj?: string;
  quantity: number;
  eventName?: string;
  subeventName?: string[] | string;
  unit?: string;
}

interface TotalDishCountProps {
  data: DishItem[];
  onBack?: () => void;
  onGenerateRawMaterial?: () => void;
  historyItem?: {
    id: string;
    listNo: number;
    from: string;
    to: string;
    caterorId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  fromDate?: string;
  toDate?: string;
  isGeneratingRawMaterial?: boolean;
}

const TotalDishCount: React.FC<TotalDishCountProps> = ({
  data,
  onBack,
  onGenerateRawMaterial,
  historyItem,
  fromDate,
  toDate,
  isGeneratingRawMaterial = false,
}) => {
  // Move useAuthContext to the top level
  const {user} = useAuthContext();

  const originalDishes = data;

  const [dishes, setDishes] = useState<DishItem[]>(() => {
    const dishMap = new Map();

    data.forEach((dish) => {
      const existing = dishMap.get(dish.dishId);

      if (existing) {
        dishMap.set(dish.dishId, {
          ...existing,
          maharaj: Number(existing.maharaj) + Number(dish.maharaj),
          quantity: Number(
            (Number(existing.quantity) + Number(dish.quantity)).toFixed(2),
          ),
        });
      } else {
        dishMap.set(dish.dishId, {
          ...dish,
          subeventName: Array.isArray(dish.subeventName)
            ? dish.subeventName
            : dish.subeventName
              ? [dish.subeventName]
              : [],
          unit: dish.unit || 'pcs',
        });
      }
    });

    return Array.from(dishMap.values());
  });

  const [viewDishes, setViewDishes] = useState<DishItem[]>(
    originalDishes.map((dish) => ({
      ...dish,
      subeventName: Array.isArray(dish.subeventName)
        ? dish.subeventName
        : dish.subeventName
          ? [dish.subeventName]
          : [],
      unit: dish.unit || 'pcs',
    })),
  );

  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);

  const handleView = (mergedRow: DishItem) => {
    const listForThisDish = originalDishes.filter(
      (d) => d.dishId === mergedRow.dishId,
    );

    setSelectedDish(listForThisDish);
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Get display date range
  const displayDateRange = useMemo(() => {
    if (historyItem) {
      return {
        from: historyItem.from,
        to: historyItem.to,
      };
    }
    return {
      from: fromDate,
      to: toDate,
    };
  }, [historyItem, fromDate, toDate]);

  // Group dishes by dish name to get all events and subevents
  const dishEventsMap = useMemo(() => {
    const map: Record<
      string,
      {
        eventName: string;
        subeventNames: {
          name: string;
          quantity: number;
          maharaj: string;
          unit: string;
        }[];
      }[]
    > = {};

    viewDishes?.forEach((dish) => {
      if (!map[dish.dish]) {
        map[dish.dish] = [];
      }

      const subeventNames = Array.isArray(dish.subeventName)
        ? dish.subeventName.map((name) => ({
            name,
            quantity: dish.quantity,
            maharaj: dish.maharaj || 'N/A',
            unit: dish.unit || 'pcs',
          }))
        : dish.subeventName
          ? [
              {
                name: dish.subeventName,
                quantity: dish.quantity,
                maharaj: dish.maharaj || 'N/A',
                unit: dish.unit || 'pcs',
              },
            ]
          : [];

      const existingEvent = map[dish.dish].find(
        (e) => e.eventName === (dish.eventName || 'N/A'),
      );

      if (existingEvent) {
        // Merge subevents, avoiding duplicates
        subeventNames.forEach((newSubevent) => {
          const existingSubevent = existingEvent.subeventNames.find(
            (sub) => sub.name === newSubevent.name,
          );
          if (!existingSubevent) {
            existingEvent.subeventNames.push(newSubevent);
          }
        });
      } else {
        map[dish.dish].push({
          eventName: dish.eventName || 'N/A',
          subeventNames,
        });
      }
    });
    return map;
  }, [viewDishes]);

  const handleExportPDF = async () => {
    if (!dishes || !dishes.length) {
      toast.error('No dishes data available to export');
      return;
    }

    // Group dishes by category
    const groupedDishes: Record<string, DishItem[]> = {};
    dishes.forEach((dish) => {
      const category = dish.category || 'Uncategorized';
      if (!groupedDishes[category]) {
        groupedDishes[category] = [];
      }
      groupedDishes[category].push(dish);
    });

    // Function to split categories into two balanced columns
    function splitCategoriesBalanced(categories: [string, DishItem[]][]) {
      const left: [string, DishItem[]][] = [];
      const right: [string, DishItem[]][] = [];

      let leftCount = 0;
      let rightCount = 0;

      categories.forEach((category) => {
        const rowCount = category[1].length;
        if (leftCount <= rightCount) {
          left.push(category);
          leftCount += rowCount;
        } else {
          right.push(category);
          rightCount += rowCount;
        }
      });

      return [left, right];
    }

    // Create report container - REDUCED PADDING
    const reportContainer = document.createElement('div');
    reportContainer.style.width = '800px';
    reportContainer.style.padding = '10px 15px'; // Reduced from 20px
    reportContainer.style.background = 'white';
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.fontSize = '11px'; // Reduced from 12px
    reportContainer.style.color = 'black';
    reportContainer.style.textAlign = 'center';
    reportContainer.style.boxSizing = 'border-box';

    // Header - REDUCED PADDING
    const headerWrapper = document.createElement('div');
    headerWrapper.style.padding = '4px'; // Reduced from 6px
    headerWrapper.style.border = '1px solid #0D47A1';
    headerWrapper.style.textAlign = 'center';
    headerWrapper.style.color = 'black';
    headerWrapper.style.marginBottom = '8px'; // Added for spacing

    const centerInfo = document.createElement('div');
    centerInfo.innerHTML = `
    <h1 style="margin:0; font-weight:800; font-size:24px; color:black;"> <!-- Reduced from 28px -->
      ${user?.fullname || 'Caterer Name'}
    </h1>
    <div style="background:#0D47A1; height:1px; margin:3px auto; width:80%;"></div> <!-- Reduced -->
    <p style="margin:0; font-size:12px; font-weight:bold; color:black;"> <!-- Reduced from 14px -->
      ${user?.address || ''}<br/>
      ${user?.email ? `Email - ${user?.email}<br/>` : ''}Mobile: ${user?.phoneNumber || ''}
    </p>
  `;
    headerWrapper.appendChild(centerInfo);
    reportContainer.appendChild(headerWrapper);

    // Title - REDUCED MARGINS
    const titleWrapper = document.createElement('div');
    titleWrapper.style.textAlign = 'center';
    titleWrapper.style.marginBottom = '8px'; // Reduced spacing
    titleWrapper.innerHTML = `
    <h2 style="font-size: 16px; font-weight: bold; margin:0; color:black;"> <!-- Reduced from 18px -->
      Total Dish Count Report ${historyItem ? ` - List #${historyItem.listNo}` : ''}
    </h2>
    <div style="margin-bottom: 5px; color:black; font-size: 11px;"> <!-- Reduced -->
      <span style="display: inline-block; margin: 0 4px; color:black;"> <!-- Reduced margin -->
        <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
      </span>
      <span style="display: inline-block; margin: 0 4px; color:black;"> <!-- Reduced margin -->
        <strong>Time:</strong> ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
      </span>
      ${
        historyItem
          ? `
            <span style="display: inline-block; margin: 0 4px; color:black;">
              <strong>From:</strong> ${formatDisplayDate(historyItem.from)}
            </span>
            <span style="display: inline-block; margin: 0 4px; color:black;">
              <strong>To:</strong> ${formatDisplayDate(historyItem.to)}
            </span>
          `
          : fromDate && toDate
            ? `
              <span style="display: inline-block; margin: 0 4px; color:black;">
                <strong>From:</strong> ${formatDisplayDate(fromDate)}
              </span>
              <span style="display: inline-block; margin: 0 4px; color:black;">
                <strong>To:</strong> ${formatDisplayDate(toDate)}
              </span>
            `
            : ''
      }
    </div>
  `;
    reportContainer.appendChild(titleWrapper);

    // Two-column layout - REDUCED MARGINS AND GAPS
    const allCategoryEntries = Object.entries(groupedDishes);
    const [leftCategories, rightCategories] =
      splitCategoriesBalanced(allCategoryEntries);

    const rowContainer = document.createElement('div');
    rowContainer.style.display = 'flex';
    rowContainer.style.justifyContent = 'space-between';
    rowContainer.style.gap = '8px'; // Reduced from 10px
    rowContainer.style.marginBottom = '10px'; // Added spacing

    const createCategoryTable = (entries: [string, DishItem[]]) => {
      const [categoryName, categoryDishes] = entries;
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '8px'; // Reduced from 10px

      const title = document.createElement('h3');
      title.innerText = categoryName;
      title.style.textAlign = 'left';
      title.style.marginBottom = '4px'; // Reduced from 6px
      title.style.fontSize = '13px'; // Reduced from 15px
      title.style.fontWeight = 'bold';
      wrapper.appendChild(title);

      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '10px'; // Reduced from 11px
      table.style.backgroundColor = 'white';
      table.style.verticalAlign = 'middle';

      // Table header - REDUCED PADDING
      const headerRow = table.insertRow();
      ['Sr.', 'Dish Name', 'People', 'Quantity', 'Unit'].forEach((text) => {
        const th = document.createElement('th');
        th.innerText = text;
        th.style.border = '1px solid #ccc';
        th.style.padding = '4px 6px'; // Reduced from 6px 8px
        th.style.backgroundColor = '#1E3A8A';
        th.style.color = 'white';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
        th.style.fontWeight = 'bold';
        th.style.fontSize = '10.5px'; // Reduced
        th.style.lineHeight = '1.2';
        th.style.whiteSpace = 'nowrap';
        th.style.display = 'table-cell';
        th.style.boxSizing = 'border-box';
        headerRow.appendChild(th);
      });

      // Table rows - REDUCED PADDING
      categoryDishes.forEach((dish, index) => {
        const row = table.insertRow();
        row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f8f8';
        row.style.verticalAlign = 'middle';

        const cells = [
          index + 1,
          dish.dish,
          dish.maharaj || '—',
          dish.quantity.toString(),
          dish.unit || 'pcs',
        ];

        cells.forEach((val, cellIndex) => {
          const cell = row.insertCell();
          cell.innerText = String(val);
          cell.style.border = '1px solid #ddd';
          cell.style.font = '11px Arial, sans-serif'; // Reduced
          cell.style.padding = '4px 6px'; // Reduced from 6px 8px
          cell.style.textAlign =
            cellIndex === 0 ||
            cellIndex === 2 ||
            cellIndex === 3 ||
            cellIndex === 4
              ? 'center'
              : 'left';
          cell.style.verticalAlign = 'middle';
          cell.style.color = 'black';
          cell.style.fontSize = '11px'; // Reduced from 12px
          cell.style.fontWeight = 'bold';
        });
      });

      wrapper.appendChild(table);
      return wrapper;
    };

    const leftCol = document.createElement('div');
    leftCol.style.width = '49%';
    leftCategories.forEach((entry) => {
      leftCol.appendChild(createCategoryTable(entry));
    });

    const rightCol = document.createElement('div');
    rightCol.style.width = '49%';
    rightCategories.forEach((entry) => {
      rightCol.appendChild(createCategoryTable(entry));
    });

    rowContainer.appendChild(leftCol);
    rowContainer.appendChild(rightCol);
    reportContainer.appendChild(rowContainer);

    // Statistics section - MORE COMPACT
    const totalQuantity = dishes.reduce((sum, dish) => sum + dish.quantity, 0);
    const uniqueDishes = new Set(dishes.map((dish) => dish.dish)).size;

    const statsSection = document.createElement('div');
    statsSection.style.margin = '8px 0'; // Reduced from 20px
    statsSection.style.textAlign = 'center';
    statsSection.style.fontSize = '11px'; // Added font size
    statsSection.innerHTML = `
    <div style="display: inline-block; margin: 0 8px; padding: 4px 8px; background: #f0f7ff; border-radius: 3px;">
      <strong style="color: #1E3A8A;">Total Dishes:</strong> 
      <span style="font-weight: bold; color: black; margin-left: 3px;">${uniqueDishes}</span>
    </div>
    <div style="display: inline-block; margin: 0 8px; padding: 4px 8px; background: #f0f7ff; border-radius: 3px;">
      <strong style="color: #1E3A8A;">Total Quantity:</strong> 
      <span style="font-weight: bold; color: black; margin-left: 3px;">${totalQuantity}</span>
    </div>
    <div style="display: inline-block; margin: 0 8px; padding: 4px 8px; background: #f0f7ff; border-radius: 3px;">
      <strong style="color: #1E3A8A;">Items Listed:</strong> 
      <span style="font-weight: bold; color: black; margin-left: 3px;">${dishes.length}</span>
    </div>
  `;
    reportContainer.appendChild(statsSection);

    // Footer - REDUCED PADDING
    const footer = document.createElement('div');
    footer.style.marginTop = '10px'; // Reduced from 20px
    footer.style.color = 'black';
    footer.style.fontSize = '12px'; // Reduced from 14px

    const signatureLine = document.createElement('div');
    signatureLine.style.marginTop = '15px'; // Reduced from 30px
    signatureLine.style.borderTop = '1px solid #0D47A1';
    signatureLine.style.paddingTop = '8px'; // Reduced from 15px
    signatureLine.innerHTML = `Signature: _________________________________________________`;
    footer.appendChild(signatureLine);
    reportContainer.appendChild(footer);

    // Create a new window for printing - REDUCED PADDING
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Please allow popups for printing');
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dish Count Report</title>
        <style>
          body { 
            margin: 0; 
            padding: 10px; /* Reduced from 20px */
            font-family: Arial, sans-serif; 
            color: black;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            display: flex;
            justify-content: center;
          }
          .report-content {
            width: 800px;
            padding: 10px; /* Reduced from 20px */
            background: white;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 5px; /* Reduced from 0 */
            }
            .page-break {
              page-break-after: always;
            }
            table {
              page-break-inside: avoid;
            }
            h3 {
              page-break-after: avoid;
            }
          }
          @page {
            margin: 10mm; /* Reduced from 15mm */
          }
        </style>
      </head>
      <body>
        <div class="report-content">
          ${reportContainer.innerHTML}
        </div>
        <script>
          window.onload = function() {
            // Add page breaks for better printing
            const tables = document.querySelectorAll('table');
            tables.forEach((table, index) => {
              if (index > 0 && index % 10 === 0) { // Adjusted for more compact layout
                const pageBreak = document.createElement('div');
                pageBreak.className = 'page-break';
                table.parentNode.insertBefore(pageBreak, table);
              }
            });
            
            // Auto print after a short delay
            setTimeout(function() {
              window.print();
            }, 300); // Reduced from 500ms
            
            // Close window after print dialog is closed
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 100);
            };
          }
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const columns: Column<DishItem>[] = [
    {
      header: 'Category',
      accessor: 'category',
      className: 'font-medium text-gray-900 dark:text-white',
      sortable: true,
    },
    {
      header: 'Dish Name',
      accessor: 'dish',
      className: 'font-medium text-gray-900 dark:text-white',
      sortable: true,
    },
    {
      header: 'People',
      accessor: 'maharaj',
      sortable: true,
      render: (item) => (
        <span className="text-gray-600 dark:text-gray-400">
          {item.maharaj || '—'}
        </span>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (item) => (
        <span className="text-gray-600 dark:text-gray-400">
          {item.quantity}
        </span>
      ),
    },
    {
      header: 'Unit',
      accessor: 'unit',
      sortable: true,
      render: (item) => (
        <span className="text-gray-600 dark:text-gray-400">
          {item.unit || 'pcs'}
        </span>
      ),
    },
  ];

  const totalQuantity = useMemo(() => {
    return dishes.reduce((sum, dish) => sum + dish.quantity, 0);
  }, [dishes]);

  const uniqueDishes = useMemo(() => {
    return new Set(dishes.map((dish) => dish.dish)).size;
  }, [dishes]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
              >
                <FiArrowLeft className="text-gray-600 dark:text-gray-400 h-5 w-5" />
              </button>
            )}
            <h2 className="text-gray-900 text-2xl font-bold dark:text-white">
              Dish Count Results{' '}
              {historyItem ? `(List #${historyItem.listNo})` : ''}
            </h2>
          </div>

          {/* Date Range Display */}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
              <FiCalendar className="h-4 w-4" />
              <span className="font-medium">Date Range:</span>
              <span>
                {formatDisplayDate(displayDateRange.from)} -{' '}
                {formatDisplayDate(displayDateRange.to)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end sm:justify-start">
          <button
            onClick={handleExportPDF}
            className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
          >
            <FiDownload className="h-5 w-5" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <GenericTable
        data={dishes}
        columns={columns}
        itemsPerPage={10}
        searchAble={true}
        title="Dish Count Details"
        action={true}
        onView={(item) => setSelectedDish(item)}
        paginationOff={false}
      />

      {/* Detail Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="dark:bg-gray-800 relative flex max-h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-2xl">
            {/* Header with Close Button */}
            <div className="dark:border-gray-700 flex flex-shrink-0 items-center justify-between border-b bg-white px-3 py-2 dark:bg-meta-4 dark:text-white sm:px-4 sm:py-3">
              <div className="min-w-0">
                <h3 className="text-gray-900 truncate text-sm font-semibold dark:text-white sm:text-lg">
                  {selectedDish.dish}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 truncate text-xs sm:text-sm">
                  Category: {selectedDish.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedDish(null)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 ml-2 flex-shrink-0 rounded-full p-1 sm:p-2"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 dark:text-gray-400 h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 dark:bg-black sm:p-4">
                {/* Events & Subevents Distribution */}
                <div>
                  {dishEventsMap[selectedDish.dish]?.length > 0 ? (
                    <div className="space-y-3">
                      {dishEventsMap[selectedDish.dish].map(
                        (event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="dark:border-strokeblack overflow-hidden rounded border border-stroke"
                          >
                            {/* Event Header */}
                            <div className="bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h5 className="text-gray-900 truncate text-sm font-medium dark:text-white">
                                  Event: {event.eventName}
                                </h5>
                                <span className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs sm:mt-0">
                                  {event.subeventNames.length} subevents
                                </span>
                              </div>
                            </div>

                            {/* Subevents Table using GenericTable */}
                            <div className="p-1 sm:p-2">
                              <GenericTable
                                data={event.subeventNames.map(
                                  (subevent, index) => ({
                                    id: `${eventIndex}-${index}`,
                                    name: subevent.name,
                                    quantity: subevent.quantity,
                                    maharaj: subevent.maharaj,
                                    unit: subevent.unit,
                                  }),
                                )}
                                columns={[
                                  {
                                    header: 'Subevent Name',
                                    accessor: 'name',
                                    className: 'font-medium',
                                  },
                                  {
                                    header: 'Quantity',
                                    accessor: 'quantity',
                                    sortable: true,
                                    render: (item) => (
                                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {item.quantity}
                                      </span>
                                    ),
                                  },
                                  {
                                    header: 'People',
                                    accessor: 'maharaj',
                                    render: (item) => (
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {item.maharaj}
                                      </span>
                                    ),
                                  },
                                  {
                                    header: 'Unit',
                                    accessor: 'unit',
                                    render: (item) => (
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {item.unit}
                                      </span>
                                    ),
                                  },
                                ]}
                                itemsPerPage={5}
                                action={false}
                                paginationOff={false}
                                title=""
                                searchAble={event.subeventNames.length > 5}
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700 rounded border p-6 text-center">
                      <svg
                        className="text-gray-400 mx-auto h-8 w-8 sm:h-12 sm:w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        No events or subevents found for this dish.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-end">
        {onGenerateRawMaterial && (
          <button
            onClick={onGenerateRawMaterial}
            disabled={isGeneratingRawMaterial}
            className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGeneratingRawMaterial ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>Save</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TotalDishCount;
