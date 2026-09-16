/* eslint-disable */

import {useAuthContext} from '@/context/AuthContext';
import {useGetIncomeExpenseByCaterorId} from '@/lib/react-query/queriesAndMutations/cateror/income';
import React from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetQuatation} from '@/lib/react-query/queriesAndMutations/cateror/quatation';
import {MdReceiptLong} from 'react-icons/md';

interface DisplayIncomeExpenseType {
  id: string;
  status: string;
  particular: string;
  amount: number;
  date: string;
  eventId: string;
}

const columns: Column<DisplayIncomeExpenseType>[] = [
  {header: 'Date', accessor: 'date', sortable: true},
  {header: 'Particular', accessor: 'particular', sortable: true},
  {header: 'Amount', accessor: 'amount', sortable: true},
];

const DisplayIncomeExpense: React.FunctionComponent<{status: string}> = (
  props,
) => {
  const {status} = props;
  const navigate = useNavigate();

  const {id: EventId} = Route.useParams();

  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.headerIncomeExpense;
  const role = user?.role;

  const {data: incomeExpense} = useGetIncomeExpenseByCaterorId(
    user?.caterorId as string,
  );

  console.log('incomeExpense:: ', incomeExpense);

  const {data: quatation} = useGetQuatation(EventId);
  console.log('quatation:: ', quatation);

  const data: DisplayIncomeExpenseType[] = Array.isArray(incomeExpense)
    ? incomeExpense
    : [];

  const filteredData = data
    ?.filter(
      (item: DisplayIncomeExpenseType) =>
        item.status === status && item.eventId === EventId,
    )
    .map((item: DisplayIncomeExpenseType) => {
      let formattedDate = 'N/A';

      // Check if date exists and is not an empty string
      if (item?.date && item.date.trim() !== '') {
        const dateObj = new Date(item.date);
        // Check if the date is valid (not NaN) and the year is not 1970
        if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() !== 1970) {
          formattedDate = new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'numeric',
            day: '2-digit',
          }).format(dateObj);
        }
      }

      return {
        ...item,
        date: formattedDate,
        amount: quatation?.event?.balance || item.amount,
      };
    });

  const handleEdit = (items: DisplayIncomeExpenseType) => {
    navigate({
      to: `/update/incomeExpenditure/${items.id}`,
    });
  };

  const handleView = (items: DisplayIncomeExpenseType) => {
    navigate({
      to: `/receiptbill/${items.id}`,
      state: {myData: items} as any,
    });
    console.log('items', items);
  };

  // Create a custom action renderer using the columns array
  const columnsWithReceiptAction: Column<DisplayIncomeExpenseType>[] = [
    ...columns,
    {
      header: 'Action',
      accessor: 'id',
      render: (item: DisplayIncomeExpenseType) => (
        <div className="flex items-center gap-2">
          {status === 'INCOME' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(item);
              }}
              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
              title="View Receipt"
            >
              <MdReceiptLong className="h-4 w-4" />
            </button>
          )}
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
              title="Edit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <GenericTable
      title={status
        .charAt(0)
        .toUpperCase()
        .concat(status.substring(1, status.length).toLowerCase())}
      data={filteredData || []}
      columns={columnsWithReceiptAction}
      itemsPerPage={15}
      action={false} // Disable default action column
    />
  );
};

export default DisplayIncomeExpense;
