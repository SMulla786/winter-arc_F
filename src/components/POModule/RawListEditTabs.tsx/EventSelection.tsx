// import React, {useEffect, useState} from 'react';
// import {FiCalendar, FiDownload, FiFilter} from 'react-icons/fi';
// import {format} from 'date-fns';
// import {useGetRawListHistoryById} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';

// type Props = {
//   listId: string;
// };

// const EventSelection: React.FC<Props> = ({listId}) => {
//   const {data: rawListData, isLoading} = useGetRawListHistoryById(listId);
//   console.log('event list edit data', rawListData);
//   const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
//     {},
//   );
//   const [selectedEvents, setSelectedEvents] = useState<Record<string, boolean>>(
//     {},
//   );
//   const [selectedSubEvents, setSelectedSubEvents] = useState<
//     Record<string, boolean>
//   >({});

//   useEffect(() => {
//     if (rawListData?.data?.from) {
//       const formattedFrom = format(
//         new Date(rawListData.data.from),
//         'yyyy-MM-dd',
//       );
//       const formattedTo = format(new Date(rawListData.data.to), 'yyyy-MM-dd');

//       setFromDate(formattedFrom);
//       setToDate(formattedTo);
//     }
//   }, [rawListData]);

//   // Group the data
//   const grouped = rawListData?.data?.RawMaterialListSubEvents?.reduce(
//     (acc, item) => {
//       const event = item.subEvent?.event;
//       if (!event) return acc;
//       const key = event.name;
//       if (!acc[key]) {
//         acc[key] = {
//           eventName: event.name,
//           eventId: event.id || null,
//           startDate: event?.startDate,
//           endDate: event?.endDate,
//           subEvents: [], // Changed from subEvent to subEvents for consistency
//         };
//       }
//       acc[key].subEvents.push({
//         id: item?.subEvent?.id,
//         name: item?.subEvent?.name,
//       });
//       return acc;
//     },
//     {} as Record<
//       string,
//       {
//         eventName: string;
//         eventId: string | null;
//         startDate: string;
//         endDate: string;
//         subEvents: Array<{id: string; name: string}>;
//       }
//     >,
//   );

//   // Convert grouped object to array for rendering
//   const groupedArray = grouped ? Object.values(grouped) : [];

//   const toggleAccordion = (eventName: string) => {
//     setExpandedEvents((prev) => ({...prev, [eventName]: !prev[eventName]}));
//   };

//   const handleEventCheckboxChange = (eventName: string) => {
//     setSelectedEvents((prev) => ({
//       ...prev,
//       [eventName]: !prev[eventName],
//     }));
//   };

//   const handleSubEventCheckboxChange = (subEventId: string) => {
//     setSelectedSubEvents((prev) => ({
//       ...prev,
//       [subEventId]: !prev[subEventId],
//     }));
//   };

//   console.log('grouped even', grouped);

//   return (
//     <div>
//       <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//           <div className="flex items-center gap-3">
//             <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800">
//               <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//             </div>
//             <span className="text-gray-700 dark:text-gray-300 font-medium">
//               Filter by Date Range:
//             </span>
//           </div>
//           <div className="flex flex-1 flex-col gap-3 sm:flex-row">
//             <div className="flex items-center gap-2">
//               <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
//                 From:
//               </label>
//               <div className="relative">
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="border-gray-300 dark:border-gray-600 text-gray-900 w-full min-w-[140px] rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
//                 />
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
//                 To:
//               </label>
//               <div className="relative">
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="border-gray-300 dark:border-gray-600 text-gray-900 w-full min-w-[140px] rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="space-y-4">
//         <div className="mb-4 flex items-center justify-between">
//           <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
//             Events & Sub-events
//           </h3>
//           <span className="text-gray-500 dark:text-gray-400 text-sm">
//             {groupedArray.length}{' '}
//             {groupedArray.length === 1 ? 'event' : 'events'} found
//           </span>
//         </div>
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
//           </div>
//         ) : groupedArray.length === 0 ? (
//           <div className="py-12 text-center">
//             <div className="text-gray-400 dark:text-gray-500 mb-2">
//               <FiFilter className="mx-auto mb-4 h-12 w-12" />
//             </div>
//             <p className="text-gray-500 dark:text-gray-400 text-lg">
//               No events found in the selected date range
//             </p>
//           </div>
//         ) : (
//           groupedArray.map((event) => (
//             <div
//               key={event.eventName}
//               className="bg-gray-50 dark:bg-gray-750 dark:border-gray-700 rounded-lg border border-stroke transition-all duration-200 hover:shadow-md"
//             >
//               <div
//                 onClick={() => toggleAccordion(event.eventName)}
//                 className="flex cursor-pointer items-center justify-between p-4"
//               >
//                 <div className="flex items-center gap-3">
//                   <div>
//                     <h4 className="text-gray-900 font-semibold dark:text-white">
//                       {event.eventName}
//                     </h4>
//                     <p className="text-gray-500 dark:text-gray-400 text-sm">
//                       {format(new Date(event.startDate), 'MMM dd, yyyy')} -{' '}
//                       {format(new Date(event.endDate), 'MMM dd, yyyy')}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="text-gray-500 dark:text-gray-400 text-sm">
//                     {event.subEvents?.length || 0} sub-events
//                   </span>
//                   <span className="text-gray-400 dark:text-gray-500 text-xl font-bold transition-transform duration-200">
//                     {expandedEvents[event.eventName] ? '−' : '+'}
//                   </span>
//                 </div>
//               </div>
//               {expandedEvents[event.eventName] &&
//                 event.subEvents?.length > 0 && (
//                   <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg border-t">
//                     <div className="grid gap-2 p-4">
//                       {event.subEvents.map((sub) => (
//                         <label
//                           key={sub.id}
//                           className="hover:bg-gray-50 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <span className="text-gray-700 dark:text-gray-300 flex-1">
//                             {sub.name}
//                           </span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default EventSelection;
import React, {useEffect, useState} from 'react';
import {FiCalendar, FiDownload, FiFilter} from 'react-icons/fi';
import {format} from 'date-fns';
import {useGetRawListHistoryById} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';

type Props = {
  listId: string;
};

const EventSelection: React.FC<Props> = ({listId}) => {
  const {data: rawListData, isLoading} = useGetRawListHistoryById(listId);
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (rawListData?.data?.from) {
      const formattedFrom = format(
        new Date(rawListData.data.from),
        'yyyy-MM-dd',
      );
      const formattedTo = format(new Date(rawListData.data.to), 'yyyy-MM-dd');

      setFromDate(formattedFrom);
      setToDate(formattedTo);
    }
  }, [rawListData]);

  // Group the data
  const grouped = rawListData?.data?.RawMaterialListSubEvents?.reduce(
    (acc, item) => {
      const event = item.subEvent?.event;
      if (!event) return acc;
      const key = event.name;
      if (!acc[key]) {
        acc[key] = {
          eventName: event.name,
          eventId: event.id || null,
          startDate: event?.startDate,
          endDate: event?.endDate,
          subEvents: [],
        };
      }
      acc[key].subEvents.push({
        id: item?.subEvent?.id,
        name: item?.subEvent?.name,
      });
      return acc;
    },
    {} as Record<
      string,
      {
        eventName: string;
        eventId: string | null;
        startDate: string;
        endDate: string;
        subEvents: Array<{id: string; name: string}>;
      }
    >,
  );

  // Convert grouped object to array for rendering
  const groupedArray = grouped ? Object.values(grouped) : [];

  const toggleAccordion = (eventName: string) => {
    setExpandedEvents((prev) => ({...prev, [eventName]: !prev[eventName]}));
  };

  console.log('grouped even', grouped);

  return (
    <div>
      {/* Filter Section - More Compact */}
      <div className="mb-4 p-3 dark:border-blue-800 dark:bg-blue-900/20 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Filter by Date Range:
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs font-medium sm:text-sm">
                From:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border-gray-300 text-gray-900 dark w-full rounded border px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-stroke dark:bg-meta-4 dark:text-white sm:px-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs font-medium sm:text-sm">
                To:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border-gray-300 text-gray-900 dark w-full rounded border px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-meta-4 dark:text-white sm:px-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events List - More Compact */}
      <div className="space-y-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-gray-900 text-base font-semibold dark:text-white">
            Events & Sub-events
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            {groupedArray.length}{' '}
            {groupedArray.length === 1 ? 'event' : 'events'} found
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : groupedArray.length === 0 ? (
          <div className="py-8 text-center">
            <FiFilter className="text-gray-400 dark:text-gray-500 mx-auto mb-2 h-8 w-8" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No events found in the selected date range
            </p>
          </div>
        ) : (
          groupedArray.map((event) => (
            <div
              key={event.eventName}
              className="rounded border border-stroke bg-white transition-all duration-200 hover:shadow-sm dark:border-strokedark dark:bg-boxdark"
            >
              <div
                onClick={() => toggleAccordion(event.eventName)}
                className="flex cursor-pointer items-center justify-between p-3"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className="text-gray-900 text-sm font-semibold dark:text-white">
                      {event.eventName}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {format(new Date(event.startDate), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(event.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {event.subEvents?.length || 0} sub-events
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 font-bold transition-transform duration-200">
                    {expandedEvents[event.eventName] ? '−' : '+'}
                  </span>
                </div>
              </div>

              {expandedEvents[event.eventName] &&
                event.subEvents?.length > 0 && (
                  <div className="border-gray-200 border-t dark:border-strokedark">
                    <div className="grid gap-1 p-3">
                      {event.subEvents.map((sub) => (
                        <label
                          key={sub.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-2 rounded p-2 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {sub.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventSelection;
