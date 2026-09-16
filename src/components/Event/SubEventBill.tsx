/* eslint-disable  */
import {useAuthContext} from '@/context/AuthContext';
import {
  useUpdateBillingCost,
  useUpdateSubeventCost,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import React, {useState} from 'react';

type SubEventBillProps = {
  data: unknown;
  refetch: () => void;
  QuotationData: unknown;
};

interface SubEventUpdate {
  name: string;
  id: string;
  finalAmount: number;
  biilingCost: number;
  expectedCost: number;
  actualPeople: number | null;
  discountGiven: number;
  expectedPeople: number;
  time: string | number | Date;
  date: string | number | Date;
  dishes: Array<{
    dish: {name: string; category: {name: string}};
    subEventId: string;
  }>;
  package?: any;
  perPlate?: number;
  finalPerPlate?: number;
}

interface BillData {
  name: string;
  balance: number;
  startDate: string;
  endDate: string;
  finalAmount: number;
  paidAmount: number;
  perPlate: number;
  package: any;
  client: {
    id: string;
    userId: string;
    isVegetarian: boolean | null;
    isJain: boolean | null;
    address: string;
    caste: string;
    caterorId: string;
    createdAt: string;
    updatedAt: string;
  };
  subEvents: SubEventUpdate[];
}

// Function to group dishes by category and sort alphabetically
const groupAndSortDishes = (dishes: any[]) => {
  if (!dishes || dishes.length === 0) return new Map();

  const categoryMap = new Map<string, any[]>();

  dishes.forEach((dishItem) => {
    const categoryName = dishItem.dish?.category?.name || 'Other';
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    categoryMap.get(categoryName)?.push(dishItem);
  });

  // Sort dishes within each category alphabetically by dish name
  categoryMap.forEach((dishesList, category) => {
    dishesList.sort((a, b) => {
      const nameA = a.dish?.name?.toLowerCase() || '';
      const nameB = b.dish?.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  });

  // Sort categories alphabetically
  const sortedCategories = new Map(
    Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
  );

  return sortedCategories;
};

export const SubEventBill: React.FC<SubEventBillProps> = ({
  data,
  refetch,
  QuotationData,
}) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.bill;
  const role = user?.role;

  const billData = data as BillData;
  const rawSubEvents = billData?.subEvents || [];

  const subEvents = rawSubEvents
    .map((ev) => {
      const formattedTime = new Date(ev.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return {
        ...ev,
        formattedTime,
      };
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCost, setNewCost] = useState<string>('');
  const {mutateAsync: updateQuotation} = useUpdateBillingCost();

  // const startEditing = (index: number, currentCost: number) => {
  //   setEditingIndex(index);
  //   setNewCost(currentCost.toString());
  // };

  // const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setNewCost(e.target.value);
  // };

  // const cancelEditing = () => {
  //   setEditingIndex(null);
  //   setNewCost('');
  // };

  // const saveCost = async (index: number, item: SubEventUpdate) => {
  //   const updatedCost = parseFloat(newCost);
  //   if (isNaN(updatedCost)) {
  //     alert('Please enter a valid number.');
  //     return;
  //   }

  //   const people = item.actualPeople || item.expectedPeople || 1;

  //   try {
  //     await updateQuotation({
  //       subeventId: item.id,
  //       amount: updatedCost * people,
  //     });
  //     console.log('Cost updated for subEvent:', item.name);
  //     refetch();
  //     setEditingIndex(null);
  //   } catch (error) {
  //     console.error('Error updating cost:', error);
  //     alert('Failed to update cost');
  //   }
  // };

  // Get quotation data for menu display
  const quotationData = QuotationData as any;
  const quotationSubEvents = quotationData?.data?.event?.subEvents || [];

  return (
    <div className="overflow-x-auto bg-white p-4 dark:bg-meta-4 dark:text-white">
      <table className="min-w-full table-auto overflow-x-auto">
        <thead className="bg-gray dark:bg-meta-4">
          <tr className="bg-blue-100 dark:bg-boxdark">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Sub Event Name</th>
            <th className="px-4 py-2 text-left">Menu</th>
            <th className="px-4 py-2 text-left">People</th>
            <th className="px-4 py-2 text-left">Cost(Per/Person)</th>
            {/* {(role === 'CATEROR' || restriction === 'EDIT') && (
              <th className="px-4 py-2 text-left">Action</th>
            )} */}
          </tr>
        </thead>
        <tbody>
          {subEvents.map((item, index) => {
            // Determine which cost to use with priority: billingCost > expectedCost > finalAmount
            const totalCost =
              item.biilingCost > 0
                ? item.biilingCost
                : item.expectedCost > 0
                  ? item.expectedCost
                  : item.finalAmount;

            // let currentCost = item.finalPerPlate || 0;
            // if (item.actualPeople !== null && item.actualPeople !== 0) {
            //   currentCost = parseFloat(
            //     (totalCost / item.actualPeople).toFixed(2),
            //   );
            // } else if (item.expectedPeople !== 0) {
            //   currentCost = parseFloat(
            //     (totalCost / item.expectedPeople).toFixed(2),
            //   );
            // }

            const maxPeople = Math.max(
              item.expectedPeople,
              item.actualPeople || 0,
            );

            // const matchingRange = item?.package?.packageRange?.find(
            //   (range: any) => maxPeople >= range.from && maxPeople <= range.to,
            // );

            let currentCost =
              (item?.package && item?.perPlate) || item.finalPerPlate || 0;

            const eventDate = new Date(item.date).toLocaleDateString();
            const eventTime = new Date(item.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Find matching subevent in quotation data for menu items
            const quotationSubEvent = quotationSubEvents.find(
              (se: any) => se.name === item.name,
            );

            // Get dishes from quotation or bill data
            let dishesToShow: any[] = [];
            if (quotationSubEvent && quotationSubEvent.dishes) {
              dishesToShow = quotationSubEvent.dishes;
            } else if (item.dishes && item.dishes.length > 0) {
              dishesToShow = item.dishes;
            }

            // Group dishes by category
            const groupedDishes = groupAndSortDishes(dishesToShow);

            return (
              <React.Fragment key={item.name || index}>
                <tr className="border-gray-200 dark:border-gray-700 border-b">
                  <td className="px-4 py-5 text-sm">
                    {eventDate}
                    <br />
                    {eventTime}
                  </td>
                  <td className="px-4 py-5">{item.name}</td>
                  <td className="px-4 py-5">
                    {item?.package?.name && (
                      <div className="mb-2">
                        <span className="font-semibold uppercase text-green-700 dark:text-green-400">
                          ({item?.package?.name})
                        </span>
                      </div>
                    )}
                    {groupedDishes.size > 0 ? (
                      <div className="space-y-3">
                        {Array.from(groupedDishes.entries()).map(
                          ([categoryName, categoryDishes]) => (
                            <div key={categoryName}>
                              <div className="mb-1 font-bold text-black dark:text-white">
                                {categoryName}
                              </div>
                              <ul className="ml-2 list-inside list-disc">
                                {categoryDishes.map((dish: any, i: number) => (
                                  <li
                                    key={i}
                                    className="pl-2 -indent-4 text-sm"
                                  >
                                    {dish.dish.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No dishes available</span>
                    )}
                  </td>
                  <td className="px-4 py-5">{maxPeople}</td>
                  <td className="px-4 py-5">{currentCost}</td>

                  {/* <td className="px-4 py-5 pb-2.5 dark:border-strokedark">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={newCost}
                        onChange={handleCostChange}
                        className="text-gray-900 border-gray-300 dark:border-gray-600 dark:text-800 h-[32px] w-[100px] rounded-md border px-2 py-1 focus:outline-none dark:bg-transparent dark:text-white"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(index, currentCost)}
                        className="text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-800 flex h-[32px] w-[100px] cursor-pointer items-center justify-center rounded-md border px-2 py-1 hover:border-blue-500 dark:text-white"
                      >
                        {currentCost.toFixed(2)}
                      </span>
                    )}
                  </td> */}
                  {/* {(role === 'CATEROR' || restriction === 'EDIT') && (
                    <td className="px-4 py-5">
                      {editingIndex === index ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveCost(index, item)}
                            className="rounded bg-blue-500 px-2 py-1 text-sm font-bold text-white hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 hover:bg-gray-700 rounded px-2 py-1 text-sm font-bold text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(index, currentCost)}
                          className="rounded bg-green-500 px-2 py-1 text-sm font-bold text-white hover:bg-green-700"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  )} */}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubEventBill;
