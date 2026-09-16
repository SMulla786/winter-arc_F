/* eslint-disable */
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetDishes} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {Route} from '@/routes/_app/_event/events.$id';
import React from 'react';

const RedDishesShow = () => {
  const {id: EventId} = Route.useParams();

  const {data: subEventData, isPending: isSubEventPending} =
    useGetSubevent(EventId);
  const {data: CaterorDish, isPending: isDishesPending} = useGetDishes();

  if (isSubEventPending || isDishesPending) {
    return null;
  }

  const subEvents = subEventData?.data?.subEvents || [];
  const allDishes = CaterorDish?.data?.dishes || [];

  // Extract dishes without raw materials
  const dishesWithoutRawMaterials = subEvents.flatMap((sub: any) => {
    return (sub.dishes || [])
      .map((dish: any) => {
        const fullDish = allDishes.find(
          (d: any) => d.id === (dish.dishId || dish.id),
        );
        const hasRaw = fullDish?.caterorDishRawMaterialQuantities?.length > 0;
        return {
          subEventName: sub.name,
          attendees: sub.expectedPeople || sub.attendees || 0,
          dishName: fullDish?.name || dish.name,
          hasRaw,
        };
      })
      .filter((d: any) => !d.hasRaw);
  });

  if (dishesWithoutRawMaterials.length === 0) {
    return null;
  }

  return (
    <div className="">
      <h2 className="py-4 text-xl font-bold text-red-600">
        Dishes Without Raw Materials
      </h2>

      <div className="mb-4 overflow-hidden rounded-md border border-stroke dark:border-strokedark">
        <table className="min-w-full bg-white py-4 dark:bg-meta-4">
          <thead>
            <tr className="bg-gray-100 text-left text-base dark:bg-meta-4">
              <th className="dark:border-gray-600 border-b px-4 py-1">
                Subevent Name
              </th>
              <th className="dark:border-gray-600 border-b px-4 py-1">
                People Attending
              </th>
              <th className="dark:border-gray-600 border-b px-4 py-1">
                Dish Name
              </th>
            </tr>
          </thead>
          <tbody>
            {dishesWithoutRawMaterials.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-stroke dark:border-strokedark"
              >
                <td className="px-4 py-3">{item.subEventName}</td>
                <td className="px-4 py-3">{item.attendees}</td>
                <td className="px-4 py-3 font-medium text-red-500">
                  {item.dishName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RedDishesShow;
