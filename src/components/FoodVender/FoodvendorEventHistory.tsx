/* eslint-disable */
import React, {useState} from 'react';
import {Route} from '@/routes/_app/_foodvendor/foodvendoreventhisory.$id';
import {useLocation, useRouter} from '@tanstack/react-router';
import {useGetDisplayFoodvendorEventHistory} from '@/lib/react-query/queriesAndMutations/cateror/displayVendor/foodvendorhistory';
import {FaArrowLeft} from 'react-icons/fa';
import GenericTable from '../Forms/Table/GenericTable';

const FoodvendorEventHistory = () => {
  const {id: eventId} = Route.useParams();
  const location = useLocation();
  const router = useRouter();
  const vendorId = location.state?.vendorId;
  const eventName = location.state?.eventName;

  const {data, isLoading, isError} = useGetDisplayFoodvendorEventHistory(
    eventId && vendorId ? {eventId, vendorId} : null,
  );

  console.log('API Response:', data);

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

  // Flatten data for table display - FIXED for your API structure
  const tableData = React.useMemo(() => {
    // Your API returns an array directly, not wrapped in a data property
    if (!data || !Array.isArray(data)) {
      console.log('No data or data is not an array:', data);
      return [];
    }

    console.log('Processing data array:', data);

    return data.flatMap((sub) => {
      if (!sub.dishes || !Array.isArray(sub.dishes)) {
        console.log('No dishes for subevent:', sub);
        return [];
      }

      return sub.dishes.map((dish: any, idx: number) => ({
        id: `${sub.subEventId}-${idx}`,
        eventName: eventName || 'Event',
        subEventName: sub.subEventName,
        subEventId: sub.subEventId,
        dishName: dish.dishName,
        expected: dish.expected,
        actual: dish.actual,
        price: dish.price,
        transport: dish.transport,
        totalAmount: dish.totalAmount,
        paidAmount: dish.paidAmount,
        pendingAmount: dish.pendingAmount,
        status: dish.status,
        reason: dish.reason,
        isFirstRow: idx === 0,
        dishesCount: sub.dishes.length,
        subEventTotals: sub.totals,
      }));
    });
  }, [data, eventName]);

  console.log('Table Data:', tableData);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return tableData;

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
        acc.total += item.totalAmount || 0;
        acc.paid += item.paidAmount || 0;
        acc.pending += item.pendingAmount || 0;
        return acc;
      },
      {total: 0, paid: 0, pending: 0},
    );
  }, [tableData]);

  // Define columns for the GenericTable
  const columns: Column<(typeof tableData)[0]>[] = [
    {
      header: 'Sub Event',
      accessor: 'subEventName',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          {item.isFirstRow ? (
            <div className="text-xs font-semibold text-black dark:text-white">
              {item.subEventName}
            </div>
          ) : null}
        </div>
      ),
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Dish Name',
      accessor: 'dishName',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-black dark:text-white">
            {item.dishName}
          </div>
          {item.reason && (
            <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-[10px]">
              {item.reason}
            </div>
          )}
        </div>
      ),
      className: 'min-w-[150px] text-center',
    },
    {
      header: 'Expected',
      accessor: 'expected',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-black dark:text-white">
            {item.expected}
          </div>
        </div>
      ),
      className: 'min-w-[70px] text-center',
    },
    {
      header: 'Actual',
      accessor: 'actual',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-black dark:text-white">
            {item.actual}
          </div>
        </div>
      ),
      className: 'min-w-[70px] text-center',
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
      header: 'Transport',
      accessor: 'transport',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.transport)}
        </div>
      ),
      className: 'min-w-[80px] text-center',
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.totalAmount)}
        </div>
      ),
      className: 'min-w-[90px] text-center font-semibold',
    },
    {
      header: 'Paid',
      accessor: 'paidAmount',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium text-green-600">
          {formatCurrency(item.paidAmount)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Pending',
      accessor: 'pendingAmount',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium text-amber-600">
          {formatCurrency(item.pendingAmount)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => {
        const statusColor =
          item.status === 'PAID'
            ? 'text-green-600 bg-green-100'
            : item.status === 'PARTIAL'
              ? 'text-yellow-600 bg-yellow-100'
              : 'text-red-600 bg-red-100';

        return (
          <div className="flex items-center justify-center">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
            >
              {item.status}
            </span>
          </div>
        );
      },
      className: 'min-w-[100px] text-center',
    },
  ];

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );

  if (isError || !vendorId)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-red-500">
        <span>Failed to load data</span>
        <button
          onClick={() => router.history.back()}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          Go Back
        </button>
      </div>
    );

  if (!tableData.length) {
    return (
      <div className="text-gray-500 flex min-h-screen flex-col items-center justify-center gap-2">
        <span>No data available for this event</span>
        <button
          onClick={() => router.history.back()}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-3">
      {/* Header */}
      <h1 className="text-gray-900 mb-3 flex items-center gap-2 text-lg font-semibold">
        <FaArrowLeft
          className="cursor-pointer"
          onClick={() => router.history.back()}
        />
        Food Vendor Event History
      </h1>
      <div className="text-gray-700 mb-3 text-sm font-medium">
        Event: {eventName || 'Event'}
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

export default FoodvendorEventHistory;

// Add this type definition for columns
type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};
