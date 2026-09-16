/* eslint-disable  */
import {useAuthContext} from '@/context/AuthContext';
import {useUpdateSubeventCost} from '@/lib/react-query/queriesAndMutations/cateror/event';
import React, {ReactNode, useEffect, useState} from 'react';

type SubEventQuatationProps = {
  data: unknown;
  refetch: () => void;
  newCost: {id: string; cost: number}[];
  setNewCost: React.Dispatch<
    React.SetStateAction<{id: string; cost: number}[]>
  >;
  editingIndex: number | null;
  setEditingIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

interface SubEventUpdate {
  date: string | number | Date;
  time: string | number | Date;
  address: string;
  name: ReactNode;
  id: string;
  finalAmount: number;
  expectedCost: number | null;
  expectedPeople: number;
  actualPeople: number;
  perPlate: number;
  fixedPerPlate: number | null;
  dishes: Array<{
    dish: {name: string; category: {name: string}};
    subEventId: string;
  }>;
}
interface QuatationData {
  event: {
    id: string;
    name: string;
    subEvents: SubEventUpdate[];
  };
  totalCost: number;
  discountGiven: number;
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

const SubEventQuatation: React.FC<SubEventQuatationProps> = ({
  data,
  refetch,
  editingIndex,
  newCost,
  setEditingIndex,
  setNewCost,
}) => {
  const quatationData = data as QuatationData;
  const rawSubEvents = quatationData?.event?.subEvents || [];

  const subEvents = React.useMemo(() => {
    return (rawSubEvents || [])
      .map((ev) => ({
        ...ev,
        formattedTime: new Date(ev.time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [rawSubEvents]);

  console.log('sub eventsss in quotation', subEvents);

  useEffect(() => {
    if (subEvents.length > 0) {
      const costs = subEvents.map((item) => ({
        id: item.id,
        cost:
          item.perPlate !== null &&
          item.perPlate !== undefined &&
          item?.perPlate !== 0
            ? item.perPlate
            : item.fixedPerPlate,
      }));

      setNewCost(costs);
    }
  }, [subEvents]);

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.quotation;
  const role = user?.role;
  const {mutateAsync: updateQuotation} = useUpdateSubeventCost();

  const startEditing = (index: number, subId: string, currentCost: number) => {
    setEditingIndex(index);

    setNewCost((prev) => {
      const updated = prev.filter((item) => item.id !== subId);
      return [
        ...updated,
        {
          id: subId,
          cost: currentCost,
        },
      ];
    });
  };

  const handleCostChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const value = Number(e.target.value);

    setNewCost((prev) =>
      prev.map((item) => (item.id === id ? {...item, cost: value} : item)),
    );
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewCost('');
  };

  const saveCost = async (index: number, item: SubEventUpdate) => {
    const updatedCost = parseFloat(newCost?.cost);
    if (isNaN(updatedCost)) {
      alert('Please enter a valid number.');
      return;
    }

    const subEventId =
      item.dishes?.length > 0 ? item.dishes[0].subEventId : item.id;
    const peopleCount = item.expectedPeople || 1;

    try {
      await updateQuotation({
        subeventId: subEventId,
        amount: updatedCost * peopleCount,
        perPlate: updatedCost,
      });
      console.log('Cost updated for subEvent id:', subEventId);
      refetch();
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating cost:', error);
      alert('Failed to update cost');
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-4 dark:bg-black dark:text-white">
      <table className="min-w-full table-auto">
        <thead className="bg-blue-100 dark:bg-meta-4">
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="px-2 py-2 text-left text-sm sm:px-4 sm:text-base">
              Date
            </th>
            <th className="px-2 py-2 text-left text-sm sm:px-4 sm:text-base">
              Sub Event Name
            </th>
            <th className="px-2 py-2 text-left text-sm sm:px-4 sm:text-base">
              Menu
            </th>
            <th className="px-2 py-2 text-left text-sm sm:px-4 sm:text-base">
              People
            </th>
            <th className="px-2 py-2 text-left text-sm sm:px-4 sm:text-base">
              Note
            </th>
            <th className="px-2 py-2 text-left text-sm sm:px-4 sm:text-base">
              Cost(Per/Person)
            </th>
          </tr>
        </thead>
        <tbody>
          {subEvents?.map((item, index) => {
            console.log('each  item', item);
            const maxPeople = item.expectedPeople;
            const totalCost = item.expectedCost ?? item.finalAmount;
            let currentCost =
              item.perPlate !== null &&
              item.perPlate !== undefined &&
              item?.perPlate !== 0
                ? item.perPlate
                : item.fixedPerPlate;
            console.log('eachhhhhhhh', item);
            const eventDate = new Date(item.date).toLocaleDateString();
            const eventTime = new Date(item.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'UTC',
            });

            // Group dishes by category
            const groupedDishes = groupAndSortDishes(item.dishes);

            return (
              <React.Fragment key={item.id || index}>
                <tr className="border-gray-200 dark:border-gray-700 border-b text-sm sm:text-base">
                  <td className="whitespace-nowrap px-2 py-2 sm:px-4">
                    {eventDate} <br /> {eventTime}
                  </td>

                  <td className="px-2 py-2 sm:px-4">{item.name}</td>

                  <td className="px-2 py-2 sm:px-4">
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
                      <div className="text-gray-500">No menu items</div>
                    )}
                  </td>

                  <td className="px-2 py-2 sm:px-4">{maxPeople}</td>
                  <td className="px-2 py-2 sm:px-4">{item?.note || '-'}</td>
                  <td className="px-2 py-2 sm:px-4">
                    <input
                      type="text"
                      value={newCost.find((c) => c.id === item.id)?.cost || ''}
                      onChange={(e) => handleCostChange(e, item.id)}
                      className="text-gray-900 border-gray-300 dark:border-gray-600 h-[32px] w-full rounded-md border px-2 py-1 focus:outline-none dark:bg-transparent dark:text-white sm:w-[100px]"
                    />
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubEventQuatation;
