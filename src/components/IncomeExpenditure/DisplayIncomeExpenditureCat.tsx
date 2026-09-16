/* eslint-disable */
import React, {useEffect, useState} from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {
  useDeleteIncomeExpense,
  useGetIncomeExpenseByCaterorId,
} from '@/lib/react-query/queriesAndMutations/cateror/income';
import {useNavigate} from '@tanstack/react-router';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import GenericButton from '@/components/Forms/Buttons/GenericButton';

// Define the new type for income and expenditure
type IncomeExpenditure = {
  eventId: string;
  id: string;
  date: string | null;
  status: string;
  particular: string;
  amount: string; // Changed from number to string since your API returns string
  createdAt: string;
  event: {
    name: string;
  };
};

// Define the columns for the income and expenditure table
const columns: Column<IncomeExpenditure>[] = [
  {header: 'Date & Time', accessor: 'date', sortable: true},
  {header: 'Income/Expense', accessor: 'status', sortable: true},
  {header: 'Event Name', accessor: 'event', sortable: true},
  {header: 'Particular', accessor: 'particular', sortable: true},
  {header: 'Amount', accessor: 'amount', sortable: true},
];

interface DisplayIncomeExpenditureCatProps {
  onAddClick?: () => void;
}

const DisplayIncomeExpenditureCat: React.FC<
  DisplayIncomeExpenditureCatProps
> = ({onAddClick}) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.incomeExpenditurePage;
  const role = user?.role;
  const navigate = useNavigate();

  const {data: IncomeExpenditureResponse, isLoading} =
    useGetIncomeExpenseByCaterorId(user?.caterorId as string);

  const {mutate: deleteIncomeExpense} = useDeleteIncomeExpense();

  const data: IncomeExpenditure[] = Array.isArray(IncomeExpenditureResponse)
    ? IncomeExpenditureResponse
    : [];

  const mappedData = data?.map((income: IncomeExpenditure) => {
    // Format date properly - show dash (-) if no valid date
    let formattedDate = '-';

    if (income.date) {
      try {
        const dateObj = new Date(income.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate =
            dateObj.toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            }) +
            ' ' +
            dateObj.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            });
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }

    return {
      ...income,
      event: income?.event?.name || 'Event Not Assigned',
      date: formattedDate,
      // Keep original date for filtering
      originalDate: income.date,
    };
  });

  // State for filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  // Get unique statuses and events for dropdowns
  const uniqueStatuses = Array.from(new Set(data.map((item) => item.status)));
  const uniqueEvents = Array.from(
    new Set(data.map((item) => item?.event?.name || '')),
  );

  // Filter the data based on selected filters
  const filteredData = mappedData.filter((item: any) => {
    const dateCondition =
      !dateFrom && !dateTo
        ? true
        : (() => {
            if (!item.originalDate) return true; // Include items with no date
            const itemDate = new Date(item.originalDate);
            if (isNaN(itemDate.getTime())) return true; // Include invalid dates

            const fromDate = dateFrom ? new Date(dateFrom) : null;
            const toDate = dateTo ? new Date(dateTo) : null;

            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            return true;
          })();

    const statusCondition = !statusFilter || item.status === statusFilter;
    const eventCondition = !eventFilter || item.event === eventFilter;

    return dateCondition && statusCondition && eventCondition;
  });

  const handleEdit = (items: IncomeExpenditure) => {
    navigate({
      to: `/update/incomeExpenditure/${items.id}`,
    });
  };

  const handleDelete = (items: IncomeExpenditure) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete income & expenditure{' '}
              <strong>{items.particular}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteIncomeExpense(items.id);
                    onClose();
                  } catch (error) {
                    console.error(
                      'Error deleting income & expenditure:',
                      error,
                    );
                    onClose();
                  }
                }}
                className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-black transition dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {/* Header with Title and Add Button on same line */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-semibold dark:text-white">
          Income & Expenditure
        </h2>
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <GenericButton onClick={onAddClick}>
            Add Income/Expenditure
          </GenericButton>
        )}
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex flex-wrap items-end gap-6 bg-transparent">
        <div className="flex flex-col bg-transparent">
          <label className="mb-1 bg-transparent text-sm font-medium">
            From:
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 w-40 rounded-md border bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col bg-transparent">
          <label className="mb-1 bg-transparent text-sm font-medium">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 w-40 rounded-md border bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 bg-transparent text-sm font-medium">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-40 rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 bg-transparent text-sm font-medium">
            Event:
          </label>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-10 w-40 rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {uniqueEvents.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <GenericTable
        data={filteredData}
        columns={columns}
        itemsPerPage={15}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onDelete={handleDelete}
        onEdit={handleEdit}
        searchAble
      />
    </div>
  );
};

export default DisplayIncomeExpenditureCat;
