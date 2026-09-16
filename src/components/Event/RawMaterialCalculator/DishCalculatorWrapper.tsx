/* eslint-disable */
import React, {useEffect, useState} from 'react';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from 'lucide-react';
import SubEventDishesCalculation from './SubEventDishesCalculation';

const DishCalculatorWrapper: React.FunctionComponent = () => {
  const {id: EventId} = Route.useParams();
  const {data: EventData, isPending} = useGetSubevent(EventId);
  const subEventResponse =
    EventData?.data.subEvents?.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }
      return timeA - timeB;
    }) || [];

  const [selectedSubEvent, setSelectedSubEvent] = useState<string | null>(
    subEventResponse[0]?.id,
  );

  useEffect(() => {
    if (subEventResponse.length > 0 && !selectedSubEvent) {
      setSelectedSubEvent(subEventResponse[0].id);
    }
  }, [subEventResponse]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <div>
      <div className="mt-2 flex overflow-x-auto pb-2">
        {subEventResponse.map((subEvent: any) => (
          <>
            {' '}
            <div
              key={subEvent.id}
              className={`dark:bg-gray-800 min-w-[150px] flex-shrink-0 cursor-pointer p-3 transition-all duration-200 dark:text-white ${
                selectedSubEvent === subEvent.id
                  ? 'border-b-2 border-green-600 bg-green-100 shadow-sm dark:bg-green-900/30'
                  : 'hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-b border-stroke'
              }`}
              onClick={() => {
                setSelectedSubEvent((prev) =>
                  prev === subEvent.id ? null : subEvent.id,
                );
              }}
            >
              <div className="flex flex-col">
                <h2 className="text-gray-800 dark:text-gray-100 truncate text-sm font-medium">
                  {subEvent.name}
                </h2>
              </div>
            </div>
          </>
        ))}
      </div>
      {subEventResponse.map((subEvent: any) =>
        selectedSubEvent === subEvent.id ? (
          <SubEventDishesCalculation
            key={subEvent.id}
            subEvent={subEvent}
            EventData={EventData?.data}
          />
        ) : null,
      )}
    </div>
  );
};

export default DishCalculatorWrapper;
