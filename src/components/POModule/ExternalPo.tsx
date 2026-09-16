/* eslint-disable */
import React, {useState, useMemo} from 'react';
import {format} from 'date-fns';
import toast from 'react-hot-toast';
import {FiShoppingCart} from 'react-icons/fi';
import {useQuery} from '@tanstack/react-query';
import {useNavigate} from '@tanstack/react-router';
import {api} from '@/utils/axios';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetPurchaseorder} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {BiArrowBack} from 'react-icons/bi';

// Types
interface PurchaseOrder {
  id: string;
  listNo: number;
  caterorId: string;
  eventId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    PurchaseMaterial: number;
  };
  purchaseMaterials?: any[];
}

// Indian date and time formatting functions
const formatToIndianDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
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

// API function to get detailed PO data by ID
const getPurchaseOrderDetails = async (poId: string) => {
  try {
    const response = await api.get(`/cateror/purchase/${poId}`);
    return response.data;
  } catch (error) {
    const errMsg = `Failed to fetch PO details: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

// Filter purchase orders by date range
const filterPurchaseOrdersByDateRange = (
  purchaseOrders: PurchaseOrder[],
  fromDate: string,
  toDate: string,
): PurchaseOrder[] => {
  if (!purchaseOrders || !fromDate || !toDate) return [];

  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999); // Include the entire end date

  return purchaseOrders.filter((po) => {
    const poDate = new Date(po.createdAt);
    return poDate >= from && poDate <= to;
  });
};

// Individual PO History Item Component
const POHistoryItem: React.FC<{
  po: PurchaseOrder;
  isExpanded: boolean;
  isLoading: boolean;
  poDetails: any;
  onToggle: () => void;
}> = ({po, isExpanded, isLoading, poDetails, onToggle}) => {
  const poMaterials =
    poDetails?.data?.purchaseMaterials || poDetails?.purchaseMaterials || [];

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
      render: (item: any) => (item.isPrimary ? <>{item.category}</> : null),
    },
    {
      header: 'Rawmaterial',
      accessor: 'materialName',
      render: (item: any) => (item.isPrimary ? <>{item.materialName}</> : null),
    },
    {
      header: 'Total Quantity',
      accessor: 'totalQuantity',
      render: (item: any) => {
        if (!item.isPrimary) return null;
        const materialId = item.materialId || item.rawmaterialId;
        const total = poTotals[materialId] || 0;
        return (
          <>
            {total.toFixed(2)} {item.unit}
          </>
        );
      },
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (item: any) => <>{item.quantity.toFixed(2)}</>,
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (item: any) => <>{formatToIndianDate(item.date)}</>,
    },
    {
      header: 'Time',
      accessor: 'time',
      render: (item: any) => {
        if (!item.time) return '-';
        try {
          const time = new Date(item.time);
          return time.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata',
          });
        } catch {
          return '-';
        }
      },
    },
    {
      header: 'Location',
      accessor: 'venue',
      render: (item: any) => <>{item.venue || '-'}</>,
    },
    {
      header: 'Vendor',
      accessor: 'vendor',
      render: (item: any) => <>{item.vendor || '-'}</>,
    },
    {
      header: 'Total Price',
      accessor: 'totalPrice',
      render: (item: any) => (
        <>
          {item.price && item.quantity
            ? (item.price * item.quantity).toFixed(2)
            : '0.00'}
        </>
      ),
    },
  ];

  return (
    <div className="dark:bg-gray-800 mb-6 rounded-lg bg-white p-6 shadow-md">
      <div
        className="mb-4 flex cursor-pointer items-center justify-between"
        onClick={onToggle}
      >
        <div>
          <h4 className="text-xl font-bold">
            PO #{po.listNo} - {po.eventId ? 'Event PO' : 'Date Range PO'}
          </h4>
          <p className="text-gray-600 text-sm">
            Created: {formatToIndianDateTime(po.createdAt)}
            {po.eventId && ` • Event ID: ${po.eventId}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">
            {po._count.PurchaseMaterial} materials
          </span>
          <button className="text-blue-600 hover:text-blue-800">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : poMaterials.length > 0 ? (
            <GenericTable columns={historyColumns} data={displayPoItems} />
          ) : (
            <div className="text-gray-500 py-4 text-center">
              No material details available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// History Section Component
const HistorySection: React.FC<{
  purchaseOrders: PurchaseOrder[];
  fromDate: string;
  toDate: string;
}> = ({purchaseOrders, fromDate, toDate}) => {
  const [expandedPOs, setExpandedPOs] = useState<Record<string, boolean>>({});
  const [poDetails, setPoDetails] = useState<Record<string, any>>({});
  const [loadingPOs, setLoadingPOs] = useState<Record<string, boolean>>({});

  // Filter purchase orders by date range
  const filteredPurchaseOrders = useMemo(() => {
    return filterPurchaseOrdersByDateRange(purchaseOrders, fromDate, toDate);
  }, [purchaseOrders, fromDate, toDate]);

  const togglePOExpansion = async (poId: string) => {
    setExpandedPOs((prev) => ({
      ...prev,
      [poId]: !prev[poId],
    }));

    // If expanding and details not loaded, fetch them
    if (!expandedPOs[poId] && !poDetails[poId]) {
      setLoadingPOs((prev) => ({...prev, [poId]: true}));
      try {
        const details = await getPurchaseOrderDetails(poId);
        setPoDetails((prev) => ({
          ...prev,
          [poId]: details,
        }));
      } catch (error) {
        console.error('Failed to load PO details:', error);
        toast.error('Failed to load purchase order details');
      } finally {
        setLoadingPOs((prev) => ({...prev, [poId]: false}));
      }
    }
  };

  if (filteredPurchaseOrders.length === 0) {
    return (
      <div className="text-gray-500 py-8 text-center">
        No purchase orders found for the selected date range.
      </div>
    );
  }

  return (
    <>
      {filteredPurchaseOrders.map((po) => (
        <POHistoryItem
          key={po.id}
          po={po}
          isExpanded={!!expandedPOs[po.id]}
          isLoading={!!loadingPOs[po.id]}
          poDetails={poDetails[po.id]}
          onToggle={() => togglePOExpansion(po.id)}
        />
      ))}
    </>
  );
};

// Main ExternalPo component - Simplified to only show history
const ExternalPo: React.FC<{
  fromDate: string;
  toDate: string;
  subeventIds?: string[];
  eventId: any;
}> = ({fromDate, toDate, subeventIds, eventId}) => {
  const navigate = useNavigate();

  const {data: purchaseorderData, isLoading: isPurchaseHistoryLoading} =
    useGetPurchaseorder();

  console.log('====================================');
  console.log('All purchase order data:', eventId);
  console.log('====================================');

  // Extract purchase orders from the response
  const purchaseOrders = useMemo(() => {
    if (!purchaseorderData) return [];

    // Handle different response structures
    if (Array.isArray(purchaseorderData)) {
      return purchaseorderData;
    } else if (
      purchaseorderData.data &&
      Array.isArray(purchaseorderData.data)
    ) {
      return purchaseorderData.data;
    } else if (
      purchaseorderData.purchaseOrders &&
      Array.isArray(purchaseorderData.purchaseOrders)
    ) {
      return purchaseorderData.purchaseOrders;
    }

    return [];
  }, [purchaseorderData]);

  const handleCancel = () => {
    navigate({to: '/events'});
  };

  if (isPurchaseHistoryLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading purchase order history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date range info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase Order History</h1>
            <p className="text-gray-600">
              Date Range: {formatToIndianDate(fromDate)} to{' '}
              {formatToIndianDate(toDate)}
            </p>
            {subeventIds && subeventIds.length > 0 && (
              <p className="text-gray-600">
                Sub-events: {subeventIds.length} selected
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white shadow-sm transition-all"
          >
            <BiArrowBack className="h-4 w-4" />
            Back to Events
          </button>
        </div>
      </div>

      {/* History Section with filtered purchase orders */}
      <HistorySection
        purchaseOrders={purchaseOrders}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
};

export default ExternalPo;
