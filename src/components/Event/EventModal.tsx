/* eslint-disable */
import {useGetAllClient} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {useGetAllEmployee} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {
  useAssignPin,
  useCreateEvent,
  useGetAllEvents,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from '@tanstack/react-router';
import {addDays} from 'date-fns';
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import {FiMinus, FiPlus} from 'react-icons/fi';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import {z} from 'zod';
import pin from '../../assets/images/pin.png';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import GenericInputField from '../Forms/Input/GenericInputField';
import ClientDropdown from './ClientDropdown';
import {useQuery} from '@tanstack/react-query';
import {api} from '@/utils/axios';

// Create the schema for the whole object and then refine it
const eventValidationSchema = z
  .object({
    client: z.string().nonempty('Client is required'),
    eventName: z.string().nonempty('Event Name is required'),
    eventType: z.string().optional(),
    event: z.string().optional(),
    startDate: z.string().nonempty('Start Date is required'),
    startTime: z.string().nonempty('Start Time is required'),
    endTime: z.string().nonempty('End Time is required'),
    endDate: z.string().nonempty('End Date is required'),
    salesExecutiveId: z.string().optional(),
    crmPriority: z.string().optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'End Date must be after Start Date',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof eventValidationSchema>;

interface EventModalProps {
  showModal: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSave?: (data: FormValues) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  showModal,
  selectedDate,
  onClose,
}) => {
  const defaultStartDate = selectedDate
    ? addDays(selectedDate, 1).toISOString().split('T')[0]
    : '';

  const methods = useForm<FormValues>({
    resolver: zodResolver(eventValidationSchema),
    defaultValues: {
      client: '',
      eventName: '',
      event: '',
      startDate: defaultStartDate,
      endDate: defaultStartDate,
      startTime: '10:00', // Set default to 10 AM in 24-hour format
      endTime: '19:00', // Set default to 5 PM in 24-hour format
      salesExecutiveId: '',
      crmPriority: '',
    },
  });

  if (!showModal) return null;
  const {handleSubmit, reset, setValue, watch} = methods;

  const useGetEventType = () => {
    return useQuery({
      queryKey: ['eventType'],
      queryFn: () => api.get('/cateror/eventTypes').then((res) => res.data),
    });
  };

  const searchText = watch('client');
  const {data: eventType} = useGetEventType();
  const {data: clients} = useGetAllClient();
  const {data: events, refetch: refetchEvents} = useGetAllEvents();
  const {mutateAsync: postPin} = useAssignPin();
  const {mutate: createEvent, isSuccess, isError} = useCreateEvent();
  const {data: employeesData} = useGetAllEmployee();
  const employeesOptions = employeesData?.data?.map(
    (emp: {id: string; fullname: string}) => ({
      label: emp.fullname,
      value: emp.id,
    }),
  );

  const [FormattedClients, setFormattedClients] = useState<any>([]);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [clientSearchText, setClientSearchText] = useState('');

  useMemo(() => {
    const formatted =
      clients?.data?.map((client: {id: string; user: {fullname: string}}) => ({
        label: client.user.fullname,
        value: client.id,
      })) || [];
    setFormattedClients(formatted);
  }, [clients]);

  const {data: eventsData} = useGetAllEvents();

  const toggleDateFields = () => {
    setShowExtraFields(!showExtraFields);
  };

  const handleFormSubmit = (formData: FormValues) => {
    const existingEvents = eventsData?.data?.events || [];
    const isEventNameExist = existingEvents.some(
      (event: {name: string}) => event.name === formData.eventName,
    );

    if (isEventNameExist) {
      toast.error('Event name already exists!');
      return;
    }

    // Combine date and time, and convert to UTC ISO string
    const startDateTimeIST = new Date(
      `${formData.startDate}T${formData.startTime}:00Z`, // Ensure seconds are included
    ).toISOString();
    const endDateTimeIST = new Date(
      `${formData.endDate}T${formData.endTime}:00Z`,
    ).toISOString();

    const eventPayload: {
      clientId: string;
      name: string;
      evntTypeId?: string;
      startDate: string;
      endDate: string;
      eventId?: string;
      salesExecutiveId?: string;
      crmPriority?: string;
    } = {
      clientId: formData.client,
      name: formData.eventName,
      ...(formData.eventType && {evntTypeId: formData.eventType}),
      startDate: startDateTimeIST,
      endDate: endDateTimeIST,
      ...(formData.salesExecutiveId && {
        salesExecutiveId: formData.salesExecutiveId,
      }),
      crmPriority: formData.crmPriority,
    };

    if (formData.event) {
      eventPayload.eventId = formData.event;
    }
    // console.log('Event Payload:', eventPayload);
    createEvent(eventPayload);
    onClose();
  };

  // Update startDate, endDate, startTime, and endTime when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const newStartDate = addDays(selectedDate, 1).toISOString().split('T')[0];
      setValue('startDate', newStartDate);
      setValue('endDate', newStartDate);
      setValue('startTime', '10:00'); // Enforce 10 AM
      setValue('endTime', '19:00'); // Enforce 5 PM
    }
  }, [selectedDate, setValue]);

  const navigate = useNavigate();
  // In EventModal.tsx, update navigateToCustomer:
  const navigateToCustomer = () => {
    navigate({
      to: '/client',
      state: {
        showCreateForm: true, // This will trigger the CreateClient form
        clientSearchText: clientSearchText, // Prefill the name
      },
    });
    onClose(); // Close the event modal
  };

  type EventType = {
    eventId: string;

    pinned: boolean;
  };

  // Top of component (inside EventModal)
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [isPinned, setIsPinned] = useState<boolean>(false);

  // Update checkbox when selectedEventId changes
  useEffect(() => {
    const selected = events?.data?.events?.find(
      (e: any) => e.id === selectedEventId,
    );
    if (selected) {
      setIsPinned(selected.pinned);
      setValue('event', selected.id);
    } else {
      setIsPinned(false);
    }
  }, [selectedEventId, events, setValue]);

  const handlePinToggle = async (eventId: string, newPinState: boolean) => {
    try {
      await postPin({eventId, pinned: newPinState});
      toast.success(`Event ${newPinState ? '' : 'Unpinned'} successfully.`);
      await refetchEvents();

      // 🟡 If unpinning the currently selected event, clear the selection
      if (!newPinState && eventId === selectedEventId) {
        setSelectedEventId(undefined);
      }
    } catch (error) {
      toast.error('Failed to update pin status.');
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectedEvent = events?.data?.events?.find(
    (e: any) => e.id === selectedEventId,
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>

      <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
        <div className="w-full max-w-xs rounded-md bg-white p-6 shadow-lg dark:bg-black sm:max-w-sm md:w-1/2">
          <div className="flex justify-between">
            <h3 className="mb-4 text-lg font-bold">Add Event</h3>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              {/* <GenericSearchDropdown
                name="client"
                label="Client"
                options={FormattedClients || []}
                onSearchTextChange={(text) => setClientSearchText(text)}
              /> */}
              {/* <GenericButton onClick={navigateToCustomer}>
                Add Customer
              </GenericButton> */}
              <ClientDropdown
                FormattedClients={FormattedClients}
                setClientSearchText={setClientSearchText}
                navigateToCustomer={navigateToCustomer}
              />

              <GenericInputField
                name="eventName"
                label="Event Name"
                placeholder="Enter Event Name"
              />

              <GenericDropdown
                name="eventType"
                label="Event Type"
                options={
                  eventType?.map((et: any) => ({
                    value: et.id,
                    label: et.name,
                  })) || []
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <GenericInputField
                  name="startDate"
                  label="Start Date"
                  placeholder="Select Start Date"
                  type="date"
                  disabled
                />
                <GenericInputField
                  name="startTime"
                  label="Start Time"
                  placeholder="Select Start Time"
                  type="time"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <GenericInputField
                  name="endDate"
                  label="End Date"
                  placeholder="Select End Date"
                  type="date"
                />
                <GenericInputField
                  name="endTime"
                  label="End Time"
                  placeholder="Select End Time"
                  type="time"
                />
              </div>

              {/* Add Button for Date Fields */}
              <div className="col-span-12">
                <button
                  type="button"
                  onClick={toggleDateFields}
                  className="flex items-center rounded-lg border border-blue-500 bg-blue-50 px-1 text-sm text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  {showExtraFields ? (
                    <>
                      <FiMinus className="h-3 w-3" />
                      Hide info
                    </>
                  ) : (
                    <>
                      <FiPlus className="h-3 w-3" />
                      More info
                    </>
                  )}
                </button>
              </div>

              {/* Conditionally Rendered Date Fields */}
              {showExtraFields && (
                <>
                  <div className="col-span-12 md:col-span-6">
                    {/* Copy Event Dropdown */}
                    <div className="relative mb-4">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Copy Event
                      </label>

                      <div className="relative">
                        <button
                          type="button"
                          className="text-gray-600 flex w-full items-center justify-between rounded-md border border-stroke bg-white px-3 py-2 text-sm focus:outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          onClick={() => setIsDropdownOpen((prev) => !prev)}
                        >
                          <span className="flex items-center gap-2">
                            {selectedEvent?.name || 'Select event'}
                          </span>

                          <span>
                            {isDropdownOpen ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                          </span>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-stroke bg-white shadow-lg dark:border-form-strokedark dark:bg-form-input">
                            {events?.data?.events
                              ?.slice()
                              .sort((a: any, b: any) =>
                                a.pinned && !b.pinned
                                  ? -1
                                  : !a.pinned && b.pinned
                                    ? 1
                                    : 0,
                              )
                              .map((event: any) => (
                                <div
                                  key={event.id}
                                  className={`hover:bg-gray-200 dark:hover:bg-gray-600 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
                                    selectedEventId === event.id
                                      ? 'bg-gray-300 dark:bg-gray-700'
                                      : ''
                                  }`}
                                >
                                  {/* Event select logic */}
                                  <span
                                    className="flex flex-1 items-center gap-2"
                                    onClick={async () => {
                                      try {
                                        if (!event.pinned) {
                                          await postPin({
                                            eventId: event.id,
                                            pinned: true,
                                          });
                                          toast.success(
                                            'Event pinned successfully.',
                                          );
                                          await refetchEvents();
                                        }
                                        setSelectedEventId(event.id);
                                        setIsDropdownOpen(false);
                                      } catch (error) {
                                        toast.error('Failed to pin event.');
                                      }
                                    }}
                                  >
                                    {event.name}
                                  </span>

                                  {/* Pin/Unpin button */}
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        if (event.pinned) {
                                          await postPin({
                                            eventId: event.id,
                                            pinned: false,
                                          });

                                          if (selectedEventId === event.id) {
                                            setSelectedEventId(null);
                                            setIsPinned(false);
                                          }

                                          toast.success(
                                            'Event Unpinned successfully.',
                                          );
                                          await refetchEvents();
                                        } else {
                                          toast.info(
                                            'You can only pin by selecting the event.',
                                          );
                                        }
                                      } catch {
                                        toast.error(
                                          'Failed to update pin status.',
                                        );
                                      }
                                    }}
                                    className={`hover:bg-gray-300 dark:hover:bg-gray-500 rounded p-1 transition-colors ${
                                      event.pinned
                                        ? 'text-yellow-500'
                                        : 'text-gray-400 hover:text-yellow-500'
                                    }`}
                                  >
                                    <img
                                      src={pin}
                                      alt="pin"
                                      className={`h-4 w-4 transition-opacity ${
                                        event.pinned
                                          ? 'opacity-100'
                                          : 'opacity-50'
                                      }`}
                                    />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <GenericDropdown
                      name="salesExecutiveId"
                      label="Sales Executive"
                      options={employeesOptions || []}
                      // control={methods.control}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <GenericDropdown
                      name="crmPriority"
                      label="Event Priority"
                      options={[
                        {label: 'Low', value: 'low'},
                        {label: 'Medium', value: 'medium'},
                        {label: 'High', value: 'high'},
                      ]}
                      // control={methods.control}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="bg-gray-200 rounded border-2 border-stroke px-4 py-2"
                >
                  Cancel
                </button>
                <GenericButton type="submit">Save & Proceed</GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
};

export default EventModal;
