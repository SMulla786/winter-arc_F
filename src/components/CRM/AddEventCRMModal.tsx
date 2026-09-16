/* eslint-disable */
import {useGetAllClient} from '@/lib/react-query/queriesAndMutations/cateror/client';
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
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import pin from '../../assets/images/pin.png';
import {FiMinus, FiPlus} from 'react-icons/fi';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import {useGetAllEmployee} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {role} from '@/types/auth';
import {useAuthContext} from '@/context/AuthContext';

// Create the schema for the whole object and then refine it
const eventValidationSchema = z
  .object({
    client: z.string().nonempty('Client is required'),
    eventName: z.string().nonempty('Event Name is required'),
    event: z.string().optional(),
    startDate: z.string().nonempty('Start Date is required'),
    startTime: z.string().nonempty('Start Time is required'),
    endTime: z.string().nonempty('End Time is required'),
    endDate: z.string().nonempty('End Date is required'),
    salesExecutiveId: z.string().optional(), // Keep it optional
    CRMPriority: z.string().nonempty('Priority is required').default('MEDIUM'),
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

const AddEventCRMModal: React.FC<EventModalProps> = ({
  showModal,
  selectedDate,
  onClose,
  onSave,
}) => {
  const navigate = useNavigate();

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
      startTime: '10:00',
      endTime: '19:00',
      salesExecutiveId: '', // Empty by default
      CRMPriority: 'MEDIUM',
    },
  });

  if (!showModal) return null;
  const {handleSubmit, reset, setValue, watch} = methods;

  const searchText = watch('client');
  const {user} = useAuthContext();

  const {data: clients} = useGetAllClient();
  const {data: events, refetch: refetchEvents} = useGetAllEvents();
  const {mutateAsync: postPin} = useAssignPin();
  const {mutate: createEvent, isPending: isCreating} = useCreateEvent();
  const {data: employeesData} = useGetAllEmployee();
  const restriction = user?.employeeRestriction?.crmdashboardpage;
  const role = user?.role;

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
    // Check form validity
    const isValid = methods.formState.isValid;
    const errors = methods.formState.errors;

    const existingEvents = eventsData?.data?.events || [];
    const isEventNameExist = existingEvents.some(
      (event: {name: string}) => event.name === formData.eventName,
    );

    if (isEventNameExist) {
      toast.error('Event name already exists!');
      return;
    }

    // Combine date and time
    const startDateTimeIST = new Date(
      `${formData.startDate}T${formData.startTime}:00`,
    ).toISOString();

    const endDateTimeIST = new Date(
      `${formData.endDate}T${formData.endTime}:00`,
    ).toISOString();

    // Build the payload - salesExecutiveId is optional
    const eventPayload: {
      clientId: string;
      name: string;
      startDate: string;
      endDate: string;
      eventId?: string;
      salesExecutiveId?: string;
      CRMPriority: string;
    } = {
      clientId: formData.client,
      name: formData.eventName,
      startDate: startDateTimeIST,
      endDate: endDateTimeIST,
      CRMPriority: formData.CRMPriority,
    };

    // Add optional fields only if they have values
    if (formData.event) {
      eventPayload.eventId = formData.event;
    }

    // Only add salesExecutiveId if it has a value
    if (formData.salesExecutiveId && formData.salesExecutiveId.trim() !== '') {
      eventPayload.salesExecutiveId = formData.salesExecutiveId;
    }

    // ✅ Call createEvent with onSuccess callback
    createEvent(eventPayload, {
      onSuccess: () => {
        // toast.success('Event created successfully!');
        reset();
        onClose();

        if (onSave) {
          onSave(methods.getValues());
        }

        navigate({to: '/eventcrm'});
      },
      onError: (error) => {
        toast.error('Failed to create event. Please try again.');
      },
    });
  };

  // Update startDate, endDate, startTime, and endTime when selectedDate changes
  useEffect(() => {
    setValue('CRMPriority', 'MEDIUM');
    if (selectedDate) {
      const newStartDate = addDays(selectedDate, 1).toISOString().split('T')[0];
      setValue('startDate', newStartDate);
      setValue('endDate', newStartDate);
      setValue('startTime', '10:00');
      setValue('endTime', '19:00');
    }
  }, [selectedDate, setValue]);

  const navigateToCustomer = () => {
    navigate({
      to: '/addclient',
    });
  };

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
      toast.success(
        `Event ${newPinState ? 'Pinned' : 'Unpinned'} successfully.`,
      );
      await refetchEvents();

      // If unpinning the currently selected event, clear the selection
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
            <GenericButton onClick={navigateToCustomer}>
              Add Customer
            </GenericButton>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(handleFormSubmit)(e);
              }}
              className="space-y-4"
            >
              <GenericSearchDropdown
                name="client"
                label="Client"
                options={FormattedClients || []}
                onSearchTextChange={(text) => setClientSearchText(text)}
              />

              <GenericInputField
                name="eventName"
                label="Event Name"
                placeholder="Enter Event Name"
              />

              <div className="grid grid-cols-2 gap-4">
                <GenericInputField
                  name="startDate"
                  label="Start Date"
                  placeholder="Select Start Date"
                  type="date"
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
                  className="flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-4 text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  {showExtraFields ? (
                    <>
                      <FiMinus className="h-4 w-4" />
                      Hide info
                    </>
                  ) : (
                    <>
                      <FiPlus className="h-4 w-4" />
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
                        Copy Event (Optional)
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
                      label="Sales Executive (Optional)"
                      options={employeesOptions || []}
                      placeholder="Select sales executive (optional)"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <GenericDropdown
                      name="CRMPriority"
                      label="CRM Priority"
                      options={[
                        {label: 'Low', value: 'LOW'},
                        {label: 'Medium', value: 'MEDIUM'},
                        {label: 'High', value: 'HIGH'},
                      ]}
                      defaultValue="MEDIUM"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                {(role === 'CATEROR' ||
                  restriction === 'VIEW' ||
                  restriction === 'EDIT') && (
                  <>
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

                    <GenericButton type="submit" disabled={isCreating}>
                      {isCreating ? 'Saving...' : 'Save & Proceed'}
                    </GenericButton>
                  </>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
};

export default AddEventCRMModal;
