/* eslint-disable */
import React, {useState} from 'react';
import {Route} from '@/routes/_app/_displayvendor/displayvendorevent.$id';
import {useLocation, useRouter} from '@tanstack/react-router';
import {useGetDisplayEventHistory} from '@/lib/api/cateror/displayvedor';
import {FaArrowLeft} from 'react-icons/fa';
import GenericTable from '../Forms/Table/GenericTable';

const DisplayEventHistory = () => {
  const {id: eventId} = Route.useParams();
  const location = useLocation();
  const router = useRouter();
  const vendorId = location.state?.vendorId;
  const eventName = location.state?.eventName; // Get event name from state

  const {data, isLoading, isError} = useGetDisplayEventHistory(
    eventId && vendorId ? {eventId, vendorId} : null,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Flatten data for table display
  const tableData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.flatMap((sub) =>
      sub.display.map((d: any, idx: number) => ({
        id: `${sub.subEventId}-${idx}`,
        eventName: eventName || 'Event', // Add event name to each row
        subEventName: sub.subEventName,
        subEventDate: sub.subEventDate,
        subEventId: sub.subEventId,
        displayName: d.displayName,
        reason: d.reason,
        quantity: d.quantity,
        price: d.price,
        totalPrice: d.totalPrice,
        paidPrice: d.paidPrice,
        pendingPrice: d.pendingPrice,
        status: d.status,
        isFirstRow: idx === 0,
        displayCount: sub.display.length,
        subEventTotals: sub.totals,
      })),
    );
  }, [data, eventName]); // Add eventName as dependency

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    return tableData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [tableData, searchQuery]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return tableData.reduce(
      (acc, item) => {
        acc.total += item.totalPrice || 0;
        acc.paid += item.paidPrice || 0;
        acc.pending += item.pendingPrice || 0;
        return acc;
      },
      {total: 0, paid: 0, pending: 0},
    );
  }, [tableData]);

  // Define columns for the GenericTable
  const columns: Column<(typeof tableData)[0]>[] = [
    {
      header: 'Event Name',
      accessor: 'eventName',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          {item.isFirstRow ? (
            <div className="text-xs font-semibold text-black dark:text-white">
              {item.eventName}
            </div>
          ) : null}
        </div>
      ),
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Sub Event',
      accessor: 'subEventName',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          {item.isFirstRow ? (
            <>
              <div className="text-xs font-semibold text-black dark:text-white">
                {item.subEventName}
              </div>
              <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-[10px]">
                {new Date(item.subEventDate).toLocaleDateString('en-IN')}
              </div>
            </>
          ) : null}
        </div>
      ),
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Display Name',
      accessor: 'displayName',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-black dark:text-white">
            {item.displayName}
          </div>
          <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-[10px]">
            {item.reason}
          </div>
        </div>
      ),
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Qty',
      accessor: 'quantity',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {item.quantity}
        </div>
      ),
      className: 'min-w-[60px] text-center',
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.price)}
        </div>
      ),
      className: 'min-w-[80px] text-center',
    },
    {
      header: 'Total',
      accessor: 'totalPrice',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.totalPrice)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Paid',
      accessor: 'paidPrice',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.paidPrice)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Pending',
      accessor: 'pendingPrice',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.pendingPrice)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => (
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium">{item.status}</span>
        </div>
      ),
      className: 'min-w-[80px] text-center',
    },
  ];

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

  return (
    <div className="bg-gray-50 min-h-screen p-3">
      {/* Header with Event Name */}
      <div className="mb-3">
        <h1 className="text-gray-900 mb-2 flex items-center gap-2 text-lg font-semibold">
          <FaArrowLeft
            className="cursor-pointer"
            onClick={() => router.history.back()}
          />
          Display Event History
        </h1>
        {eventName && (
          <div className="ml-7">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Event:
            </span>
            <span className="ml-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              {eventName}
            </span>
          </div>
        )}
      </div>

      {/* Custom wrapper for GenericTable with totals footer */}
      <div className="rounded-sm border border-stroke bg-white px-3 pb-2 pt-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Use GenericTable component */}
        <GenericTable
          data={filteredData}
          columns={columns}
          itemsPerPage={itemsPerPage}
          searchAble={true}
          paginationOff={false}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          className="mb-0" // Remove bottom margin since we have our own footer
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

export default DisplayEventHistory;

// Add this type definition for columns
type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};
