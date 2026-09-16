/* eslint-disable */
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {format} from 'date-fns';
import toast from 'react-hot-toast';
import {FiPlus, FiMinus, FiSave, FiShoppingCart} from 'react-icons/fi';
import {useQuery} from '@tanstack/react-query';
import {Route} from '@/routes/_app/_po/eventpo.$id';
import {api} from '@/utils/axios';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useGetHistory,
  useGetHistoryeventPoById,
  useSubmitEventPO,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetPostRawMaterialVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import {BiArrowBack} from 'react-icons/bi';
import {useNavigate} from '@tanstack/react-router';

// Types
interface LineItem {
  id: string;
  rawmaterialId: string;
  name: string;
  unit: string;
  category: string;
  categoryId?: string;
  subEvent?: string;
  subEventId?: string;
  quantity: number;
  date: string;
  time: string;
  location: string;
  vendorId?: string;
  vendorName?: string;
  price?: number;
  isPrimary?: boolean;
}

interface POHistoryItemProps {
  po: any;
}

// Helper functions for formatting
const formatTimeForAPI = (timeString: string): string => {
  if (!timeString) return new Date().toISOString();

  // If it's already in ISO format, return as is
  if (timeString.includes('T')) {
    return timeString;
  }

  // If it's in HH:mm format, convert to ISO string
  if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toISOString();
  }

  // Default to current time if invalid
  console.warn(`Invalid time format: ${timeString}, using current time`);
  return new Date().toISOString();
};

const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return new Date().toISOString().split('T')[0];

  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

// Indian date and time formatting functions
const formatToIndianDate = (dateString: string): string => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    // Format: DD/MM/YYYY
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return '-';
  }
};

const formatToIndianTime = (timeString: string): string => {
  if (!timeString) return '-';

  try {
    // If it's already a full ISO string
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    }

    // If it's just HH:mm format
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    }

    return '-';
  } catch {
    return '-';
  }
};

const formatToIndianDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '-';

  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return '-';
  }
};

// API function and hook
export const getRawMaterialforeventPo = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/event/${id}`);
    console.log('response', response);

    return response.data;
  } catch (error) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const useGetEventRawMaterialsPO = (id: string) =>
  useQuery({
    queryKey: ['geteventdata', id],
    queryFn: () => getRawMaterialforeventPo(id),
    enabled: !!id,
  });

// History Section Component
const HistorySection: React.FC<{poHistory: any}> = ({poHistory}) => {
  if (!poHistory?.formatted || poHistory.formatted.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-gray-900 mb-4 text-xl font-semibold">
        Purchase Order History
      </h2>
      {poHistory.formatted.map((po: any) => (
        <POHistoryItem key={po.poNumber} po={po} />
      ))}
    </div>
  );
};

// Individual PO History Item Component
const POHistoryItem: React.FC<POHistoryItemProps> = ({po}) => {
  const poMaterials = po.purchaseMaterials || [];

  // Move hooks to the top level of the component
  const poTotals = useMemo(() => {
    const acc: Record<string, number> = {};
    poMaterials.forEach((li: any) => {
      acc[li.materialId || li.rawmaterialId] =
        (acc[li.materialId || li.rawmaterialId] || 0) + li.quantity;
    });
    return acc;
  }, [poMaterials]);

  const displayPoItems = useMemo(() => {
    const sorted = [...poMaterials].sort((a: any, b: any) =>
      (a.materialId || a.rawmaterialId).localeCompare(
        b.materialId || b.rawmaterialId,
      ),
    );
    return sorted.map((item: any, index: number) => {
      if (index === 0) {
        return {...item, isPrimary: true};
      }
      const prevId =
        sorted[index - 1].materialId || sorted[index - 1].rawmaterialId;
      const isPrimary = (item.materialId || item.rawmaterialId) !== prevId;
      return {...item, isPrimary};
    });
  }, [poMaterials]);

  const historyColumns = [
    {
      header: 'Rawmaterial Category',
      accessor: 'category',
      render: (item: any) =>
        item.isPrimary ? (
          <span className="text-sm font-medium">{item.category}</span>
        ) : null,
    },
    {
      header: 'Rawmaterial',
      accessor: 'materialName',
      render: (item: any) =>
        item.isPrimary ? (
          <div className="text-sm font-medium">{item.materialName}</div>
        ) : null,
    },
    {
      header: 'Total Quantity',
      accessor: 'totalQuantity',
      render: (item: any) => {
        if (!item.isPrimary) return null;
        const materialId = item.materialId || item.rawmaterialId;
        const total = poTotals[materialId] || 0;
        return (
          <span className="text-sm">
            {total.toFixed(2)} {item.unit}
          </span>
        );
      },
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (item: any) => (
        <span className="text-sm">{item.quantity.toFixed(2)}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (item: any) => (
        <span className="text-sm">{formatToIndianDate(item.date)}</span>
      ),
    },
    {
      header: 'Time',
      accessor: 'time',
      render: (item: any) => (
        <span className="text-sm">{formatToIndianTime(item.time)}</span>
      ),
    },
    {
      header: 'Location',
      accessor: 'venue',
      render: (item: any) => <span className="text-sm">{item.venue}</span>,
    },
    {
      header: 'Vendor',
      accessor: 'vendor',
      render: (item: any) => (
        <span className="text-sm">{item.vendor || ''}</span>
      ),
    },
    {
      header: 'Total Price',
      accessor: 'totalPrice',
      render: (item: any) => (
        <span className="text-sm font-medium">
          {item.price && item.quantity
            ? (item.price * item.quantity).toFixed(2)
            : '0.00'}
        </span>
      ),
    },
    // {
    //   header: 'Actions',
    //   accessor: 'id',
    //   render: () => null,
    // },
  ];

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow">
      <div className="mb-4">
        <h3 className="text-lg font-bold">
          PO #{po.poNumber} - {po.eventName}
        </h3>
        <p className="text-gray-600 text-sm">
          Created: {formatToIndianDateTime(po.purchaseMaterials[0]?.createdAt)}
        </p>
      </div>
      <GenericTable
        data={displayPoItems}
        columns={historyColumns}
        itemsPerPage={10}
        searchAble={true}
        title={`PO Materials (${po.purchaseMaterials.length} items)`}
        paginationOff={false}
      />
    </div>
  );
};

const MainPoPage: React.FC = () => {
  const {id} = Route.useParams();

  const navigate = useNavigate();

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [requiredTotals, setRequiredTotals] = useState<Record<string, number>>(
    {},
  );

  const {
    data: vendorData,
    isLoading: isMaterialsLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetEventRawMaterialsPO(id);

  const {data: postRawMaterials, isLoading: loadingVendors} =
    useGetPostRawMaterialVendor(id);

  console.log('getdata vednorrr', postRawMaterials);
  const {mutate: saveEventPO, isPending: isSubmitting} = useSubmitEventPO(id);

  const {data: poHistory} = useGetHistoryeventPoById(id);
  const handleCancel = () => {
    navigate({to: '/events/$id', params: {id: id}});
  };
  useEffect(() => {
    try {
      if (isSuccess && vendorData && id && poHistory) {
        let rawMaterials: any[] = [];

        // Extract data from vendorData response
        if (vendorData.data && Array.isArray(vendorData.data)) {
          rawMaterials = vendorData.data;
        } else if (Array.isArray(vendorData)) {
          rawMaterials = vendorData;
        } else {
          console.warn('Unexpected API response format:', vendorData);
          setLineItems([]);
          setRequiredTotals({});
          return;
        }

        if (rawMaterials.length === 0) {
          setLineItems([]);
          setRequiredTotals({});
          toast.info('No raw materials found for this event');
          return;
        }

        // Process each item
        const processedData = rawMaterials.map((item, index: number): any => {
          const quantity = Number(item.quantity) || 0;

          return {
            id: item.id || `temp-${index}-${Date.now()}`, // Frontend temporary ID
            rawmaterialId: item.rawmaterialId || item.rawMaterialId || item.id, // Ensure this gets the actual DB ID
            name: item.rawmaterialName || item.name || 'Unknown Material',
            unit: item.unit || 'GRAM',
            quantity: quantity,
            category: item.category || 'Uncategorized',
            categoryId: item.categoryId,
            subEvent: item.subeventName || item.subEvent,
            subEventId: item.subeventId || item.subEventId,
          };
        });

        // Compute required totals
        const requiredTotalsMap: Record<string, number> = processedData.reduce(
          (acc, material) => {
            acc[material.rawmaterialId] = material.quantity;
            return acc;
          },
          {} as Record<string, number>,
        );

        let initialLineItems: LineItem[] = [];

        // Check if history exists and load from the latest PO
        if (poHistory?.formatted && poHistory.formatted.length > 0) {
          const latestPO = poHistory.formatted[poHistory.formatted.length - 1];
          const histMaterials = latestPO.purchaseMaterials || [];

          initialLineItems = histMaterials.map(
            (pm: any, index: number): LineItem => {
              const base = processedData.find(
                (p: any) => p.rawmaterialId === pm.materialId,
              );
              const timeStr = new Date(pm.time).toTimeString().slice(0, 5); // HH:MM
              const dateStr = new Date(pm.date).toISOString().split('T')[0];

              if (base) {
                return {
                  id: `hist-${pm.materialId}-${index}`,
                  rawmaterialId: base.rawmaterialId,
                  name: base.name,
                  category: base.category,
                  categoryId: base.categoryId,
                  subEvent: base.subEvent,
                  subEventId: base.subEventId,
                  unit: base.unit,
                  quantity: pm.quantity || 0,
                  date: dateStr,
                  time: timeStr,
                  location: pm.venue || 'event location',
                  vendorId: pm.vendorId || undefined,
                  vendorName: pm.vendorName || undefined,
                  price: pm.price || undefined,
                };
              }

              // Fallback without base data
              return {
                id: `hist-${pm.materialId}-${index}`,
                rawmaterialId: pm.materialId,
                name: pm.materialName || 'Unknown Material',
                category: 'Uncategorized',
                unit: 'GRAM',
                quantity: pm.quantity || 0,
                date: dateStr,
                time: timeStr,
                location: pm.venue || 'event location',
                vendorId: pm.vendorId || undefined,
                vendorName: pm.vendorName || undefined,
                price: pm.price || undefined,
              };
            },
          );

          // Add missing materials from processedData with default values
          const coveredMaterialIds = new Set(
            initialLineItems.map((li) => li.rawmaterialId),
          );
          const missing = processedData.filter(
            (p) => !coveredMaterialIds.has(p.rawmaterialId),
          );
          const missingLines = missing.map((material, idx) => ({
            id: `${material.rawmaterialId}-default-${idx}`,
            rawmaterialId: material.rawmaterialId,
            name: material.name,
            category: material.category,
            categoryId: material.categoryId,
            subEvent: material.subEvent,
            subEventId: material.subEventId,
            unit: material.unit,
            quantity: 0, // Start with 0 for missing, or use material.quantity if preferred
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '09:00',
            location: 'event location',
            vendorId: undefined,
            vendorName: undefined,
            price: undefined,
          }));
          initialLineItems = [...initialLineItems, ...missingLines];

          toast.success(
            `Loaded ${initialLineItems.length} items from latest PO #${latestPO.poNumber}`,
          );
        } else {
          // Fallback to original initial setup from required materials
          initialLineItems = processedData.map((material) => ({
            id: `${material.rawmaterialId}-default`,
            rawmaterialId: material.rawmaterialId,
            name: material.name,
            category: material.category,
            categoryId: material.categoryId,
            subEvent: material.subEvent,
            subEventId: material.subEventId,
            unit: material.unit,
            quantity: material.quantity,
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '09:00',
            location: 'event location',
            vendorId: undefined,
            vendorName: undefined,
            price: undefined,
          }));

          toast.success(`Loaded ${initialLineItems.length} raw materials`);
        }

        // Sort by rawmaterialId to group items together
        initialLineItems.sort((a, b) =>
          a.rawmaterialId.localeCompare(b.rawmaterialId),
        );

        setLineItems(initialLineItems);
        setRequiredTotals(requiredTotalsMap);
      } else if (id && !isMaterialsLoading && !vendorData) {
        console.log('No vendor data available');
        setLineItems([]);
        setRequiredTotals({});
      }
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Error loading materials data');
      setLineItems([]);
      setRequiredTotals({});
    }
  }, [vendorData, isSuccess, id, isMaterialsLoading, poHistory]);

  /* ---------- Computed values ---------- */
  const currentTotals = useMemo(() => {
    const acc: Record<string, number> = {};
    lineItems.forEach((li) => {
      acc[li.rawmaterialId] = (acc[li.rawmaterialId] || 0) + li.quantity;
    });
    return acc;
  }, [lineItems]);

  const hasQuantityError = useMemo(() => {
    return Object.keys(requiredTotals).some((rmId) => {
      const sum = currentTotals[rmId] || 0;
      const req = requiredTotals[rmId] || 0;
      return sum > req;
    });
  }, [currentTotals, requiredTotals]);

  const displayLineItems = useMemo(() => {
    return lineItems.map((item, index) => {
      if (index === 0) {
        return {...item, isPrimary: true};
      }
      const prevId = lineItems[index - 1].rawmaterialId;
      const isPrimary = item.rawmaterialId !== prevId;
      return {...item, isPrimary};
    });
  }, [lineItems]);

  const getVendorOptions = useCallback(
    (category: string, materialName: string) => {
      if (!postRawMaterials || !Array.isArray(postRawMaterials)) return [];

      return postRawMaterials
        .map((vendor: any) => {
          const cat = vendor.categories.find(
            (c: any) => c.category === category,
          );
          if (!cat) return null;
          const rm = cat.rawMaterials.find((r: any) => r.name === materialName);
          if (!rm) return null;
          return {
            id: vendor.id,
            label: `${vendor.name} (${rm.price})`,
            price: rm.price,
            vendorName: vendor.name,
          };
        })
        .filter(Boolean) as {
        id: string;
        label: string;
        price: number;
        vendorName: string;
      }[];
    },
    [postRawMaterials],
  );

  const updateLineItem = useCallback(
    (lineId: string, updates: Partial<LineItem>) => {
      setLineItems((prev) =>
        prev.map((li) => (li.id === lineId ? {...li, ...updates} : li)),
      );
    },
    [],
  );

  const addLineForMaterial = useCallback(
    (rawmaterialId: string, baseItem: LineItem) => {
      const currentSum = currentTotals[rawmaterialId] || 0;
      const required = requiredTotals[rawmaterialId] || 0;
      if (currentSum >= required) {
        toast.error(
          `Cannot add more lines: Already at full required quantity (${required.toFixed(2)} ${baseItem.unit}) for ${baseItem.name}`,
        );
        return;
      }

      const newId = `line-${rawmaterialId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const newItem: LineItem = {
        id: newId,
        rawmaterialId,
        name: baseItem.name,
        category: baseItem.category,
        categoryId: baseItem.categoryId,
        subEvent: baseItem.subEvent,
        subEventId: baseItem.subEventId,
        unit: baseItem.unit,
        quantity: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        location: 'event location',
      };
      setLineItems((prev) => {
        const currentIndex = prev.findIndex((li) => li.id === baseItem.id);
        if (currentIndex === -1) {
          return [...prev, newItem]; // Fallback to append if not found
        }
        return [
          ...prev.slice(0, currentIndex + 1),
          newItem,
          ...prev.slice(currentIndex + 1),
        ];
      });
    },
    [currentTotals, requiredTotals],
  );

  /* ---------- Table Columns for Main Form ---------- */
  const columns = [
    {
      header: 'Rawmaterial Category',
      accessor: 'category',
      render: (item: LineItem & {isPrimary: boolean}) =>
        item.isPrimary ? (
          <span className="text-sm font-medium">{item.category}</span>
        ) : null,
    },
    {
      header: 'Rawmaterial',
      accessor: 'name',
      render: (item: LineItem & {isPrimary: boolean}) =>
        item.isPrimary ? (
          <div className="text-sm font-medium">{item.name}</div>
        ) : null,
    },
    {
      header: 'Total Quantity',
      accessor: 'totalQuantity',
      render: (item: LineItem & {isPrimary: boolean}) => {
        if (!item.isPrimary) return null;
        const required = requiredTotals[item.rawmaterialId] || 0;
        return (
          <span
            className={`text-sm font-medium ${currentTotals[item.rawmaterialId] > required ? 'text-red-600' : ''}`}
          >
            {required.toFixed(2)} {item.unit}
          </span>
        );
      },
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (item: LineItem & {isPrimary: boolean}) => {
        const required = requiredTotals[item.rawmaterialId] || 0;
        const currentSumWithoutThis =
          (currentTotals[item.rawmaterialId] || 0) - item.quantity;
        const maxForThis = Math.max(0, required - currentSumWithoutThis);
        return (
          <input
            type="text"
            value={item.quantity.toFixed(2)}
            onChange={(e) => {
              const val = e.target.value;
              // Allow empty, numbers, decimal point, up to 2 decimals
              if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
                const num = parseFloat(val) || 0;
                updateLineItem(item.id, {
                  quantity: Math.min(num, maxForThis),
                });
              }
            }}
            onBlur={(e) => {
              const val = parseFloat(e.target.value) || 0;
              const capped = Math.min(val, maxForThis);
              const fixed = Number(capped.toFixed(2));
              if (Math.abs(fixed - item.quantity) > 0.0001) {
                updateLineItem(item.id, {quantity: fixed});
              }
            }}
            className="border-gray-300 w-20 rounded border px-2 py-1 text-right text-sm"
            placeholder="0.00"
          />
        );
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (item: LineItem & {isPrimary: boolean}) => (
        <input
          type="date"
          value={item.date}
          onChange={(e) => updateLineItem(item.id, {date: e.target.value})}
          className="border-gray-300 w-full rounded border px-2 py-1 text-sm"
        />
      ),
    },
    {
      header: 'Time',
      accessor: 'time',
      render: (item: LineItem & {isPrimary: boolean}) => (
        <input
          type="time"
          value={item.time}
          onChange={(e) => updateLineItem(item.id, {time: e.target.value})}
          className="border-gray-300 w-full rounded border px-2 py-1 text-sm"
        />
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      render: (item: LineItem & {isPrimary: boolean}) => (
        <select
          value={item.location}
          onChange={(e) => updateLineItem(item.id, {location: e.target.value})}
          className="border-gray-300 w-full rounded border px-2 py-1 text-sm"
        >
          <option value="event location">Event Location</option>
          <option value="central kitchen">Central Kitchen</option>
        </select>
      ),
    },
    {
      header: 'Vendor',
      accessor: 'vendor',
      render: (item: LineItem & {isPrimary: boolean}) => {
        const options = getVendorOptions(item.category, item.name);
        return (
          <select
            value={item.vendorId || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                updateLineItem(item.id, {
                  vendorId: '',
                  vendorName: '',
                  price: undefined,
                });
                return;
              }
              const opt = options.find((o) => o.id === value);
              if (opt) {
                updateLineItem(item.id, {
                  vendorId: value,
                  vendorName: opt.vendorName,
                  price: opt.price,
                });
              }
            }}
            className="border-gray-300 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="">Select Vendor</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      header: 'Total Price',
      accessor: 'totalPrice',
      render: (item: LineItem & {isPrimary: boolean}) => (
        <span className="text-sm font-medium">
          {item.price && item.quantity
            ? (item.price * item.quantity).toFixed(2)
            : '0.00'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item: LineItem & {isPrimary: boolean}) => {
        const count = lineItems.filter(
          (li) => li.rawmaterialId === item.rawmaterialId,
        ).length;
        const showPlus = item.isPrimary;
        const showMinus = count > 1;
        return (
          <div className="flex gap-2">
            {showPlus && (
              <button
                onClick={() => addLineForMaterial(item.rawmaterialId, item)}
                className="flex items-center gap-1 rounded bg-blue-500 px-1 py-1 text-xs text-white hover:bg-blue-600"
              >
                <FiPlus className="h-4 w-4 text-white" />
                <span className="sr-only">Add Material</span>
              </button>
            )}
            {showMinus && (
              <button
                onClick={() => {
                  setLineItems((prev) =>
                    prev.filter((li) => li.id !== item.id),
                  );
                }}
                className="flex items-center gap-1 rounded bg-red-500 px-1 py-1 text-xs text-white hover:bg-red-600"
              >
                <FiMinus className="h-4 w-4 text-white" />
                <span className="sr-only">Remove Material</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  /* ---------- Event Handlers ---------- */
  const handleSubmitOrder = () => {
    if (lineItems.length === 0) {
      toast.error('No data to submit');
      return;
    }

    if (hasQuantityError) {
      toast.error(
        'Cannot submit: Total quantity for some materials exceeds the required amount. Please adjust quantities.',
      );
      return;
    }

    // Prepare the data for submission with proper time formatting
    const orderData = {
      eventId: id,
      eventName: 'Event Name', // You might need to fetch the actual event name
      materials: lineItems
        .filter((item) => item.quantity > 0 && item.vendorId)
        .map((item) => ({
          materialId: item.rawmaterialId,
          materialName: item.name,
          vendorId: item.vendorId!,
          vendorName: item.vendorName!,
          unit: item.unit,
          quantity: item.quantity,
          category: item.category,
          subeventId: item.subEventId || 'default-subevent-id',
          subeventName: item.subEvent || 'Main Event',
          date: formatDateForAPI(item.date),
          time: formatTimeForAPI(item.time),
          venue: item.location,
        })),
    };

    if (orderData.materials.length === 0) {
      toast.error(
        'No valid items to submit (check quantity and vendor selection)',
      );
      return;
    }

    saveEventPO(orderData);
  };

  if (isMaterialsLoading || loadingVendors) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-3">Loading data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Error loading materials: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="mx-auto">
        {/* Header */}
        {/* <div className="mb-6">
          <h1 className="text-gray-900 text-2xl font-bold">Purchase Order</h1>
          <p className="text-gray-600">Event Name: {eventName}</p>
        </div> */}

        {/* Quantity Error Warning */}
        {hasQuantityError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Quantity Exceeded
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Total quantity for some materials exceeds the required amount.
                  Please adjust quantities before submitting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generic Table for Current/New PO */}
        <GenericTable
          data={displayLineItems}
          columns={columns}
          itemsPerPage={10}
          searchAble={true}
          title={`Raw Materials List`}
          paginationOff={false}
        />

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="flex gap-1 px-4 py-2 text-sm font-medium text-black"
          >
            <BiArrowBack className="h-4 w-4" />
            Back to Event
          </button>

          <button
            onClick={handleSubmitOrder}
            disabled={
              lineItems.length === 0 || isSubmitting || hasQuantityError
            }
            className="disabled:bg-gray-400 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <FiShoppingCart className="h-4 w-4" />
                Submit Order
              </>
            )}
          </button>
        </div>

        {/* History Section */}
        <HistorySection poHistory={poHistory} />
      </div>
    </div>
  );
};

export default MainPoPage;
