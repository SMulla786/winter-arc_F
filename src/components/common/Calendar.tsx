import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {useInvoice} from '@/context/InvoiceContext';
import {
  useDeleteEvent,
  useGetAllEvents,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useNavigate} from '@tanstack/react-router';
import {
  addDays,
  addMonths,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isEqual,
  isSameDay,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {useEffect, useMemo, useState} from 'react';
import {FaAngleLeft, FaAngleRight, FaList, FaStar} from 'react-icons/fa6';
import EventModal from '../Event/EventModal';
import ExpiryPopup from './ExpiryPopup';
import {MdDelete, MdEdit, MdFormatListBulleted} from 'react-icons/md';
import UpdateEventModal from '../Event/UpdateEventModal';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface IEventTypes {
  EventID: string;
  StartDate: string;
  EndDate: string;
  EventName: string;
  client?: {
    fullname: string;
  };
  subEvents?: Array<{
    address: string;
  }>;
  status: string;
  paid: number;
  pending: number;
  isPremium: boolean;
}

const statusColorMap = {
  ENQUIRY: 'bg-[#87CEEB] dark:bg-[#87CEEB]',
  FINALIZED: 'bg-[#FF1493] dark:bg-[#FF1493]',
  PREPARATION: 'bg-[#0097A7] dark:bg-[#0097A7]',
  PAID: 'bg-[#32CD32] dark:bg-[#2E8B57]',
};

const Calendar = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext();
  console.log('userrr', user);

  // State for module access restrictions
  const [hasCalendarAccess, setHasCalendarAccess] = useState(true);
  const [hasEventCreationAccess, setHasEventCreationAccess] = useState(true);
  const [hasClientManagementAccess, setHasClientManagementAccess] =
    useState(true);

  // Check module access from localStorage on component mount
  useEffect(() => {
    const checkModuleAccess = () => {
      try {
        const savedModules = localStorage.getItem('userModuleSelection');
        if (savedModules) {
          const moduleData = JSON.parse(savedModules);

          // Check if Calendar is selected
          const calendarSelected = moduleData.pagesList?.some(
            (item: {page: string}) => item.page === 'Calendar',
          );
          setHasCalendarAccess(calendarSelected !== false);

          // Check if Event Creation is selected
          const eventCreationSelected = moduleData.pagesList?.some(
            (item: {page: string}) => item.page === 'Event Creation',
          );
          setHasEventCreationAccess(eventCreationSelected !== false);

          // Check if Client Management is selected
          const clientManagementSelected = moduleData.pagesList?.some(
            (item: {page: string}) => item.page === 'Client Management',
          );
          setHasClientManagementAccess(clientManagementSelected !== false);

          // If Calendar is not accessible, show warning
          // if (!calendarSelected) {
          //   toast.error('Calendar access is not included in your current plan');
          // }
        }
      } catch (error) {
        console.error('Error checking module access:', error);
      }
    };

    checkModuleAccess();
  }, []);

  const canModifyEvents =
    (user?.role === 'CATEROR' ||
      user?.employeeRestriction?.eventPage === 'EDIT') &&
    hasEventCreationAccess; // Add module restriction

  const canViewEvents = hasCalendarAccess; // Add module restriction for viewing events

  console.log('User', user);
  console.log('Module Access - Calendar:', hasCalendarAccess);
  console.log('Module Access - Event Creation:', hasEventCreationAccess);
  console.log('Module Access - Client Management:', hasClientManagementAccess);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const startOfMonthDate = startOfMonth(currentMonth);
  const endOfMonthDate = endOfMonth(currentMonth);
  const startWeekDate = startOfWeek(startOfMonthDate);
  const endWeekDate = endOfWeek(endOfMonthDate);
  const days = eachDayOfInterval({start: startWeekDate, end: endWeekDate});

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<IEventTypes | null>(null);

  const {data, isSuccess, refetch} = useGetAllEvents({
    enabled:
      (user?.role === 'CATEROR' || user?.role === 'EMPLOYEE') &&
      hasCalendarAccess,
  });

  const {
    mutateAsync: deleteEvent,
    isSuccess: isDeleteSuccess,
    isError,
  } = useDeleteEvent();
  const {generateInvoices} = useInvoice();

  useEffect(() => {
    if (isDeleteSuccess || isError) {
      refetch();
    }
  }, [isDeleteSuccess, isError]);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    event: IEventTypes | null;
    dayEvents?: IEventTypes[];
  }>({visible: false, x: 0, y: 0, event: null});

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({...prev, visible: false}));
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenu.visible]);

  const handlePopupClose = () => {
    setIsPopup(false);
  };

  const events = data?.data?.events.map(
    (event: {id: number; name: string}) => ({
      id: event.id,
      name: event.name,
    }),
  );

  useEffect(() => {
    if (hasCalendarAccess) {
      generateInvoices(events);
    }
  }, [data, hasCalendarAccess]);

  useEffect(() => {
    if (data?.data?.expiry?.expiryDate && hasCalendarAccess) {
      const expiryDate = new Date(data.data.expiry.expiryDate);
      const currentDate = new Date();
      const differenceInDays = Math.floor(
        (expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (differenceInDays <= 6 && differenceInDays >= 0) {
        setIsPopup(true);
        setDaysRemaining(differenceInDays);
      } else {
        setIsPopup(false);
        setDaysRemaining(null);
      }
    }
  }, [data, hasCalendarAccess]);

  const formatLocalTime = (dateString: string) => {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [time] = timePart.split('.');
    const [hours, minutes] = time.split(':');

    return format(
      new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
      ),
      'PPp',
    );
  };

  const loadEventDates: IEventTypes[] = useMemo(() => {
    if (!hasCalendarAccess) return [];

    return (
      data?.data?.events.map(
        (event: {
          id: string;
          name: string;
          startDate: string;
          endDate: string;
          status: string;
          client: {
            fullname: string | null;
            name: string | null;
            phoneNumber: string | null;
            email: string | null;
          };
          subEvents: Array<{
            // ✅ Change to array type
            address: string | null;
            // include other subEvent properties as needed
          }>;
        }) => {
          const {id, name, startDate, endDate, status, client, subEvents} =
            event;

          // Get client name from available fields
          const clientName =
            client?.fullname || client?.name || client?.phoneNumber || 'N/A';

          // ✅ Get first subEvent's address or show 'N/A'
          const subeventAddress = subEvents?.[0]?.address || 'N/A';

          // Or if you want to concatenate multiple addresses:
          // const allAddresses = subEvents?.map(se => se.address).filter(Boolean).join(', ') || 'N/A';

          return {
            EventID: id,
            StartDate: startDate.split('T')[0],
            EndDate: endDate.split('T')[0],
            EventName: name,
            status: status?.toUpperCase(),
            isPremium: name.toLowerCase().includes('premium'),
            client: {
              fullname: clientName,
            },
            subEvents:
              subEvents?.map((se) => ({
                address: se.address || 'N/A',
              })) || [],
          };
        },
      ) || []
    );
  }, [data, hasCalendarAccess]);

  function getEventsForDay(date: Date) {
    if (!hasCalendarAccess) return [];

    return loadEventDates.filter((event) => {
      const eventStart = new Date(event.StartDate + 'T00:00');
      const eventEnd = new Date(event.EndDate + 'T23:59');
      return date >= eventStart && date <= eventEnd;
    });
  }

  const eventsInCurrentMonth = useMemo(() => {
    if (!hasCalendarAccess) return [];

    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthEnd = endOfMonth(currentMonth);

    return loadEventDates.filter((event) => {
      const eventStart = new Date(event.StartDate + 'T00:00');
      const eventEnd = new Date(event.EndDate + 'T00:00');
      return eventStart <= currentMonthEnd && eventEnd >= currentMonthStart;
    });
  }, [loadEventDates, currentMonth, hasCalendarAccess]);

  const navigateToEvents = (path: string) => navigate({to: path});

  const addEventHandler = (date: Date) => {
    // Check if user has Event Creation access from module selection
    if (!hasEventCreationAccess) {
      toast.error(
        'Event Creation is not included in your current plan. Please upgrade to create events.',
      );
      return;
    }

    // Check if user can modify events
    if (!canModifyEvents) {
      toast.error('You do not have permission to create events');
      return;
    }

    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const addDatesToLocalStorage = (startDate: string, endDate: string) => {
    localStorage.setItem('startDate', startDate);
    localStorage.setItem('endDate', endDate);
  };

  function organizeEventsByWeek(
    allEvents: IEventTypes[],
    weekStart: Date,
    weekEnd: Date,
  ) {
    const filteredEvents = allEvents.filter((e) => {
      const start = new Date(e.StartDate + 'T00:00');
      const end = new Date(e.EndDate + 'T00:00');
      return end >= weekStart && start <= weekEnd;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const startA = new Date(a.StartDate + 'T00:00').getTime();
      const startB = new Date(b.StartDate + 'T00:00').getTime();
      if (startA === startB) {
        return (
          new Date(a.EndDate + 'T00:00').getTime() -
          new Date(b.EndDate + 'T00:00').getTime()
        );
      }
      return startA - startB;
    });

    const eventRows: Record<string, number> = {};
    const rowEndDates: Date[] = [];

    sortedEvents.forEach((event) => {
      const start = new Date(event.StartDate + 'T00:00');
      const end = new Date(event.EndDate + 'T00:00');

      let row = 0;
      while (row < rowEndDates.length) {
        if (start > rowEndDates[row]) break;
        row++;
      }

      eventRows[event.EventID] = row;
      rowEndDates[row] = end;
    });

    const maxRow = rowEndDates.length;

    return {
      events: sortedEvents,
      eventRows,
      maxRow,
    };
  }

  const renderEventsForWeek = (weekDays: Date[]) => {
    if (!hasCalendarAccess) return null;

    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const rowHeight = 24;

    const {events, eventRows} = organizeEventsByWeek(
      loadEventDates,
      weekStart,
      weekEnd,
    );

    return events.flatMap((event) => {
      const eventStart = new Date(event.StartDate + 'T00:00');
      const eventEnd = new Date(event.EndDate + 'T00:00');

      const clampedStart = eventStart < weekStart ? weekStart : eventStart;
      const clampedEnd = eventEnd > weekEnd ? weekEnd : eventEnd;

      let startCol = weekDays.findIndex((day) => isSameDay(day, clampedStart));
      let endCol = weekDays.findIndex((day) => isSameDay(day, clampedEnd));

      if (startCol === -1) startCol = 0;
      if (endCol === -1) endCol = 6;

      const colSpan = endCol - startCol + 1;
      const rowPosition = eventRows[event.EventID] ?? 0;
      const eventColor =
        statusColorMap[event.status as keyof typeof statusColorMap] ||
        'bg-gray-300';

      const gapPercentage = 1;
      const adjustedWidth = (colSpan * 100) / 7 - gapPercentage * 2;
      const adjustedLeft = (startCol * 100) / 7 + gapPercentage;

      return (
        <div
          key={`week-${weekStart.toISOString()}-event-${event.EventID}`}
          className="group absolute mt-2"
          style={{
            left: `${adjustedLeft}%`,
            width: `${adjustedWidth}%`,
            top: `calc(25px + ${rowPosition * rowHeight}px)`,
            height: `${rowHeight - 4}px`,
          }}
        >
          <div
            className={`${eventColor} h-full w-full cursor-pointer rounded-sm px-1`}
            onClick={(e) => {
              if (!canViewEvents) {
                toast.error(
                  'Calendar access is not included in your current plan',
                );
                return;
              }
              if (!canModifyEvents || user?.plan === 'FREE') {
                toast.error('Please upgrade your plan to view events');
                return;
              }
              e.stopPropagation();
              navigateToEvents(`/events/${event.EventID}`);
              addDatesToLocalStorage(event.StartDate, event.EndDate);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (canModifyEvents && hasEventCreationAccess) {
                setContextMenu({
                  visible: true,
                  x: e.pageX,
                  y: e.pageY,
                  event,
                });
              }
            }}
          >
            <p className="truncate text-xs text-white">
              {event.EventName}
              {event.isPremium && (
                <FaStar className="ml-1 inline text-yellow-500" size={10} />
              )}
            </p>
          </div>

          {/* Tooltip positioned below the event strip */}
          {user?.plan !== 'FREE' && canViewEvents && (
            <div
              className="pointer-events-none absolute left-1/2 z-[9999] hidden w-64 -translate-x-1/2 transform rounded-md border border-gray bg-graydark p-3 text-sm opacity-0 shadow-lg transition-opacity duration-200 group-hover:block group-hover:opacity-100 dark:border-graydark dark:bg-gray"
              style={{
                top: `calc(100% + 5px)`,
              }}
            >
              <div className="mb-1 font-semibold text-gray dark:text-black">
                {event.EventName}
                {event.isPremium && (
                  <FaStar className="ml-1 inline text-yellow-400" />
                )}
              </div>

              <div className="text-xs text-gray dark:text-graydark">
                <div>
                  <span className="font-medium">Client Name:</span>{' '}
                  {event?.client?.fullname}
                </div>

                <div>
                  <span className="font-medium">Subevent Address:</span>{' '}
                  {event?.subEvents?.[0]?.address || 'N/A'}
                  subEvent's address
                </div>
                <div>
                  <span className="font-medium">Start:</span>{' '}
                  {formatLocalTime(
                    data?.data?.events.find(
                      (e: {id: string}) => e.id === event.EventID,
                    )?.startDate,
                  )}
                </div>
                <div>
                  <span className="font-medium">End:</span>{' '}
                  {formatLocalTime(
                    data?.data?.events.find(
                      (e: {id: string}) => e.id === event.EventID,
                    )?.endDate,
                  )}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {event.status}
                </div>
                <div>
                  <span className="font-medium">Paid:</span>{' '}
                  {
                    data?.data?.events.find(
                      (e: {id: string}) => e.id === event.EventID,
                    )?.paid
                  }
                </div>
                <div>
                  <span className="font-medium">pending:</span>{' '}
                  {
                    data?.data?.events.find(
                      (e: {id: string}) => e.id === event.EventID,
                    )?.pending
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // If Calendar is not accessible, show message
  if (!hasCalendarAccess) {
    return (
      <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 flex h-96 items-center justify-center rounded-lg border bg-white p-8">
        <div className="text-center">
          <h2 className="text-gray-800 mb-2 text-xl font-semibold dark:text-white">
            Calendar Access Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Calendar module is not included in your current plan. Please upgrade
            to access the calendar.
          </p>
          <button
            onClick={() => navigate({to: '/module-wise'})}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <header className="flex items-center justify-between bg-primary p-4 text-white">
          <button onClick={handlePrevMonth} className="text-sm">
            <FaAngleLeft />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={handleNextMonth} className="text-sm">
            <FaAngleRight />
          </button>
        </header>

        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <th
                  key={day}
                  className="flex h-10 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length: days.length / 7}).map((_, rowIndex) => {
              const weekDays = days.slice(rowIndex * 7, rowIndex * 7 + 7);
              const {maxRow} = organizeEventsByWeek(
                loadEventDates,
                weekDays[0],
                weekDays[6],
              );

              return (
                <tr
                  key={rowIndex}
                  className="relative grid grid-cols-7"
                  style={{minHeight: `${(maxRow + 1) * 28}px`}}
                >
                  {weekDays.map((date, colIndex) => {
                    const isCurrentMonthDay =
                      date.getMonth() === currentMonth.getMonth() &&
                      date.getFullYear() === currentMonth.getFullYear();

                    return (
                      <td
                        key={colIndex}
                        className={`relative h-30 border border-stroke transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 md:p-1 ${
                          isToday(date)
                            ? 'bg-blue-100 text-white dark:bg-primary'
                            : ''
                        } ${
                          isBefore(date, new Date()) && !isToday(date)
                            ? 'text-gray-500 dark:text-gray-400 bg-gray dark:bg-graydark'
                            : isCurrentMonthDay
                              ? 'text-black dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                        } ${
                          canModifyEvents &&
                          hasEventCreationAccess && // Add module restriction
                          !isBefore(date, new Date()) &&
                          isCurrentMonthDay
                            ? 'hover:bg-gray-100 cursor-pointer dark:hover:bg-meta-4'
                            : 'cursor-default'
                        }`}
                        onClick={() => {
                          // Only allow adding events if user has permission and module access
                          if (canModifyEvents && hasEventCreationAccess) {
                            addEventHandler(date);
                          } else if (!hasEventCreationAccess) {
                            toast.error(
                              'Event Creation is not included in your current plan',
                            );
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const eventsForThisDay = getEventsForDay(date);
                          if (
                            eventsForThisDay.length > 0 &&
                            hasCalendarAccess
                          ) {
                            setContextMenu({
                              visible: true,
                              x: e.pageX,
                              y: e.pageY,
                              event: null,
                              dayEvents: eventsForThisDay,
                            });
                          }
                        }}
                      >
                        <span
                          className={`font-medium ${
                            isToday(date) && isCurrentMonthDay
                              ? 'flex h-6 w-6 items-center justify-center rounded-full text-xl font-semibold text-blue-500 dark:text-white'
                              : ''
                          }`}
                        >
                          {format(date, 'd')}
                        </span>
                      </td>
                    );
                  })}

                  {renderEventsForWeek(weekDays)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-10 mt-5 flex flex-wrap justify-center gap-4 text-center">
        <div className="flex items-center justify-center gap-2 sm:w-auto">
          <span
            className={`inline-block h-4 w-4 rounded-full ${statusColorMap['ENQUIRY']}`}
          ></span>
          <span className="text-xs font-bold">INQUIRY</span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:w-auto">
          <span
            className={`inline-block h-4 w-4 rounded-full ${statusColorMap['FINALIZED']}`}
          ></span>
          <span className="text-xs font-bold">FINALIZED</span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:w-auto">
          <span
            className={`inline-block h-4 w-4 rounded-full ${statusColorMap['PREPARATION']}`}
          ></span>
          <span className="text-xs font-bold">PREPARATION</span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:w-auto">
          <span
            className={`inline-block h-4 w-4 rounded-full ${statusColorMap['PAID']}`}
          ></span>
          <span className="text-xs font-bold">PAID</span>
        </div>
      </div>

      {isModalOpen && hasEventCreationAccess && (
        <EventModal
          showModal={isModalOpen}
          selectedDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isUpdateModalOpen && eventToEdit && (
        <UpdateEventModal
          showModal={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          eventData={eventToEdit}
        />
      )}

      {isPopup && (
        <ExpiryPopup
          onClose={handlePopupClose}
          daysRemaining={daysRemaining}
          expiryDate={data?.data?.expiry?.expiryDate || null}
        />
      )}

      {contextMenu.visible &&
        contextMenu.event &&
        canModifyEvents &&
        hasEventCreationAccess && (
          <div
            className="border-gray-300 fixed z-50 w-40 rounded-md bg-white text-sm shadow-md dark:bg-black dark:text-white"
            style={{top: contextMenu.y, left: contextMenu.x}}
          >
            <button
              className="hover:bg-gray-100 flex w-full items-center px-4 py-2 text-left"
              onClick={() => {
                confirmAlert({
                  title: 'Confirm Delete',
                  message: `Are you sure you want to delete this event and all related data? This action is permanent and cannot be undone.`,
                  buttons: [
                    {
                      label: 'Yes, Delete',
                      onClick: () => {
                        if (contextMenu.event?.EventID) {
                          deleteEvent(contextMenu.event.EventID);
                          setContextMenu((prev) => ({...prev, visible: false}));
                        }
                      },
                    },
                    {
                      label: 'No',
                      onClick: () => {
                        setContextMenu((prev) => ({...prev, visible: false}));
                      },
                    },
                  ],
                });
              }}
            >
              <MdDelete className="mr-2 text-graydark dark:text-white" />
              Delete Event
            </button>

            <button
              className="hover:bg-gray-100 flex w-full items-center px-4 py-2 text-left"
              onClick={() => {
                setEventToEdit(contextMenu.event);
                setIsUpdateModalOpen(true);
                setContextMenu((prev) => ({...prev, visible: false}));
              }}
            >
              <MdEdit className="mr-2 text-graydark dark:text-white" />
              Edit
            </button>
          </div>
        )}
    </>
  );
};

export default Calendar;
