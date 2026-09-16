/* eslint-disable */
import {
  useDeleteAddedRawmaterialForSubevent,
  useGetNewRawMaterialsFroSubevent,
  useGetRawMaterialsByDate,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useDishCountTotal,
  useGetAllEventsWithSubEvents,
  useGetDishListHistory,
  useGetRawMaterialHistory,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';
import {useNavigate} from '@tanstack/react-router';
import {format} from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, {useEffect, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
import {FaAngleDown, FaAngleRight, FaBars, FaTimes} from 'react-icons/fa';
import {FiCalendar, FiClock, FiEye, FiFilter, FiPackage} from 'react-icons/fi';
import {z} from 'zod';
import ExternalPo from './ExternalPo';
import ExternalPurchaseOrder from './ExternalPurchaseOrder';
import PoRawMaterialOrder from './PoRawMaterialOrder';
import PoTendorRateCompare from './PoTendorRateCompare';
import TotalDishCount from './TotalDishCount';
import ExternalPoPage from './ExternalPo/ExternalPoPage';
import {useAuthContext} from '@/context/AuthContext';

const addListSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  subeventIds: z.string().array(),
});
type AddListSchema = z.infer<typeof addListSchema>;
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
interface DishItem {
  id: string;
  category: string;
  dish: string;
  maharaj: string;
  quantity: number;
  eventId: string;
  eventName: string;
  subeventName: string;
}
interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  inventory: number;
  store: string;
  maharaj: string;
  subEvent: string;
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
interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
  type: 'dish' | 'raw-material';
  rawMaterialListStatuses?: Array<{
    id: string;
    status: string;
    rawMaterialListId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

type ViewMode =
  | 'events'
  | 'dish-results'
  | 'raw-materials'
  | 'purchase-order'
  | 'compare-po'
  | 'po'
  | 'history';
type TotalDishAndRawMaterialProps = {
  setInnerComponent: (value: string) => void;
  setListEditId: (value: string) => void;
};

const TotalDishAndRawMaterial: React.FC<TotalDishAndRawMaterialProps> = ({
  setInnerComponent,
  setListEditId,
}) => {
  const navigate = useNavigate();
  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.dishCountandRMOrder;

  const role = user?.role;

  const hasAccess =
    role === 'CATEROR' || restriction === 'EDIT' || restriction === 'VIEW';

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
  const [dishData, setDishData] = useState<DishItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: true,
    subEvent: false,
    maharaj: false,
  });
  const [selectedColumns, setSelectedColumns] = useState({
    inventory: true,
    totalQuantity: true,
    orderQuantity: true,
    requiredQuantity: true,
    extraQuantity: true,
  });
  const [initialOrderQuantity, setInitialOrderQuantity] = useState<{
    [key: string]: number;
  }>({});
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {data: eventsData, isLoading: isEventsLoading} =
    useGetAllEventsWithSubEvents();
  const {mutate: submitDishCount, isLoading: isSubmittingDish} =
    useDishCountTotal();
  const {
    data: dishListHistory,
    isLoading: isDishHistoryLoading,
    isError: isDishHistoryError,
  } = useGetDishListHistory();
  const {
    mutate: fetchRawMaterials,
    data: rawMaterialData,
    isLoading: isRawLoading,
    isSuccess: isRawSuccess,
    isError: isRawError,
  } = useGetRawMaterialsByDate();
  const {
    data: rawMaterialHistory,
    isLoading: isRawHistoryLoading,
    isError: isRawHistoryError,
  } = useGetRawMaterialHistory();
  console.log('rmhistorydataa', rawMaterialHistory);

  const selectedSubEventIds = useMemo(
    () => Object.keys(selectedSubEvents).filter((id) => selectedSubEvents[id]),
    [selectedSubEvents],
  );
  const {
    data: extraAddedRawMaterials,
    refetch: refetchExtraRawMaterials,
    isLoading: isLoadingExtraMaterials,
  } = useGetNewRawMaterialsFroSubevent(selectedSubEventIds[0] || '');
  const {mutateAsync: deleteRawMaterialForSubevent} =
    useDeleteAddedRawmaterialForSubevent();

  const eventsArray = useMemo(() => {
    if (!eventsData?.data) return [];
    return eventsData.data.map((ev) => ({
      ...ev,
      subEvents: ev.subEvents || [],
    }));
  }, [eventsData]);

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

  const dishHistory = useMemo(() => {
    return (dishListHistory?.data || []).map((item: any) => ({
      id: item.id || Math.random().toString(),
      listNo: item.listNo || 0,
      from: item.from,
      to: item.to,
      caterorId: item.caterorId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      type: 'dish' as const,
    }));
  }, [dishListHistory]);

  const rawMaterialHistoryData = useMemo(() => {
    return (rawMaterialHistory?.data || []).map((item: any) => ({
      id: item.id || Math.random().toString(),
      listNo: item.listNo || 0,
      from: item.from,
      to: item.to,
      caterorId: item.caterorId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      type: 'raw-material' as const,
      rawMaterialListStatuses: item.rawMaterialListStatuses || [],
    }));
  }, [rawMaterialHistory]);

  const getLatestStatus = (
    statuses: Array<{status: string; createdAt: string}>,
  ) => {
    if (!statuses || statuses.length === 0) return 'N/A';

    // Sort by createdAt in ascending order
    const sorted = [...statuses].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    // Return comma-separated statuses
    return sorted.map((s) => s.status).join(', ');
  };

  const processedRawMaterials = useMemo(() => {
    if (!isRawSuccess || !rawMaterialData) return [];
    const materials = Array.isArray(rawMaterialData?.data)
      ? rawMaterialData.data
      : Array.isArray(rawMaterialData?.rawMaterials)
        ? rawMaterialData.rawMaterials
        : [];
    return materials.map((item: any) => ({
      rawListId: item?.id,
      id: item.rawmaterialId || Math.random().toString(),
      name: item.rawmaterialName || 'Unknown',
      unit: item.unit || 'kg',
      quantity: item.quantity || 0,
      inventory: item.inventory || 0,
      store: item.store || 'Main Store',
      maharaj: item.maharaj || 'Unknown Maharaj',
      subEvent: item.subEvent || item.subeventName || 'Unknown Sub-Event',
      category: item.category || 'Uncategorized',
    }));
  }, [rawMaterialData, isRawSuccess]);

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

  const toggleAccordion = (eventId: string) => {
    setExpandedEvents((prev) => ({...prev, [eventId]: !prev[eventId]}));
  };

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

  const toggleSubEvent = (subId: string) => {
    setSelectedSubEvents((prev) => ({...prev, [subId]: !prev[subId]}));
  };

  const handleGenerateDishCount = () => {
    if (!filteredData.length) {
      toast.error('Please select at least one event or sub-event');
      return;
    }
    const subeventIds = filteredData.flatMap((event) =>
      event.subEvents.map((sub) => sub.id),
    );
    try {
      const validatedData = addListSchema.parse({
        from: fromDate,
        to: toDate,
        subeventIds,
      });
      submitDishCount(validatedData, {
        onSuccess: (responseData) => {
          toast.success('Dish data loaded successfully!');
          const rawData = responseData?.data || responseData || [];
          const formattedData = rawData.map((item: any) => ({
            id: item.id || Math.random().toString(),
            dishId: item?.dishId || '',
            eventId: item.eventId || '',
            category: item.category || '-',
            dish: item.dishName,
            maharaj: item.preparation?.toString() || '-',
            quantity: item.quantity || 0,
            eventName: item.eventName || 'N/A',
            subeventName: item.subeventName || 'N/A',
            unit: item.unit || 'pcs',
          }));
          setDishData(formattedData);
          setViewMode('dish-results');
          setIsMobileMenuOpen(false);
        },
        onError: (err) => {
          toast.error('Error loading dish data!');
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          'Validation Error: ' + err.errors.map((e) => e.message).join(', '),
        );
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleGenerateRawMaterialReport = () => {
    if (!filteredData.length) {
      toast.error('Please select at least one event or sub-event');
      return;
    }
    const subeventIds = filteredData.flatMap((event) =>
      event.subEvents.map((sub) => sub.id),
    );
    try {
      const requestData: AddListSchema = {
        from: fromDate,
        to: toDate,
        subeventIds,
      };
      fetchRawMaterials(requestData, {
        onSuccess: () => {
          setViewMode('raw-materials');
          toast.success('Raw material report generated successfully!');
          setIsMobileMenuOpen(false);
        },
        onError: () => {
          toast.error('Failed to generate raw material report');
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          'Validation Error: ' + err.errors.map((e) => e.message).join(', '),
        );
      } else {
        toast.error('An unexpected error occurred');
      }
    }
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
      toast.error('Failed to delete extra raw material');
    }
  };

  const filteredRawMaterials = useMemo(() => {
    let filtered = processedRawMaterials;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [processedRawMaterials, searchQuery]);

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

  const renderRawMaterialRows = (
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
          <td className="text-gray-900 px-3 py-2 text-sm font-medium dark:text-white">
            {item.name}
          </td>
          <td className="text-gray-600 dark:text-gray-300 px-3 py-2 text-sm">
            {item.category}
          </td>
          <td className="text-gray-600 dark:text-gray-300 px-3 py-2 text-sm">
            {item.quantity} {item.unit}
          </td>
          {selectedColumns.inventory && (
            <td className="text-gray-600 dark:text-gray-300 px-3 py-2 text-sm">
              {item.inventory || 0} {item.unit}
            </td>
          )}
          {selectedColumns.totalQuantity && (
            <td className="text-gray-600 dark:text-gray-300 px-3 py-2 text-sm">
              {(item.quantity - (item.inventory || 0)).toFixed(
                item.quantity % 1 === 0 ? 0 : 1,
              )}{' '}
              {item.unit}
            </td>
          )}
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
              colSpan={
                selectedColumns.inventory && selectedColumns.totalQuantity
                  ? 5
                  : selectedColumns.inventory || selectedColumns.totalQuantity
                    ? 4
                    : 3
              }
              className="px-3 py-2 font-bold text-black dark:text-white"
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
          rows.push(
            ...renderRawMaterialRows(data[groupKey], currentPath, depth + 1),
          );
        }
      });
      return rows;
    }
  };

  const handleViewHistory = (historyItem: HistoryItem) => {
    setInnerComponent('rawListWrapper');
    setListEditId(historyItem.id);
  };

  const handleExportPDF = async () => {
    if (!filteredRawMaterials.length && !mergedMaterials.length) {
      toast.error('No raw materials to export');
      return;
    }
    try {
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
      reportContainer.style.left = '-9999px';
      reportContainer.style.top = '-9999px';
      reportContainer.style.zIndex = '-9999';
      reportContainer.style.opacity = '0';
      reportContainer.style.pointerEvents = 'none';

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
      document.body.appendChild(reportContainer);

      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(reportContainer, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
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
          {align: 'center'},
        );

        heightLeft -= usableHeight;
        pageNumber++;
      }

      pdf.save(
        `RawMaterialOrder_${new Date().toISOString().split('T')[0]}.pdf`,
      );
      toast.success('PDF exported successfully!');
    } catch (error: any) {
      toast.error(`Failed to export PDF: ${error.message || 'Unknown error'}`);
    } finally {
      const container = document.querySelector('div[style*="left: -9999px"]');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  const safeFormat = (dateString: string, formatString: string) => {
    if (!dateString) return 'DD/MM/YYYY';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'DD/MM/YYYY' : format(date, formatString);
  };

  const renderEventsView = () => (
    <>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Filter by Date Range:
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
                From:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-gray-900 dark:border-gray-600 w-full min-w-[140px] rounded-lg border border-stroke px-3 py-2 dark:border-strokedark dark:bg-black dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
                To:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-gray-900 dark:border-gray-600 w-full min-w-[140px] rounded-lg border border-stroke px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-strokedark dark:bg-black dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
            Events & Sub-events
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredEvents.length} events found
          </span>
        </div>

        {isEventsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-8 text-center">
            <FiFilter className="text-gray-400 dark:text-gray-500 mx-auto mb-3 h-10 w-10" />
            <p className="text-gray-500 dark:text-gray-400">
              No events found in the selected date range
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-stroke bg-white transition-all duration-200 hover:shadow-sm dark:border-strokedark dark:bg-boxdark"
            >
              <div
                onClick={() => toggleAccordion(event.id)}
                className="flex cursor-pointer items-center justify-between p-3"
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
                  <span className="text-gray-400 dark:text-gray-500 text-lg font-bold transition-transform duration-200">
                    {expandedEvents[event.id] ? '−' : '+'}
                  </span>
                </div>
              </div>

              {expandedEvents[event.id] && event.subEvents?.length > 0 && (
                <div className="border-gray-200 bg-gray-50 dark:bg-gray-800 rounded-b-lg border-t dark:border-strokedark">
                  <div className="grid gap-1 p-3">
                    {event.subEvents.map((sub) => (
                      <label
                        key={sub.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
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
        <div className="mt-6 flex items-end justify-end">
          {/* Only show Save button if user has EDIT access, not VIEW only */}
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <button
              onClick={handleGenerateDishCount}
              disabled={isSubmittingDish || selectedSubEventsCount === 0}
              className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingDish ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  <span className="text-sm sm:text-base">
                    Loading Dish Data...
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base">Save</span>
              )}
            </button>
          )}
        </div>
      )}

      {(isRawError || isDishHistoryError) && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-center text-red-700 dark:text-red-400">
            Failed to generate report.
          </p>
        </div>
      )}
    </>
  );

  const renderHistoryView = () => (
    <div className="space-y-4">
      <h3 className="text-gray-900 text-xl font-semibold dark:text-white">
        Raw Material History
      </h3>

      {isRawHistoryLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400 ml-3">
            Loading raw material history...
          </span>
        </div>
      ) : isRawHistoryError ? (
        <div className="py-8 text-center">
          <div className="mb-2 text-lg text-red-500 dark:text-red-400">
            Error loading raw material history
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later
          </p>
        </div>
      ) : rawMaterialHistoryData.length === 0 ? (
        <div className="py-8 text-center">
          <FiClock className="text-gray-400 dark:text-gray-500 mx-auto mb-3 h-12 w-12" />
          <h3 className="text-gray-900 mb-2 text-lg font-semibold dark:text-white">
            No Raw Material History Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No raw material reports have been generated yet.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-stroke bg-white px-3 pb-1 pt-3 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-4">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-sm">List No</div>
                  </th>
                  <th className="px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-sm">From Date</div>
                  </th>
                  <th className="px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-sm">To Date</div>
                  </th>
                  <th className="px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-sm">Created At</div>
                  </th>
                  <th className="px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-sm">Current Stage</div>
                  </th>
                  <th className="px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-center text-sm">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rawMaterialHistoryData
                  .filter(
                    (history) =>
                      history.listNo.toString().includes(searchQuery) ||
                      safeFormat(history.from, 'dd/MM/yyyy').includes(
                        searchQuery,
                      ) ||
                      safeFormat(history.to, 'dd/MM/yyyy').includes(
                        searchQuery,
                      ) ||
                      getLatestStatus(history.rawMaterialListStatuses || [])
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  )
                  .map((history, index) => (
                    <tr
                      key={history.id}
                      className="border-b border-[#eee] text-sm hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-black dark:text-white">
                          {history.listNo}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-gray-600 dark:text-gray-300">
                          {safeFormat(history.from, 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-gray-600 dark:text-gray-300">
                          {safeFormat(history.to, 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-gray-600 dark:text-gray-300">
                          {safeFormat(history.createdAt, 'dd/MM/yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-gray-600 dark:text-gray-300">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              getLatestStatus(
                                history.rawMaterialListStatuses || [],
                              ) === 'LIST'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : getLatestStatus(
                                      history.rawMaterialListStatuses || [],
                                    ) === 'PURCHASE'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : getLatestStatus(
                                        history.rawMaterialListStatuses || [],
                                      ) === 'SENT'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : getLatestStatus(
                                          history.rawMaterialListStatuses || [],
                                        ) === 'COMPLETED'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {getLatestStatus(
                              history.rawMaterialListStatuses || [],
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleViewHistory(history)}
                            className="text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Raw Materials"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Showing {rawMaterialHistoryData.length} records
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderComparePoView = () => (
    <div className="space-y-6">
      <PoTendorRateCompare eventid={filteredRawMaterials[0]?.rawListId} />
    </div>
  );

  const renderPo = () => (
    <div className="space-y-6">
      <ExternalPoPage id={filteredRawMaterials[0]?.rawListId} />
    </div>
  );

  // Tab navigation items
  const tabItems = [
    {id: 'events', label: 'Select Events', icon: null},
    {id: 'dish-results', label: 'Dish Results', icon: null},
    {id: 'raw-materials', label: 'Raw Materials', icon: null},

    {
      id: 'po',
      label: 'Purchase Order',
      icon: <FiPackage className="mr-1 sm:mr-1.5" />,
    },
    {
      id: 'compare-po',
      label: 'Tendor',
      icon: <FiPackage className="mr-1 sm:mr-1.5" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <FiClock className="mr-1 sm:mr-1.5" />,
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto">
        <div className="rounded-sm border border-neutral-200 bg-white p-3 shadow-md dark:border-black dark:bg-black">
          {/* Mobile Menu Toggle */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <div className="text-gray-900 text-lg font-semibold dark:text-white">
              {tabItems.find((tab) => tab.id === viewMode)?.label}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg p-2"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-750 border-b px-2 py-2 sm:px-4 sm:py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Desktop Tabs */}
              <div className="hidden flex-wrap items-center gap-1 sm:gap-2 lg:flex">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setViewMode(tab.id as ViewMode);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:text-base ${
                      viewMode === tab.id
                        ? tab.id === 'events'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : tab.id === 'dish-results' ||
                              tab.id === 'raw-materials'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : tab.id === 'history'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mobile Tabs Dropdown */}
              <div
                className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
              >
                <div className="border-gray-200 dark:border-gray-700 flex flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg dark:bg-meta-4">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setViewMode(tab.id as ViewMode);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        viewMode === tab.id
                          ? tab.id === 'events'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : tab.id === 'dish-results' ||
                                tab.id === 'raw-materials'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : tab.id === 'history'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Tabs Horizontal Scroll */}
              <div className="flex overflow-x-auto pb-1 lg:hidden">
                <div className="flex gap-1">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setViewMode(tab.id as ViewMode)}
                      className={`flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                        viewMode === tab.id
                          ? tab.id === 'events'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : tab.id === 'dish-results' ||
                                tab.id === 'raw-materials'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : tab.id === 'history'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.id === 'events'
                          ? 'Events'
                          : tab.id === 'dish-results'
                            ? 'Dish'
                            : tab.id === 'raw-materials'
                              ? 'Raw'
                              : tab.id === 'compare-po'
                                ? 'Tendor'
                                : tab.id === 'po'
                                  ? 'PO'
                                  : tab.id === 'history'
                                    ? 'History'
                                    : tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-2 sm:p-3">
            {viewMode === 'events' && renderEventsView()}
            {viewMode === 'dish-results' && (
              <TotalDishCount
                data={dishData}
                onBack={() => setViewMode('events')}
                onGenerateRawMaterial={handleGenerateRawMaterialReport}
                isGeneratingRawMaterial={isRawLoading}
                historyItem={selectedHistoryItem}
                fromDate={fromDate}
                toDate={toDate}
                hasEditAccess={hasAccess}
              />
            )}
            {viewMode === 'raw-materials' && (
              <PoRawMaterialOrder
                selectedHistoryItem={selectedHistoryItem}
                fromDate={fromDate}
                toDate={toDate}
                filteredRawMaterials={filteredRawMaterials}
                mergedMaterials={mergedMaterials}
                selectedSubEventsCount={selectedSubEventsCount}
                onExportPDF={handleExportPDF}
                isRawLoading={isRawLoading}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                filters={filters}
                onFiltersChange={setFilters}
                selectedColumns={selectedColumns}
                onToggleColumnSelection={toggleColumnSelection}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                isRawSuccess={isRawSuccess}
                isLoadingExtraMaterials={isLoadingExtraMaterials}
                initialOrderQuantity={initialOrderQuantity}
                onQuantityChange={handleQuantityChange}
                onDeleteExtraMaterial={handleDeleteExtraMaterial}
                onSuccessExtra={refetchExtraRawMaterials}
                selectedSubEventIds={selectedSubEventIds}
                onBack={() => setViewMode('events')}
                groupedData={groupedData}
                renderRawMaterialRows={renderRawMaterialRows}
              />
            )}

            {viewMode === 'po' && renderPo()}
            {viewMode === 'compare-po' && renderComparePoView()}
            {viewMode === 'history' && renderHistoryView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalDishAndRawMaterial;
