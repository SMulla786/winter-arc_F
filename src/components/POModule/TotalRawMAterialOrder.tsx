/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {format} from 'date-fns';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiFilter,
  FiDownload,
  FiSearch,
  FiClock,
} from 'react-icons/fi';
import {FaAngleDown, FaAngleRight} from 'react-icons/fa';
import {useGetRawMaterialsByDate} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {z} from 'zod';
import {
  useGetAllEventsWithSubEvents,
  useGetRawMaterialHistory,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  useGetNewRawMaterialsFroSubevent,
  useDeleteAddedRawmaterialForSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import ExtraRawmaterialOrder from '../Event/subEvent/ExtraRawMatrialOrder';
import {Store} from 'lucide-react';

const addDishListSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  subeventIds: z.string().array(),
});

type AddRawMaterialSchema = z.infer<typeof addDishListSchema>;

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  inventory?: number;
  maharaj?: string;
  subEvent?: string;
  category: string;
}

interface ExtraRawMaterial {
  id: string;
  rawMaterialId: string;
  quantity: number;
  eventId: string;
  rawMaterial: {
    id: string;
    name: string;
    unit: string;
    categoryId: string;
    languageId: string;
    caterorId: string;
    inventory: number;
    amount: number;
  };
}

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  subEvents: SubEvent[];
}

interface SubEvent {
  id: string;
  name: string;
}

interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'events' | 'raw-materials' | 'history';

const TotalRawMaterialOrder: React.FC = () => {
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<ViewMode>('events');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedEvents, setSelectedEvents] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedSubEvents, setSelectedSubEvents] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: false,
    subEvent: false,
    maharaj: false,
  });
  const [selectedColumns, setSelectedColumns] = useState({
    inventory: true,
    totalQuantity: true,
    orderQuantity: true,
  });
  const [initialOrderQuantity, setInitialOrderQuantity] = useState<{
    [key: string]: number;
  }>({});
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);

  // API hooks
  const {
    mutate: fetchRawMaterials,
    data: apiData,
    isLoading,
    isSuccess,
    isError,
  } = useGetRawMaterialsByDate();

  const {data: eventsData, isLoading: isEventsLoading} =
    useGetAllEventsWithSubEvents();
  console.log('eventdataaaaaaaa', eventsData);

  // History hook
  const {
    data: rawMaterialHistory,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useGetRawMaterialHistory();

  // For extra raw materials
  const selectedSubEventIds = useMemo(
    () => Object.keys(selectedSubEvents).filter((id) => selectedSubEvents[id]),
    [selectedSubEvents],
  );
  const {
    data: extraAddedRawMaterials,
    refetch: refetchExtraRawMaterials,
    isLoading: isLoadingExtraMaterials,
  } = useGetNewRawMaterialsFroSubevent(selectedSubEventIds[0] || '');
  console.log('====================================');
  console.log('extraAddedRawMaterials', extraAddedRawMaterials);
  console.log('====================================');
  const {mutateAsync: deleteRawMaterialForSubevent} =
    useDeleteAddedRawmaterialForSubevent();

  // Process events data
  const eventsArray = useMemo(() => {
    if (!eventsData?.data) return [];
    return eventsData.data.map((ev) => ({
      ...ev,
      subEvents: ev.subEvents || [],
    }));
  }, [eventsData]);

  // Process history data
  const historyData = useMemo(() => {
    if (!rawMaterialHistory?.data) return [];
    return rawMaterialHistory.data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      listNo: item.listNo || 0,
      from: item.from,
      to: item.to,
      caterorId: item.caterorId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }, [rawMaterialHistory]);

  // Initialize event and sub-event selections
  useEffect(() => {
    if (!eventsArray.length) return;
    const eventSelection: Record<string, boolean> = {};
    const subEventSelection: Record<string, boolean> = {};
    eventsArray.forEach((event) => {
      eventSelection[event.id] = true;
      event.subEvents?.forEach((sub) => (subEventSelection[sub.id] = true));
    });
    setSelectedEvents(eventSelection);
    setSelectedSubEvents(subEventSelection);
  }, [eventsArray]);

  // Process raw materials data
  // Update the rawMaterialData processing
  const rawMaterialData = useMemo(() => {
    if (!isSuccess || !apiData) return [];
    const materials = Array.isArray(apiData?.data)
      ? apiData.data
      : Array.isArray(apiData?.rawMaterials)
        ? apiData.rawMaterials
        : [];
    return materials.map((item: any) => ({
      id: item.rawmaterialId || Math.random().toString(),
      name: item.rawmaterialName || 'Unknown',
      unit: item.unit || 'kg',
      quantity: item.quantity || 0,
      inventory: item.inventory || 0,
      store: item.store || 'Main Store', // Ensure this is set
      maharaj: item.maharaj || 'Unknown Maharaj',
      subEvent: item.subEvent || item.subeventName || 'Unknown Sub-Event',
      category: item.category || 'Uncategorized',
    }));
  }, [apiData, isSuccess]);

  // Merge extra raw materials
  const mergedMaterials = useMemo(() => {
    if (!extraAddedRawMaterials?.data) return [];
    const merged: Record<string, ExtraRawMaterial> = {};
    extraAddedRawMaterials.data.forEach((item: ExtraRawMaterial) => {
      const key = item.rawMaterialId;
      if (merged[key]) {
        merged[key].quantity += item.quantity;
      } else {
        merged[key] = {...item};
      }
    });
    return Object.values(merged);
  }, [extraAddedRawMaterials]);

  // Initialize order quantities for extra materials
  useEffect(() => {
    if (mergedMaterials.length > 0) {
      const initialOrderQuantityUpdate: {[key: string]: number} = {};
      mergedMaterials.forEach((item) => {
        if (item.id) {
          initialOrderQuantityUpdate[item.id] = item.quantity || 0;
        }
      });
      setInitialOrderQuantity((prev) => ({
        ...prev,
        ...initialOrderQuantityUpdate,
      }));
    }
  }, [mergedMaterials]);

  // Filter events by date range
  const filteredEvents = useMemo(() => {
    if (!fromDate || !toDate) return eventsArray;
    const from = new Date(fromDate + 'T00:00:00Z');
    const to = new Date(toDate + 'T23:59:59Z');
    return eventsArray.filter((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return end >= from && start <= to;
    });
  }, [eventsArray, fromDate, toDate]);

  // Filter selected events and sub-events
  const filteredData = useMemo(() => {
    return filteredEvents
      .map((event) => {
        const isEventSelected = selectedEvents[event.id];
        const selectedSubs = (event.subEvents || []).filter(
          (sub) => selectedSubEvents[sub.id],
        );
        return {
          ...event,
          selected: isEventSelected,
          subEvents: selectedSubs,
        };
      })
      .filter((event) => event.selected || event.subEvents.length > 0);
  }, [filteredEvents, selectedEvents, selectedSubEvents]);

  const selectedSubEventsCount = useMemo(() => {
    return Object.values(selectedSubEvents).filter(Boolean).length;
  }, [selectedSubEvents]);

  // Toggle event accordion
  const toggleAccordion = (eventId: string) => {
    setExpandedEvents((prev) => ({...prev, [eventId]: !prev[eventId]}));
  };

  // Toggle event selection
  const toggleEventCheckbox = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvents((prev) => {
      const newVal = !prev[eventId];
      const event = eventsArray.find((ev) => ev.id === eventId);
      if (event) {
        setSelectedSubEvents((prevSub) => {
          const updated = {...prevSub};
          event.subEvents?.forEach((sub) => (updated[sub.id] = newVal));
          return updated;
        });
      }
      return {...prev, [eventId]: newVal};
    });
  };

  // Toggle sub-event selection
  const toggleSubEvent = (subId: string) => {
    setSelectedSubEvents((prev) => ({...prev, [subId]: !prev[subId]}));
  };

  const handleGenerateReport = () => {
    if (!filteredData.length) {
      toast.error('Please select at least one event or sub-event');
      return;
    }

    const subeventIds = filteredData.flatMap((event) =>
      event.subEvents.map((sub) => sub.id),
    );

    try {
      const requestData: AddRawMaterialSchema = {
        from: fromDate,
        to: toDate,
        subeventIds,
      };

      fetchRawMaterials(requestData, {
        onSuccess: () => {
          setViewMode('raw-materials');
          toast.success('Report generated successfully!');
        },
        onError: (err) => {
          console.error('API Error:', err);
          toast.error('Failed to generate report');
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          'Validation Error: ' + err.errors.map((e) => e.message).join(', '),
        );
      } else {
        console.error(err);
        toast.error('An unexpected error occurred');
      }
    }
  };
  // Add this function in your TotalDishAndRawMaterial component
  const handleViewHistory = (historyItem: HistoryItem) => {
    setSelectedHistoryItem(historyItem);
    setFromDate(historyItem.from);
    setToDate(historyItem.to);

    if (historyItem.type === 'raw-material') {
      // For raw material history, navigate to raw materials tab
      setViewMode('raw-materials');

      // Generate the raw material report with the history data
      const subeventIds = filteredData.flatMap((event) =>
        event.subEvents.map((sub) => sub.id),
      );

      try {
        const requestData: AddListSchema = {
          from: historyItem.from,
          to: historyItem.to,
          subeventIds,
        };

        fetchRawMaterials(requestData, {
          onSuccess: () => {
            toast.success(
              `Raw material list #${historyItem.listNo} loaded successfully!`,
            );
          },
          onError: (err) => {
            console.error('API Error:', err);
            toast.error(
              `Failed to load raw material list #${historyItem.listNo}`,
            );
          },
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast.error(
            'Validation Error: ' + err.errors.map((e) => e.message).join(', '),
          );
        } else {
          console.error(err);
          toast.error('An unexpected error occurred');
        }
      }
    } else {
      // For dish count history, navigate to dish results tab
      setViewMode('dish-results');

      // Your existing dish count loading logic
      const subeventIds = filteredData.flatMap((event) =>
        event.subEvents.map((sub) => sub.id),
      );

      try {
        const validatedData = addListSchema.parse({
          from: historyItem.from,
          to: historyItem.to,
          subeventIds,
        });

        submitDishCount(validatedData, {
          onSuccess: (responseData) => {
            toast.success(
              `Dish count list #${historyItem.listNo} loaded successfully!`,
            );
            const rawData = responseData?.data || responseData || [];
            const formattedData = rawData.map((item: any) => ({
              id: item.id || Math.random().toString(),
              category: item.category || '-',
              dish: item.dishName,
              maharaj: item.preparation?.toString() || '-',
              quantity: item.quantity || 0,
              eventName: item.eventName || 'N/A',
              subeventName: item.subeventName || 'N/A',
            }));
            setDishData(formattedData);
          },
          onError: (err) => {
            console.error(err);
            toast.error(`Error loading dish count list #${historyItem.listNo}`);
          },
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast.error(
            'Validation Error: ' + err.errors.map((e) => e.message).join(', '),
          );
        } else {
          console.error(err);
          toast.error('An unexpected error occurred');
        }
      }
    }
  };
  const handleBackToEvents = () => {
    setViewMode('events');
    setSelectedHistoryItem(null);
  };

  const handleLoadHistory = (historyItem: HistoryItem) => {
    setSelectedHistoryItem(historyItem);
    setFromDate(historyItem.from);
    setToDate(historyItem.to);
    setViewMode('raw-materials');
    toast.success(`Loading raw material list #${historyItem.listNo}`);
  };

  const handleQuantityChange = (id: string, value: string) => {
    setInitialOrderQuantity((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleDeleteExtraMaterial = async (id: string) => {
    try {
      await deleteRawMaterialForSubevent(id);
      refetchExtraRawMaterials();
      toast.success('Extra raw material deleted successfully!');
    } catch (err) {
      console.error('Error deleting extra raw material:', err);
      toast.error('Failed to delete extra raw material');
    }
  };

  const filteredRawMaterials = useMemo(() => {
    let filtered = rawMaterialData;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [rawMaterialData, searchQuery]);

  const groupedData = useMemo(() => {
    let grouped: any = {};
    if (filters.category && filters.subEvent && filters.maharaj) {
      const categorySubEventMaharajGroup: {
        [category: string]: {
          [subEvent: string]: {[maharaj: string]: RawMaterial[]};
        };
      } = {};
      filteredRawMaterials.forEach((item: RawMaterial) => {
        const category = item.category || 'Uncategorized';
        const subEvent = item.subEvent || 'Unknown';
        const maharaj = item.maharaj || 'Unknown';
        if (!categorySubEventMaharajGroup[category])
          categorySubEventMaharajGroup[category] = {};
        if (!categorySubEventMaharajGroup[category][subEvent])
          categorySubEventMaharajGroup[category][subEvent] = {};
        if (!categorySubEventMaharajGroup[category][subEvent][maharaj])
          categorySubEventMaharajGroup[category][subEvent][maharaj] = [];
        categorySubEventMaharajGroup[category][subEvent][maharaj].push(item);
      });
      grouped = categorySubEventMaharajGroup;
    } else if (filters.category && filters.subEvent) {
      const categorySubEventGroup: {
        [category: string]: {[subEvent: string]: RawMaterial[]};
      } = {};
      filteredRawMaterials.forEach((item: RawMaterial) => {
        const category = item.category || 'Uncategorized';
        const subEvent = item.subEvent || 'Unknown';
        if (!categorySubEventGroup[category])
          categorySubEventGroup[category] = {};
        if (!categorySubEventGroup[category][subEvent])
          categorySubEventGroup[category][subEvent] = [];
        categorySubEventGroup[category][subEvent].push(item);
      });
      grouped = categorySubEventGroup;
    } else if (filters.category && filters.maharaj) {
      const categoryMaharajGroup: {
        [category: string]: {[maharaj: string]: RawMaterial[]};
      } = {};
      filteredRawMaterials.forEach((item: RawMaterial) => {
        const category = item.category || 'Uncategorized';
        const maharaj = item.maharaj || 'Unknown';
        if (!categoryMaharajGroup[category])
          categoryMaharajGroup[category] = {};
        if (!categoryMaharajGroup[category][maharaj])
          categoryMaharajGroup[category][maharaj] = [];
        categoryMaharajGroup[category][maharaj].push(item);
      });
      grouped = categoryMaharajGroup;
    } else if (filters.subEvent && filters.maharaj) {
      const subEventMaharajGroup: {
        [subEvent: string]: {[maharaj: string]: RawMaterial[]};
      } = {};
      filteredRawMaterials.forEach((item: RawMaterial) => {
        const subEvent = item.subEvent || 'Unknown';
        const maharaj = item.maharaj || 'Unknown';
        if (!subEventMaharajGroup[subEvent])
          subEventMaharajGroup[subEvent] = {};
        if (!subEventMaharajGroup[subEvent][maharaj])
          subEventMaharajGroup[subEvent][maharaj] = [];
        subEventMaharajGroup[subEvent][maharaj].push(item);
      });
      grouped = subEventMaharajGroup;
    } else if (filters.category) {
      const categoryGroup: {[category: string]: RawMaterial[]} = {};
      filteredRawMaterials.forEach((item) => {
        const category = item.category || 'Uncategorized';
        if (!categoryGroup[category]) categoryGroup[category] = [];
        categoryGroup[category].push(item);
      });
      grouped = categoryGroup;
    } else if (filters.subEvent) {
      const subEventGroup: {[subEvent: string]: RawMaterial[]} = {};
      filteredRawMaterials.forEach((item) => {
        const subEvent = item.subEvent || 'Unknown';
        if (!subEventGroup[subEvent]) subEventGroup[subEvent] = [];
        subEventGroup[subEvent].push(item);
      });
      grouped = subEventGroup;
    } else if (filters.maharaj) {
      const maharajGroup: {[maharaj: string]: RawMaterial[]} = {};
      filteredRawMaterials.forEach((item) => {
        const maharaj = item.maharaj || 'Unknown';
        if (!maharajGroup[maharaj]) maharajGroup[maharaj] = [];
        maharajGroup[maharaj].push(item);
      });
      grouped = maharajGroup;
    } else {
      grouped = {'All Materials': filteredRawMaterials};
    }
    return grouped;
  }, [filteredRawMaterials, filters]);

  const toggleExpand = (keyPath: string) => {
    setExpanded((prev) => ({...prev, [keyPath]: !prev[keyPath]}));
  };

  const toggleColumnSelection = (column: keyof typeof selectedColumns) => {
    setSelectedColumns((prev) => ({...prev, [column]: !prev[column]}));
  };

  const renderRows = (
    data: any,
    keyPath: string = '',
    depth: number = 0,
  ): JSX.Element[] => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <tr
          key={`${keyPath}-${index}`}
          className="border-b border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
        >
          <td className="text-gray-900 px-4 py-3 text-sm font-medium dark:text-white">
            {item.name}
          </td>
          <td className="text-gray-600 dark:text-gray-300 px-4 py-3 text-sm">
            {item.category}
          </td>
          <td className="text-gray-600 dark:text-gray-300 px-4 py-3 text-sm">
            {item.quantity} {item.unit}
          </td>
          <td className="text-gray-600 dark:text-gray-300 px-4 py-3 text-sm">
            {item.inventory || 0} {item.unit}
          </td>
          <td className="text-gray-600 dark:text-gray-300 px-4 py-3 text-sm">
            {' '}
            {item.quantity - item.inventory}
          </td>
        </tr>
      ));
    } else {
      const rows: JSX.Element[] = [];
      Object.keys(data).forEach((groupKey) => {
        const currentPath = keyPath ? `${keyPath}-${groupKey}` : groupKey;
        const isExpanded = expanded[currentPath] !== false;
        rows.push(
          <tr
            key={currentPath}
            className="bg-gray-50 dark:bg-gray-700 cursor-pointer"
            onClick={() => toggleExpand(currentPath)}
          >
            <td
              colSpan={4}
              className="px-4 py-4 font-bold text-black dark:text-white"
              style={{paddingLeft: `${depth * 1 + 1}rem`}}
            >
              <div className="flex items-center">
                <span className="mr-2">
                  {isExpanded ? <FaAngleDown /> : <FaAngleRight />}
                </span>
                <span>{groupKey}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                  (
                  {Array.isArray(data[groupKey])
                    ? data[groupKey].length
                    : Object.keys(data[groupKey]).length}{' '}
                  items)
                </span>
              </div>
            </td>
          </tr>,
        );
        if (isExpanded) {
          rows.push(...renderRows(data[groupKey], currentPath, depth + 1));
        }
      });
      return rows;
    }
  };

  const handleExportPDF = async () => {
    if (!filteredRawMaterials.length && !mergedMaterials.length) {
      toast.error('No raw materials to export');
      return;
    }

    try {
      // Create a hidden container that's not attached to DOM
      const reportContainer = document.createElement('div');
      reportContainer.style.width = '800px';
      reportContainer.style.padding = '20px';
      reportContainer.style.background = 'white';
      reportContainer.style.fontFamily = 'Arial, sans-serif';
      reportContainer.style.fontSize = '12px';
      reportContainer.style.color = 'black';
      reportContainer.style.textAlign = 'center';
      reportContainer.style.boxSizing = 'border-box';
      reportContainer.style.position = 'fixed';
      reportContainer.style.left = '-9999px'; // Move off-screen
      reportContainer.style.top = '-9999px'; // Move off-screen
      reportContainer.style.zIndex = '-9999'; // Hide behind everything
      reportContainer.style.opacity = '0'; // Make invisible
      reportContainer.style.pointerEvents = 'none'; // Disable interactions

      const titleWrapper = document.createElement('div');
      titleWrapper.style.marginTop = '5px';
      titleWrapper.style.textAlign = 'center';
      titleWrapper.innerHTML = `
        <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: black;">
          Total Raw Material Order Report
        </h2>
        <div style="margin-bottom: 10px; color: black;">
          <span style="display: inline-block; margin: 0 8px;">
            <strong>From:</strong> ${format(new Date(fromDate), 'MMM dd, yyyy')}
          </span>
          <span style="display: inline-block; margin: 0 8px;">
            <strong>To:</strong> ${format(new Date(toDate), 'MMM dd, yyyy')}
          </span>
          <span style="display: inline-block; margin: 0 8px;">
            <strong>Time:</strong> ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
          </span>
        </div>
      `;
      reportContainer.appendChild(titleWrapper);

      const renderSectionTableTwoColumn = (
        data: any,
        groupKey: string = '',
        depth: number = 0,
        isExtra: boolean = false,
      ) => {
        if (!data) return;

        if (Array.isArray(data)) {
          if (data.length === 0) return;

          const table = document.createElement('table');
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.fontSize = '11px';
          table.style.backgroundColor = 'white';
          table.style.verticalAlign = 'middle';
          table.style.marginBottom = '15px';

          if (groupKey) {
            const groupRow = table.insertRow();
            const groupCell = groupRow.insertCell();
            groupCell.colSpan = isExtra ? 7 : 9;
            groupCell.style.padding = '8px';
            groupCell.style.backgroundColor = '#e5e7eb';
            groupCell.style.fontWeight = 'bold';
            groupCell.style.textAlign = 'left';
            groupCell.style.fontSize = '12px';
            groupCell.innerText = groupKey;
          }

          const headers = isExtra
            ? ['Category', 'Material Name', 'Total Qty', 'Order Qty']
            : ['Category', 'Material Name', 'Quantity', 'Store', 'PO'];
          const colCount = headers.length;

          const headerRow = table.insertRow();
          headers.forEach((text) => {
            const th = document.createElement('th');
            th.innerText = text;
            th.style.border = '1px solid #ccc';
            th.style.padding = '6px 8px';
            th.style.backgroundColor = '#1E3A8A';
            th.style.color = 'white';
            th.style.textAlign = 'center';
            th.style.verticalAlign = 'middle';
            th.style.fontWeight = 'bold';
            headerRow.appendChild(th);
          });

          const spacerTh = document.createElement('th');
          spacerTh.style.width = '16px';
          spacerTh.style.border = 'none';
          headerRow.appendChild(spacerTh);

          headers.forEach((text) => {
            const th = document.createElement('th');
            th.innerText = text;
            th.style.border = '1px solid #ccc';
            th.style.padding = '6px 8px';
            th.style.backgroundColor = '#1E3A8A';
            th.style.color = 'white';
            th.style.textAlign = 'center';
            th.style.verticalAlign = 'middle';
            th.style.fontWeight = 'bold';
            headerRow.appendChild(th);
          });

          for (let i = 0; i < data.length; i += 2) {
            const row = table.insertRow();
            row.style.backgroundColor = i % 4 === 0 ? '#ffffff' : '#f8f8f8';
            row.style.verticalAlign = 'middle';

            const insertItemCells = (
              item: RawMaterial | ExtraRawMaterial | null,
            ) => {
              if (!item) {
                for (let c = 0; c < colCount; c++) {
                  const cell = row.insertCell();
                  cell.innerText = '';
                  cell.style.border = '1px solid #ddd';
                  cell.style.padding = '6px 8px';
                }
                return;
              }

              const name = isExtra
                ? (item as ExtraRawMaterial).rawMaterial.name
                : (item as RawMaterial).name;
              const unit = isExtra
                ? (item as ExtraRawMaterial).rawMaterial.unit
                : (item as RawMaterial).unit;
              const category = isExtra
                ? (item as ExtraRawMaterial).rawMaterial.categoryId
                : (item as RawMaterial).category || 'Uncategorized';
              const quantity = Number(
                (item as ExtraRawMaterial).quantity ||
                  (item as RawMaterial).quantity ||
                  0,
              ).toFixed(Number(item.quantity) % 1 === 0 ? 0 : 1);
              const orderQuantity = isExtra
                ? Number(initialOrderQuantity[item.id] || quantity).toFixed(
                    Number(item.quantity) % 1 === 0 ? 0 : 1,
                  )
                : '';

              for (const headerText of headers) {
                const cell = row.insertCell();
                cell.style.border = '1px solid #ddd';
                cell.style.whiteSpace = 'nowrap';
                cell.style.textAlign = 'center';
                cell.style.verticalAlign = 'middle';
                cell.style.color = 'black';
                cell.style.fontSize = '12px';

                if (headerText.includes('Category')) {
                  cell.innerText = category;
                  cell.style.textAlign = 'left';
                } else if (headerText.includes('Material Name')) {
                  cell.innerText = name || '-';
                  cell.style.textAlign = 'left';
                } else if (
                  headerText.includes('Quantity') ||
                  headerText.includes('Total Qty')
                ) {
                  cell.innerText = `${quantity} ${unit}`;
                } else if (headerText.includes('Store')) {
                  cell.innerText = `${(item as RawMaterial).inventory || 0} ${unit}`;
                } else if (headerText.includes('PO')) {
                  cell.innerText = `${((item as RawMaterial).quantity || 0) - ((item as RawMaterial).inventory || 0) || 0} ${unit}`;
                } else if (headerText.includes('Order Qty')) {
                  cell.innerText = `${orderQuantity} ${unit}`;
                }
              }
            };

            insertItemCells(data[i]);
            const spacerCell = row.insertCell();
            spacerCell.style.border = 'none';
            spacerCell.style.width = '16px';
            insertItemCells(data[i + 1]);
          }

          reportContainer.appendChild(table);
        } else {
          Object.keys(data).forEach((key) => {
            renderSectionTableTwoColumn(data[key], key, depth + 1, isExtra);
          });
        }
      };

      renderSectionTableTwoColumn(groupedData);
      if (mergedMaterials.length > 0) {
        renderSectionTableTwoColumn(
          mergedMaterials,
          'Extra Raw Materials',
          0,
          true,
        );
      }

      const totalQuantity =
        filteredRawMaterials.reduce(
          (sum, material) => sum + (material.quantity || 0),
          0,
        ) +
        mergedMaterials.reduce(
          (sum, material) => sum + (material.quantity || 0),
          0,
        );
      const totalPreparation = filteredRawMaterials.reduce(
        (sum, material) => sum + (material.inventory || 0),
        0,
      );
      const uniqueMaterials = new Set([
        ...filteredRawMaterials.map((material) => material.name),
        ...mergedMaterials.map((material) => material.rawMaterial.name),
      ]).size;

      const statsSection = document.createElement('div');
      statsSection.style.marginTop = '10px';
      statsSection.style.marginBottom = '15px';
      statsSection.style.textAlign = 'center';
      statsSection.innerHTML = `
        <div style="display: inline-block; margin: 0 15px;">
          <strong style="color: #1E3A8A;">Total Materials:</strong> 
          <span style="font-weight: bold; color: black;">${uniqueMaterials}</span>
        </div>
        <div style="display: inline-block; margin: 0 15px;">
          <strong style="color: #1E3A8A;">Total Quantity:</strong> 
          <span style="font-weight: bold; color: black;">${totalQuantity}</span>
        </div>
        <div style="display: inline-block; margin: 0 15px;">
          <strong style="color: #1E3A8A;">Total Store:</strong> 
          <span style="font-weight: bold; color: black;">${totalPreparation}</span>
        </div>
        <div style="display: inline-block; margin: 0 15px;">
          <strong style="color: #1E3A8A;">Items Listed:</strong> 
          <span style="font-weight: bold; color: black;">${filteredRawMaterials.length + mergedMaterials.length}</span>
        </div>
      `;
      reportContainer.appendChild(statsSection);

      // Append to body but keep it hidden and off-screen
      document.body.appendChild(reportContainer);

      // Wait a bit for the container to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(reportContainer, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false, // Disable console logging
        removeContainer: true, // Remove container after capture
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const bottomMargin = 13;
      const topMargin = 18;

      let heightLeft = imgHeight;
      let pageNumber = 1;

      while (heightLeft > 0) {
        if (pageNumber > 1) pdf.addPage();

        const currentTopMargin = pageNumber === 1 ? 0 : topMargin;
        const usableHeight = pageHeight - currentTopMargin - bottomMargin;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = (usableHeight * canvas.width) / imgWidth;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            (imgHeight - heightLeft) * (canvas.width / imgWidth),
            canvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height,
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 1);
        pdf.addImage(
          pageImgData,
          'JPEG',
          0,
          currentTopMargin,
          imgWidth,
          usableHeight,
          undefined,
          'FAST',
        );

        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          `Page ${pageNumber}`,
          pdf.internal.pageSize.getWidth() / 2,
          pageHeight - 8,
          {
            align: 'center',
          },
        );

        heightLeft -= usableHeight;
        pageNumber++;
      }

      pdf.save(
        `RawMaterialOrder_${new Date().toISOString().split('T')[0]}.pdf`,
      );
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to export PDF: ${error.message || 'Unknown error'}`);
    } finally {
      // Always remove the container
      const container = document.querySelector('div[style*="left: -9999px"]');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  const uniqueMaterials = useMemo(() => {
    return new Set([
      ...filteredRawMaterials.map((material) => material.name),
      ...mergedMaterials.map((material) => material.rawMaterial.name),
    ]).size;
  }, [filteredRawMaterials, mergedMaterials]);

  // Add this helper function to validate dates
  const isValidDate = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Or you can use this alternative approach with safeFormat function
  const safeFormat = (dateString: string, formatString: string) => {
    if (!dateString) return 'DD/MM/YYYY';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'DD/MM/YYYY' : format(date, formatString);
  };

  // Render Events View
  const renderEventsView = () => (
    <>
      <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800">
              <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Filter by Date Range:
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
                From:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="border-gray-300 dark:border-gray-600 text-gray-900 dark:bg-gray-700 flex min-w-[140px] flex-1 items-center justify-between rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 dark:text-white">
                  <span>
                    {isValidDate(fromDate)
                      ? format(new Date(fromDate), 'dd/MM/yyyy')
                      : 'DD/MM/YYYY'}
                  </span>
                  <FiCalendar className="text-gray-400 dark:text-gray-500 h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
                To:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="border-gray-300 dark:border-gray-600 text-gray-900 dark:bg-gray-700 flex min-w-[140px] flex-1 items-center justify-between rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 dark:text-white">
                  <span>
                    {isValidDate(toDate)
                      ? format(new Date(toDate), 'dd/MM/yyyy')
                      : 'DD/MM/YYYY'}
                  </span>
                  <FiCalendar className="text-gray-400 dark:text-gray-500 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
            Events & Sub-events
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredEvents.length} events found
          </span>
        </div>

        {isEventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <FiFilter className="mx-auto mb-4 h-12 w-12" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No events found in the selected date range
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-50 dark:bg-gray-750 dark:border-gray-700 rounded-lg border border-stroke transition-all duration-200 hover:shadow-md"
            >
              <div
                onClick={() => toggleAccordion(event.id)}
                className="flex cursor-pointer items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEvents[event.id] || false}
                    onClick={(e) => toggleEventCheckbox(event.id, e)}
                    onChange={() => {}}
                    className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h4 className="text-gray-900 font-semibold dark:text-white">
                      {event.name}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {format(new Date(event.startDate), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(event.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {event.subEvents?.length || 0} sub-events
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xl font-bold transition-transform duration-200">
                    {expandedEvents[event.id] ? '−' : '+'}
                  </span>
                </div>
              </div>

              {expandedEvents[event.id] && event.subEvents?.length > 0 && (
                <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg border-t">
                  <div className="grid gap-2 p-4">
                    {event.subEvents.map((sub) => (
                      <label
                        key={sub.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubEvents[sub.id] || false}
                          onChange={() => toggleSubEvent(sub.id)}
                          className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300 flex-1">
                          {sub.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {filteredEvents.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={isLoading || selectedSubEventsCount === 0}
            className="disabled:bg-gray-400 flex transform items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-blue-700 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Generating Report...
              </>
            ) : (
              <>
                <FiDownload className="h-5 w-5" />
                Generate Report ({selectedSubEventsCount})
              </>
            )}
          </button>
        </div>
      )}

      {isError && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-center text-red-700 dark:text-red-400">
            Failed to generate report. Please check the console for details.
          </p>
        </div>
      )}
    </>
  );

  // Render History View
  const renderHistoryView = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2 text-2xl font-bold dark:text-white">
          Raw Material History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View previously generated raw material reports
        </p>
      </div>

      {isHistoryLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400 ml-3">
            Loading history...
          </span>
        </div>
      ) : isHistoryError ? (
        <div className="py-12 text-center">
          <div className="mb-2 text-lg text-red-500 dark:text-red-400">
            Error loading history
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later
          </p>
        </div>
      ) : historyData.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <FiClock className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-gray-900 mb-2 text-lg font-semibold dark:text-white">
            No History Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No raw material reports have been generated yet.
          </p>
        </div>
      ) : (
        <div className="border-gray-200 dark:border-gray-700 overflow-hidden rounded-xl border">
          <table className="divide-gray-200 dark:divide-gray-700 min-w-full divide-y">
            <thead className="bg-gray-60 dark:bg-gray-700">
              <tr>
                <th className="text-gray-500 dark:text-gray-300 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">
                  List No
                </th>
                <th className="text-gray-500 dark:text-gray-300 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">
                  From Date
                </th>
                <th className="text-gray-500 dark:text-gray-300 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">
                  To Date
                </th>
                <th className="text-gray-500 dark:text-gray-300 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="dark:bg-gray-800 dark:bg-gray-900 b divide-y">
              {historyData.map((history) => (
                <tr
                  key={history.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="text-gray-900 font-mediu whitespace-nowrap px-6 py-4 text-sm">
                    {history.listNo}
                  </td>
                  <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-6 py-4 text-sm">
                    {safeFormat(history.from, 'dd/MM/yyyy')}
                  </td>
                  <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-6 py-4 text-sm">
                    {safeFormat(history.to, 'dd/MM/yyyy')}
                  </td>
                  <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-6 py-4 text-sm">
                    {safeFormat(history.createdAt, 'dd/MM/yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2 text-3xl font-bold dark:text-white">
            Total Raw Material Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View raw material requirements by date range and events
          </p>
        </div>
        <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
          <div className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 border-b px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('events')}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    viewMode === 'events'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Select Events
                </button>
                <button
                  onClick={() => setViewMode('raw-materials')}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    viewMode === 'raw-materials'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Raw Materials
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    viewMode === 'history'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FiClock className="mr-2 inline" />
                  History
                </button>
              </div>

              {viewMode === 'events' && (
                <div className="flex items-center gap-4">
                  <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                    <FiFilter className="h-4 w-4" />
                    <span>{selectedSubEventsCount} sub-events selected</span>
                  </div>
                </div>
              )}

              {viewMode === 'raw-materials' &&
                (rawMaterialData.length > 0 || mergedMaterials.length > 0) && (
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                      <FiFilter className="h-4 w-4" />
                      <span>
                        {filteredRawMaterials.length + mergedMaterials.length}{' '}
                        materials
                      </span>
                    </div>
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:bg-green-700"
                    >
                      <FiDownload className="h-4 w-4" />
                      Export PDF
                    </button>
                  </div>
                )}
            </div>
          </div>
          <div className="p-6">
            {viewMode === 'events' && renderEventsView()}
            {viewMode === 'raw-materials' && (
              <>
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-gray-900 text-2xl font-bold dark:text-white">
                        Raw Materials
                        {selectedHistoryItem && (
                          <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
                            (Loaded from history #{selectedHistoryItem.listNo})
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {fromDate} to {toDate} •{' '}
                        {filteredRawMaterials.length + mergedMaterials.length}{' '}
                        materials found
                        {selectedSubEventsCount > 0 && (
                          <> • {selectedSubEventsCount} sub-event(s) selected</>
                        )}
                      </p>
                    </div>
                  </div>
                  {isLoading && (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!isLoading &&
                    (rawMaterialData.length > 0 ||
                      mergedMaterials.length > 0) && (
                      <>
                        <div className="border-gray-200 dark:bg-gray-800 rounded-xl border p-5 shadow-sm">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                              <div className="relative">
                                <FiSearch className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                                <input
                                  type="text"
                                  placeholder="Search by name or category..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="border-gray-300 dark:border-gray-600 w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:bg-black"
                                />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.category}
                                  onChange={() =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      category: !prev.category,
                                    }))
                                  }
                                  className="peer sr-only"
                                />
                                <div className="bg-gray-200 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                                <span className="text-gray-700 ml-3 text-sm font-medium dark:text-white">
                                  Group by Category
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.subEvent}
                                  onChange={() =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      subEvent: !prev.subEvent,
                                    }))
                                  }
                                  className="peer sr-only"
                                />
                                <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                                <span className="text-gray-700 ml-3 text-sm font-medium dark:text-white">
                                  Group by Sub-Event
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.maharaj}
                                  onChange={() =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      maharaj: !prev.maharaj,
                                    }))
                                  }
                                  className="peer sr-only"
                                />
                                <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                                <span className="text-gray-700 ml-3 text-sm font-medium dark:text-white">
                                  Group by Maharaj
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedColumns.orderQuantity}
                                  onChange={() =>
                                    toggleColumnSelection('orderQuantity')
                                  }
                                  className="peer sr-only"
                                />
                                <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                                <span className="text-gray-700 ml-3 text-sm font-medium dark:text-white">
                                  Show Order Quantity
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="border-gray-200 overflow-hidden rounded-xl border shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="divide-gray-200 dark:divide-gray-700 min-w-full divide-y">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th className="text-gray-900 px-4 py-3 text-left text-sm font-semibold dark:text-white">
                                    Name
                                  </th>
                                  <th className="text-gray-900 px-4 py-3 text-left text-sm font-semibold dark:text-white">
                                    Category
                                  </th>
                                  <th className="text-gray-900 px-4 py-3 text-left text-sm font-semibold dark:text-white">
                                    Quantity
                                  </th>
                                  <th className="text-gray-900 px-4 py-3 text-left text-sm font-semibold dark:text-white">
                                    Store
                                  </th>
                                  <th className="text-gray-900 px-4 py-3 text-left text-sm font-semibold dark:text-white">
                                    PO
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-gray-200 dark:divide-gray-700 dark:bg-gray-800 divide-y">
                                {filteredRawMaterials.length > 0 ? (
                                  renderRows(groupedData)
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="text-gray-500 dark:text-gray-400 px-4 py-6 text-center"
                                    >
                                      {searchQuery
                                        ? 'No materials match your filters'
                                        : isSuccess &&
                                            rawMaterialData.length === 0
                                          ? 'No raw material data available for selected date range'
                                          : 'Generate report to view data'}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="mb-8 rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                          <h3 className="text-gray-800 mb-6 flex items-center gap-2 text-lg font-semibold dark:text-white">
                            Extra Raw MaterialsSSS
                          </h3>
                          <div className="mb-4">
                            <ExtraRawmaterialOrder
                              onSuccess={refetchExtraRawMaterials}
                              subEventIds={selectedSubEventIds}
                            />
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
                            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                              <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                  <th
                                    scope="col"
                                    className="text-gray-700 px-4 py-3 text-left text-sm font-semibold dark:text-white"
                                  >
                                    Name
                                  </th>
                                  <th
                                    scope="col"
                                    className="text-gray-700 px-4 py-3 text-left text-sm font-semibold dark:text-white"
                                  >
                                    Total Qty
                                  </th>
                                  {selectedColumns.orderQuantity && (
                                    <th
                                      scope="col"
                                      className="text-gray-700 px-4 py-3 text-left text-sm font-semibold dark:text-white"
                                    >
                                      Order Quantity
                                    </th>
                                  )}
                                  <th
                                    scope="col"
                                    className="text-gray-700 px-4 py-3 text-left text-sm font-semibold dark:text-white"
                                  >
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                                {isLoadingExtraMaterials ? (
                                  <tr>
                                    <td
                                      colSpan={
                                        selectedColumns.orderQuantity ? 4 : 3
                                      }
                                      className="px-4 py-4 text-center"
                                    >
                                      <div className="flex justify-center">
                                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : mergedMaterials.length > 0 ? (
                                  mergedMaterials.map((item, index) => (
                                    <tr
                                      key={`extra-${index}`}
                                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                      <td className="text-gray-800 whitespace-nowrap px-4 py-3 text-sm font-medium dark:text-white">
                                        {item.rawMaterial.name}
                                      </td>
                                      <td className="text-gray-700 dark:text-gray-300 whitespace-nowrap px-4 py-3 text-sm">
                                        <input
                                          disabled
                                          type="number"
                                          className="w-full rounded border border-stroke bg-white px-2 py-2 text-right dark:border-strokedark dark:bg-black dark:text-white"
                                          value={Number(item.quantity).toFixed(
                                            item.quantity % 1 === 0 ? 0 : 1,
                                          )}
                                        />
                                      </td>
                                      {selectedColumns.orderQuantity && (
                                        <td className="text-gray-700 dark:text-gray-300 whitespace-nowrap px-4 py-3 text-sm">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="number"
                                              className="w-24 rounded border border-stroke px-2 py-2 text-right dark:border-strokedark dark:bg-black dark:text-white"
                                              value={Number(
                                                initialOrderQuantity[item.id] ||
                                                  item.quantity,
                                              ).toFixed(
                                                item.quantity % 1 === 0 ? 0 : 1,
                                              )}
                                              onChange={(e) =>
                                                handleQuantityChange(
                                                  item.id,
                                                  e.target.value,
                                                )
                                              }
                                            />
                                            <span className="text-gray-600 dark:text-gray-300 min-w-[40px] whitespace-nowrap text-sm">
                                              {item.rawMaterial.unit}
                                            </span>
                                          </div>
                                        </td>
                                      )}
                                      <td className="text-gray-700 dark:text-gray-300 whitespace-nowrap px-4 py-3 text-sm">
                                        <button
                                          type="button"
                                          className="text-blue-600 hover:text-blue-800"
                                          onClick={() =>
                                            handleDeleteExtraMaterial(item.id)
                                          }
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={
                                        selectedColumns.orderQuantity ? 4 : 3
                                      }
                                      className="text-gray-500 dark:text-gray-400 px-4 py-4 text-center"
                                    >
                                      No extra raw materials added
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  {!isLoading &&
                    rawMaterialData.length === 0 &&
                    mergedMaterials.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No raw material data available. Please generate a
                          report first.
                        </p>
                      </div>
                    )}
                </div>
              </>
            )}
            {viewMode === 'history' && renderHistoryView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalRawMaterialOrder;
