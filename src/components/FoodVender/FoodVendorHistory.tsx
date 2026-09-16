/* eslint-disable */
import {
  useGetFoodVendorHistory,
  useSaveFoodVendorAdvancePay,
  useSaveFoodVendorPay,
  useSaveMultiFoodVendorPay,
} from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';
import {Route} from '@/routes/_app/_foodvendor/foodvendorhistory.$id';
import {useNavigate} from '@tanstack/react-router';
import React, {useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {FiEye} from 'react-icons/fi';
import {eventCRM} from './../../lib/validation/crmSchema';

type selectedItemType = {
  eventId: string;
  eventName: string;
  paidAmount: number;
  startDate: string;
  totalAmount: number;
};
const FoodVendorHistory: React.FC = () => {
  const {id} = Route.useParams();
  const {data: history} = useGetFoodVendorHistory(id);
  console.log('history', history);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<selectedItemType | null>(
    null,
  );
  console.log('selectedItem', selectedItem);
  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  console.log('filteredData', filteredData);
  const [bonusAmount, setbonusAmount] = useState<number>(0);

  const [isAllPayModalOpen, setIsAllPayModalOpen] = useState(false);
  // console.log('fromDate & toDate', fromDate, toDate);
  const [payAmt, setPayAmt] = useState<number>(0);
  const [showAdvancePayModal, setShowAdvancePayModal] =
    useState<boolean>(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const {mutateAsync: payFoodVendor} = useSaveFoodVendorPay();
  const navigate = useNavigate();

  const {mutate: payFoodVendorAdvance} = useSaveFoodVendorAdvancePay(
    id as string,
  );
  const {mutate: multiPayFoodVendor} = useSaveMultiFoodVendorPay();

  useEffect(() => {
    setFilteredData(history?.eventWiseHistory);
  }, [history]);

  const filterTotalAmount = filteredData?.reduce(
    (total: number, item: any) => total + Number(item.totalAmount),
    0,
  );
  const filterPaidAmount = filteredData?.reduce(
    (total: number, item: any) => total + Number(item.paidAmount),
    0,
  );
  const filterPendingAmount = filterTotalAmount - Number(filterPaidAmount);

  console.log('filterPendingAmount', filterPendingAmount);
  console.log('filterPaidAmount', filterPaidAmount);
  console.log('filterTotalAmount', filterTotalAmount);

  const onSubmit = () => {
    if (isAllPayModalOpen) {
      multiPayFoodVendor(
        {
          amount: payAmt,
          eventId: filteredData?.map((item: any) => ({
            id: item.eventId,
          })),
          // eventId: filteredData?.map((item: any) => ({ id: item.eventId })) || [],
          walletAmount: walletAmount,
          totalAmount: payAmt + walletAmount + bonusAmount,
          vendorId: id as string,
          ...(bonusAmount > 0 ? {bonus: bonusAmount} : {}),
        },
        {
          onSuccess: () => {
            setIsAllPayModalOpen(false);
            setSelectedItem(null);
            setPayAmt(0);
            setWalletAmount(0);
            setbonusAmount(0);
          },
          // onError: () => {
          //   alert('Error');
          // },
        },
      );
    } else {
      payFoodVendor(
        {
          amount: payAmt,
          eventId: selectedItem?.eventId!,
          walletAmount: walletAmount,
          totalAmount: payAmt + walletAmount + bonusAmount,
          vendorId: id as string,
          // ...((bonusAmount<=0) && {bonus:bonusAmount}),
          ...(bonusAmount > 0 ? {bonus: bonusAmount} : {}),
        },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
            setPayAmt(0);
            setWalletAmount(0);
            setbonusAmount(0);
          },
          // onError: () => {
          //   alert('Error');
          // },
        },
      );
    }
  };

  useEffect(() => {
    const newData = history?.eventWiseHistory?.filter((item: any) => {
      if (!fromDate || !toDate) return true;
      return item.startDate >= fromDate && item.endDate <= toDate;
    });
    setFilteredData(newData);
  }, [fromDate, toDate]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          className="text-left text-xl font-bold"
          onClick={() => navigate({to: '/foodvendor'})}
        >
          ← Back
        </button>
        <button
          className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            navigate({to: `/foodvendorhistoryshow/${id}`});
          }}
        >
          View History
        </button>
      </div>

      <div className="dark:bg-gray-900 overflow-x-auto rounded-lg bg-white p-4 shadow-md dark:bg-black">
        {/* Header Section */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
            {history?.vendor?.name || 'N/A'} Vendor History
          </h2>

          {/* Top Right Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Vendor Info */}
            <div className="text-gray-600 dark:text-gray-300 flex flex-col text-sm sm:flex-row sm:items-center sm:gap-3">
              {/* <span>
                <span className="font-medium">Name:</span>{' '}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {history?.vendor?.name || 'N/A'}
                </span>
              </span> */}
              <span>
                <span className="font-medium">Advance:</span>{' '}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₹{history?.vendor?.advance || '0'}
                </span>
              </span>
              <span>
                <span className="font-medium">Pending:</span>{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  ₹{filterPendingAmount || '0'}
                </span>
              </span>
            </div>
            {/* Filter Box */}
            <div className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 flex flex-wrap items-center gap-2 rounded-md">
              {/* From Date */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="fromDate"
                  className="text-gray-600 dark:text-gray-300 text-sm font-medium"
                >
                  From:
                </label>
                <input
                  type="date"
                  id="fromDate"
                  name="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 w-[130px] rounded-md border bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-boxdark"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="toDate"
                  className="text-gray-600 dark:text-gray-300 text-sm font-medium"
                >
                  To:
                </label>
                <input
                  type="date"
                  id="toDate"
                  name="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 w-[130px] rounded-md border bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-boxdark"
                />
              </div>

              {/* Clear Button */}
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white transition"
              >
                Clear
              </button>

              <button
                onClick={() => setIsAllPayModalOpen(true)}
                className="hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition"
              >
                Pay For Filter
              </button>
            </div>

            {/* Advance Pay Button */}
            <button
              onClick={() => setShowAdvancePayModal(true)}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Advance Pay
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-gray-700 dark:bg-gray-800 dark:text-gray-100 bg-blue-50 dark:bg-boxdark">
                <th className="p-3 text-center font-semibold">Event Dates</th>
                <th className="p-3 text-center font-semibold">Event Name</th>
                <th className="p-3 text-center font-semibold">Total</th>
                <th className="p-3 text-center font-semibold">Paid Amount</th>
                <th className="p-3 text-center font-semibold">Pending</th>
                <th className="p-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((event: any, index: number) => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                return (
                  <tr
                    key={`${event.eventId}-${index}`}
                    className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 border-b transition"
                  >
                    <td className="text-gray-800 dark:text-gray-200 p-2 text-center">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(startDate)}{' '}
                      →{' '}
                      {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(endDate)}
                    </td>
                    <td className="text-gray-800 dark:text-gray-100 p-2 text-center font-semibold">
                      {event.eventName}
                    </td>
                    <td className="text-gray-700 dark:text-gray-300 p-2 text-center">
                      ₹{event.totalAmount}
                    </td>
                    <td className="text-gray-700 dark:text-gray-300 p-2 text-center">
                      ₹{event.paidAmount}
                    </td>
                    <td className="text-gray-700 dark:text-gray-300 p-2 text-center">
                      ₹{event.totalAmount - event.paidAmount}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setSelectedItem(event);
                          }}
                          className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() =>
                            navigate({
                              to: `/foodvendoreventhisory/${event.eventId}`,
                              state: {vendorId: id, eventName: event.eventName},
                            })
                          }
                          className="flex items-center justify-center"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-60 backdrop-blur-sm">
          <div className="dark:bg-gray-800 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-black">
            <h2 className="text-gray-800 mb-4 text-lg font-semibold dark:text-white">
              Pay Food Vendor
            </h2>
            <div className="s flex flex-wrap items-center justify-between gap-6">
              <div className="text-gray-600">
                <span className="text-gray-600 font-medium">Total: </span>
                <span className="font-bold text-blue-600 dark:text-white">
                  {selectedItem.totalAmount}
                </span>
              </div>
              <div className="text-gray-600">
                <span className="text-gray-600 font-medium">Pending: </span>
                <span className="font-bold text-red-600 dark:text-white">
                  {selectedItem.totalAmount - Number(selectedItem.paidAmount)}
                </span>
              </div>
              <div className="text-gray-600">
                <span className="text-gray-600 font-medium">Paid: </span>
                <span className="font-bold text-green-600 dark:text-white">
                  {selectedItem.paidAmount}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setPayAmt(Number(e.target.value));
                  }}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Advance</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setWalletAmount(Number(e.target.value));
                  }}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bonus</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setbonusAmount(Number(e.target.value));
                  }}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setWalletAmount(0);
                  setPayAmt(0);
                  setbonusAmount(0);
                }}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 rounded px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // setIsEditModalOpen(false);
                  onSubmit();
                }}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showAdvancePayModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-60 backdrop-blur-sm">
          <div className="dark:bg-gray-800 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-black">
            <h2 className="text-gray-800 mb-4 text-lg font-semibold dark:text-white">
              Advance Pay
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  onChange={(e) => setPayAmt(Number(e.target.value))}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAdvancePayModal(false);
                  setPayAmt(0);
                }}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 rounded px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  payFoodVendorAdvance(
                    {
                      amount: payAmt,
                    },
                    {
                      onSuccess: () => {
                        setShowAdvancePayModal(false);
                        setPayAmt(0);
                      },
                    },
                  );
                }}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isAllPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-60 backdrop-blur-sm">
          <div className="dark:bg-gray-800 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-black">
            <h2 className="text-gray-800 mb-4 text-lg font-semibold dark:text-white">
              Pay Food Vendor
            </h2>
            <div className="s flex flex-wrap items-center justify-between gap-6">
              <div className="text-gray-600">
                <span className="text-gray-600 font-medium">Total: </span>
                <span className="font-bold text-blue-600 dark:text-white">
                  {filterTotalAmount}
                </span>
              </div>
              <div className="text-gray-600">
                <span className="text-gray-600 font-medium">Pending: </span>
                <span className="font-bold text-red-600 dark:text-white">
                  {filterPendingAmount}
                </span>
              </div>
              <div className="text-gray-600">
                <span className="text-gray-600 font-medium">Paid: </span>
                <span className="font-bold text-green-600 dark:text-white">
                  {filterPaidAmount}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setPayAmt(Number(e.target.value));
                  }}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Advance</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setWalletAmount(Number(e.target.value));
                  }}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bonus</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setbonusAmount(Number(e.target.value));
                  }}
                  className="w-full rounded border px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAllPayModalOpen(false);
                  setIsEditModalOpen(false);
                  setWalletAmount(0);
                  setPayAmt(0);
                  setbonusAmount(0);
                }}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 rounded px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  onSubmit();
                }}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodVendorHistory;
