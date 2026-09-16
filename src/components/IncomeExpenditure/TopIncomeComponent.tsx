/* eslint-disable */
import React from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useGetIncomeExpenseByCaterorId,
  useGetTotalAmount,
} from '@/lib/react-query/queriesAndMutations/cateror/income';
import {useAuthContext} from '@/context/AuthContext';
import {Route} from '@/routes/_app/_event/events.$id';

const TopIncomeComponent = ({
  setAddNewModal,
  setEditIncomeModal,
  addNewModal,
  editIncomeModal,
  id,
}: any) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.headerIncomeExpense;
  const role = user?.role;

  const {data: Total} = useGetTotalAmount(id);
  console.log('total amtttttt', Total);

  const {data: incomeExpense} = useGetIncomeExpenseByCaterorId(
    user?.caterorId as string,
  );

  const {id: EventId} = Route.useParams();

  const totalIncome = incomeExpense?.reduce((acc, item) => {
    if (item.status == 'INCOME' && item.eventId === EventId) {
      return acc + Number(item?.amount);
    }
    return acc;
  }, 0);

  const totalRecevable = incomeExpense?.reduce((acc, item) => {
    if (item.status == 'RECEIVABLE' && item.eventId === EventId) {
      return acc + Number(item?.amount);
    }
    return acc;
  }, 0);

  const totalExpenditure = incomeExpense?.reduce((acc, item) => {
    if (item.status == 'EXPENDITURE' && item.eventId === EventId) {
      return acc + Number(item?.amount);
    }
    return acc;
  }, 0);

  const totalPayble = incomeExpense?.reduce((acc, item) => {
    if (item.status == 'PAYABLE' && item.eventId === EventId) {
      return acc + Number(item?.amount);
    }
    return acc;
  }, 0);

  const totalProfit =
    (Total?.total || 0) +
    totalIncome +
    totalRecevable -
    (totalPayble + totalExpenditure);

  return (
    <div>
      <div className="bg-white p-4 shadow-sm dark:bg-boxdark md:col-span-12">
        {/* <h1 className="col-span-12 mb-2 text-lg font-semibold">Income Expense</h1> */}

        <div className="col-span-12 grid grid-cols-1 gap-4 px-4 md:grid-cols-6">
          <div className="md:col-span-1">
            <span className="text-md mb-2 font-semibold text-blue-500">
              Bill Amount
              {/* <span className='text-neutral-500 px-2'> {Total?.total}</span>  */}
            </span>
            <span className="bg-gray-100 block rounded p-2 text-left">
              {Total?.total || '0'}
            </span>
          </div>
          <div className="md:col-span-1">
            <span className="text-md mb-2 font-semibold text-blue-500">
              Received Amount
            </span>
            <span className="bg-gray-100 block rounded p-2 text-left">
              {Total?.paid || '0'}
            </span>
          </div>
          <div className="md:col-span-1">
            <span className="text-md mb-2 font-semibold text-blue-500">
              Pending Amount
            </span>
            <span className="bg-gray-100 block rounded p-2 text-left">
              {Total?.pending || '0'}
            </span>
          </div>
          <div className="md:col-span-1">
            <span className="text-md mb-2 font-semibold text-blue-500">
              Expenditure Amount
            </span>
            <span className="bg-gray-100 block rounded p-2 text-left">
              {Total?.expenditure || '0'}
            </span>
          </div>
          <div className="md:col-span-1">
            <span className="text-md mb-2 font-semibold text-blue-500">
              Payable Amount
            </span>
            <span className="bg-gray-100 block rounded p-2 text-left">
              {Total?.payable || '0'}
            </span>
          </div>
          <div className="md:col-span-1">
            <span className="text-md mb-2 font-semibold text-blue-500">
              Profit Amount
            </span>
            <span className="bg-gray-100 block rounded p-2 text-left">
              {totalProfit || '0'}
            </span>
          </div>
        </div>

        {/* <div className="col-span-12 mb-4 md:col-span-12 px-4">
          <h1 className="text-md mb-2 font-semibold">Client Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
            <h1>Client Name: {clientsData?.user?.fullname}</h1>
            <p>PAN Number: {clientsData?.panNumber}</p>
            <p>Mobile Number: {clientsData?.user?.phoneNumber}</p>
            <p>Address: {clientsData?.address}</p>
          </div>
        </div> */}
      </div>
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="col-span-12 flex items-center justify-end rounded-sm px-4 pb-2 pt-4 dark:border-strokedark dark:bg-boxdark sm:px-6">
          <button
            onClick={() => {
              setAddNewModal(!addNewModal);
              setEditIncomeModal(!editIncomeModal);
            }}
            className="flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90 lg:px-8"
          >
            {addNewModal ? 'Close' : 'Add New'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TopIncomeComponent;
