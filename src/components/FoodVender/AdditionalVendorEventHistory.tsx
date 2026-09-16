import React, {useState} from 'react';
import {Route} from '@/routes/_app/_vendor/additinalvendoreventhistory.$id';
import {useLocation, useRouter} from '@tanstack/react-router';
import {useGetDisplayAdditionalVendorEventHistory} from '@/lib/react-query/queriesAndMutations/cateror/additionalVendor/additionalvendoreventhistory';
import {FaArrowLeft} from 'react-icons/fa';
import GenericTable from '../Forms/Table/GenericTable';

/* ================= TYPES ================= */

type AdditionalVendorExtra = {
  particular: string;
  reason?: string;
  quantity: number;
  actualQuantity: number;
  price: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
};

type AdditionalVendorSubEvent = {
  subEventId: string;
  subEventName: string;
  extras: AdditionalVendorExtra[];
  totals: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };
};

const AdditionalVendorEventHistory = () => {
  const {id: eventId} = Route.useParams();
  const location = useLocation();
  const router = useRouter();
  const vendorId = location.state?.vendorId;
  const eventName = location.state?.eventName;

  const {data, isLoading, isError} = useGetDisplayAdditionalVendorEventHistory(
    eventId && vendorId ? {eventId, vendorId} : null,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount?: number) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /* =============== FLATTEN DATA (SAME PATTERN) =============== */

  const tableData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];

    return (data as AdditionalVendorSubEvent[]).flatMap((sub) =>
      sub.extras.map((extra, idx) => ({
        id: `${sub.subEventId}-${idx}`,
        eventName: eventName || 'Event',
        subEventName: sub.subEventName,
        subEventId: sub.subEventId,
        particular: extra.particular,
        reason: extra.reason,
        quantity: extra.quantity,
        actualQuantity: extra.actualQuantity,
        price: extra.price,
        totalAmount: extra.totalAmount,
        paidAmount: extra.paidAmount,
        pendingAmount: extra.pendingAmount,
        status: extra.status,
        isFirstRow: idx === 0,
        extrasCount: sub.extras.length,
        subEventTotals: sub.totals,
      })),
    );
  }, [data, eventName]);

  /* =============== SEARCH FILTER =============== */

  const filteredData = React.useMemo(() => {
    return tableData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [tableData, searchQuery]);

  /* =============== TOTALS =============== */

  const totals = React.useMemo(() => {
    return tableData.reduce(
      (acc, item) => {
        acc.total += item.totalAmount || 0;
        acc.paid += item.paidAmount || 0;
        acc.pending += item.pendingAmount || 0;
        return acc;
      },
      {total: 0, paid: 0, pending: 0},
    );
  }, [tableData]);

  /* =============== COLUMNS (SAME UI) =============== */

  const columns: Column<(typeof tableData)[0]>[] = [
    {
      header: 'Event Name',
      accessor: 'eventName',
      render: (item) =>
        item.isFirstRow ? (
          <div className="text-xs font-semibold">{item.eventName}</div>
        ) : null,
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Sub Event',
      accessor: 'subEventName',
      render: (item) =>
        item.isFirstRow ? (
          <div className="text-xs font-semibold">{item.subEventName}</div>
        ) : null,
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Particular',
      accessor: 'particular',
      render: (item) => (
        <div className="text-center">
          <div className="text-xs font-medium">{item.particular}</div>
          <div className="text-gray-500 text-[10px]">{item.reason}</div>
        </div>
      ),
      className: 'min-w-[140px]',
    },
    {
      header: 'Qty',
      accessor: 'quantity',
      className: 'text-center min-w-[60px]',
    },
    {
      header: 'Actual Qty',
      accessor: 'actualQuantity',
      className: 'text-center min-w-[80px]',
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (i) => formatCurrency(i.price),
      className: 'text-center min-w-[80px]',
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (i) => formatCurrency(i.totalAmount),
      className: 'text-center min-w-[90px]',
    },
    {
      header: 'Paid',
      accessor: 'paidAmount',
      render: (i) => formatCurrency(i.paidAmount),
      className: 'text-center min-w-[90px]',
    },
    {
      header: 'Pending',
      accessor: 'pendingAmount',
      render: (i) => formatCurrency(i.pendingAmount),
      className: 'text-center min-w-[90px]',
    },
    {
      header: 'Status',
      accessor: 'status',
      className: 'text-center min-w-[80px]',
    },
  ];

  /* =============== STATES =============== */

  if (isLoading)
    return (
      <div className="text-gray-500 flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  if (isError || !vendorId)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Failed to load data
      </div>
    );

  /* =============== UI (IDENTICAL STRUCTURE) =============== */

  return (
    <div className="bg-gray-50 min-h-screen p-3">
      <div className="mb-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaArrowLeft
            className="cursor-pointer"
            onClick={() => router.history.back()}
          />
          Additional Vendor Event History
        </h1>
        {eventName && (
          <div className="ml-7 text-sm">
            <span className="text-gray-500">Event:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {eventName}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-sm bg-white px-3 pb-2 pt-3 shadow-default">
        <GenericTable
          data={filteredData}
          columns={columns}
          itemsPerPage={itemsPerPage}
          searchAble
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Totals Footer */}
        <div className="mt-3 border-t border-stroke pt-2 dark:border-strokedark">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                Total Amount
              </div>
              <div className="text-sm font-semibold text-black dark:text-white">
                {formatCurrency(totals.total)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                Total Paid
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(totals.paid)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                Total Pending
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(totals.pending)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalVendorEventHistory;

/* ================= COLUMN TYPE ================= */

type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};
