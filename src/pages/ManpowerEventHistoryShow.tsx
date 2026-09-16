/* eslint-disable */
import React, {useState} from 'react';
import {Route} from '@/routes/_app/_vendor/manpowereventhistoryshow.$id';
import {useLocation, useRouter} from '@tanstack/react-router';
import {useGetDisplayManpowerEventHistory} from '@/lib/react-query/queriesAndMutations/cateror/vendormanpowerhistory';
import {FaArrowLeft} from 'react-icons/fa';
// Change this import
import {GenericTable, type Column} from '@/components/Forms/Table/GenericTable'; // Import type separately if needed

const ManpowerEventHistoryShow = () => {
  const {id: eventId} = Route.useParams();
  const location = useLocation();
  const router = useRouter();
  const vendorId = location.state?.vendorId;

  const {data, isLoading, isError} = useGetDisplayManpowerEventHistory(
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
      sub.manpower.map((m: any, idx: number) => ({
        id: `${sub.subEventId}-${idx}`,
        subEventName: sub.subEventName,
        subEventId: sub.subEventId,
        role: m.role,
        quantity: m.quantity,
        actualQuantity: m.actualQuantity,
        rate: m.rate,
        transport: m.transport,
        totalAmount: m.totalAmount,
        paidAmount: m.paidAmount,
        pendingAmount: m.pendingAmount,
        status: m.status,
        reason: m.reason,
        isFirstRow: idx === 0,
        manpowerCount: sub.manpower.length,
        subEventTotals: sub.totals,
      })),
    );
  }, [data]);

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
      header: 'Role',
      accessor: 'role',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-black dark:text-white">
            {item.role}
          </div>
          {item.reason && (
            <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-[10px]">
              {item.reason}
            </div>
          )}
        </div>
      ),
      className: 'min-w-[120px] text-center',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (item) => (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-black dark:text-white">
            {item.quantity}
          </div>
          {item.actualQuantity !== undefined &&
            item.actualQuantity !== null && (
              <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-[10px]">
                Actual: {item.actualQuantity}
              </div>
            )}
        </div>
      ),
      className: 'min-w-[80px] text-center',
    },
    {
      header: 'Rate',
      accessor: 'rate',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.rate)}
        </div>
      ),
      className: 'min-w-[80px] text-center',
    },
    {
      header: 'Transport',
      accessor: 'transport',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {item.transport}
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
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Paid',
      accessor: 'paidAmount',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.paidAmount)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Pending',
      accessor: 'pendingAmount',
      render: (item) => (
        <div className="flex items-center justify-center text-xs font-medium">
          {formatCurrency(item.pendingAmount)}
        </div>
      ),
      className: 'min-w-[90px] text-center',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => (
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium">
            {item.status.replace('_', ' ')}
          </span>
        </div>
      ),
      className: 'min-w-[100px] text-center',
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
      {/* Header */}
      <h1 className="text-gray-900 mb-3 flex items-center gap-2 text-lg font-semibold">
        <FaArrowLeft
          className="cursor-pointer"
          onClick={() => router.history.back()}
        />
        Manpower Event History
      </h1>

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

export default ManpowerEventHistoryShow;
