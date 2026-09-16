/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import Select from 'react-select';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useGetAllEventsWithSubEventsPO,
  useSubmitEventPOInward,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import GenericTable from '../Forms/Table/GenericTable';
import {useOutwardEvent} from './storeApi';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAuthContext} from '@/context/AuthContext';

interface EventsOutwardProps {
  hasEditAccess: boolean;
}
const EventsOutward: React.FC<EventsOutwardProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [editableQuantityValues, setEditableQuantityValues] = useState<{
    [key: string]: number;
  }>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const methods = useForm({
    defaultValues: {event: ''},
  });
  const {handleSubmit, setValue} = methods;
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.outwordStore;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';
  const {data: eventsData, isLoading: isEventsLoading} =
    useGetAllEventsWithSubEventsPO();
  const {mutate: submitEventPO, isPending: isSubmittingEventPO} =
    useSubmitEventPOInward();
  const {data: outwardEvent} = useOutwardEvent(selectedEventId);

  // Initialize editable quantities
  useEffect(() => {
    if (selectedEventId && outwardEvent) {
      const initialQuantities = outwardEvent.reduce(
        (acc: {[key: string]: number}, item: any) => {
          acc[item.rawmaterialId] = 0;
          return acc;
        },
        {},
      );
      setEditableQuantityValues(initialQuantities);
    }
  }, [selectedEventId, outwardEvent]);

  // Build event options
  const eventOptions = useMemo(() => {
    if (!eventsData?.data) return [];
    return eventsData.data.map((event: any) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      return {
        label: `${event.name} - ${dateRange}${event.venue ? ` - ${event.venue}` : ''}`,
        value: event.id,
        data: event,
      };
    });
  }, [eventsData?.data]);

  // Build table data
  const tableData = useMemo(() => {
    if (!outwardEvent || !selectedEventId) return [];

    const grouped: {[key: string]: any} = {};

    outwardEvent.forEach((item: any) => {
      const id = item.rawmaterialId;
      if (!grouped[id]) {
        grouped[id] = {
          id,
          category: item.category || 'Uncategorized',
          name: item.rawmaterialName || 'Unknown Material',
          unit: item.unit || 'unit',
          eventQuantity: item.quantity || 0,
          inventory: item.inventory || 0,
        };
      } else {
        // Combine duplicate material quantities
        grouped[id].eventQuantity += item.quantity || 0;
        grouped[id].inventory = item.inventory || 0; // optional — remove if you want unique inventory values
      }
    });

    return Object.values(grouped).map((item: any) => ({
      ...item,
      outwardQuantity: editableQuantityValues[item.id] ?? 0,
    }));
  }, [outwardEvent, selectedEventId, editableQuantityValues]);

  // Extract unique categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(tableData.map((item) => item.category)));
    return unique;
  }, [tableData]);

  // Set first tab active automatically
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Filter table by category
  const filteredTableData = useMemo(() => {
    return tableData.filter((item) => item.category === activeCategory);
  }, [tableData, activeCategory]);

  // Table columns (no Category column)
  const tableColumns = useMemo(
    () => [
      {header: 'Material Name', accessor: 'name'},
      // {header: 'Unit', accessor: 'unit'},
      {
        header: 'Event Quantity',
        accessor: 'eventQuantity',
        render: (item: any) =>
          Number(item.eventQuantity?.toFixed(2)) === 0
            ? '0'
            : `${item.eventQuantity?.toFixed(2)}`.replace(/\.00$/, ''),
      },
      {
        header: 'Inventory',
        accessor: 'inventory',
        render: (item: any) => `${item.inventory || 0}`,
      },
      {
        header: 'Outword Qty',
        accessor: 'outword',
        render: (item: any) => `${item.outword || 0}`,
      },
      {
        header: 'Outward Quantity',
        accessor: 'outwardQuantity',
        render: (item: any) => (
          <input
            type="number"
            value={editableQuantityValues[item.id] ?? ''}
            onChange={(e) => {
              const value = Number(e.target.value) || 0;
              if (value > item.inventory) {
                setErrorMessage(
                  `Insufficient inventory for ${item.name}: ${item.inventory} ${item.unit} available`,
                );
                return;
              }
              setEditableQuantityValues((prev) => ({
                ...prev,
                [item.id]: value,
              }));
              setHasChanges(true);
              setErrorMessage('');
            }}
            className="border-gray-300 w-full rounded border px-2 py-1 text-sm dark:border-strokedark dark:bg-boxdark"
            placeholder="Enter quantity"
            min="0"
            max={item.inventory}
          />
        ),
      },
      {header: 'Unit', accessor: 'unit'},
    ],
    [editableQuantityValues],
  );

  // Handle event select
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setValue('event', eventId);
    const selectedEventData = eventOptions.find(
      (option: any) => option.value === eventId,
    )?.data;
    setSelectedEvent(selectedEventData || null);
    setErrorMessage('');
    setHasChanges(false);
    setEditableQuantityValues({});
    setActiveCategory('');
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const onSubmit = async (data: any) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      if (data.event && tableData.length > 0) {
        const materialsWithQuantities = tableData
          .filter((item: any) => (editableQuantityValues[item.id] || 0) > 0)
          .map((item: any) => {
            const quantity = editableQuantityValues[item.id] || 0;
            if (quantity > (item.inventory || 0)) {
              throw new Error(
                `Insufficient inventory of ${item.name}: ${item.inventory} ${item.unit} available`,
              );
            }
            return {
              materialId: item.id,
              quantity,
              category: item.category,
              eventId: selectedEventId,
              venue: selectedEvent?.venue || 'Store',
            };
          });

        if (materialsWithQuantities.length === 0) {
          setErrorMessage('Please enter quantities for at least one material');
          return;
        }

        await submitEventPO(
          {
            eventId: selectedEventId,
            materials: materialsWithQuantities,
            type: 'OUTWORD',
          },
          {
            onSuccess: () => {
              showSuccessMessage('Event materials issued successfully!');
              methods.reset();
              setSelectedEventId('');
              setSelectedEvent(null);
              setEditableQuantityValues({});
              setHasChanges(false);
              setActiveCategory('');
            },
            onError: (error: any) => {
              setErrorMessage(
                error.response?.data?.message ||
                  error.message ||
                  'An error occurred during event submission',
              );
            },
          },
        );
      } else {
        setErrorMessage('Please select an event and add materials');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during submission');
    }
  };

  return (
    <div>
      {errorMessage && (
        <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Selection */}
        <div>
          <label className="mb-1 block font-medium">Event</label>
          <Select
            options={eventOptions}
            value={eventOptions.find(
              (option: any) => option.value === selectedEventId,
            )}
            onChange={(val: any) => handleEventSelect(val?.value || '')}
            placeholder="Select Event"
            isLoading={isEventsLoading}
          />
          {selectedEvent && (
            <div className="text-gray-600 mt-2 text-sm">
              <div>Venue: {selectedEvent.venue}</div>
              <div>
                {new Date(selectedEvent.startDate).toLocaleDateString()} -{' '}
                {new Date(selectedEvent.endDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs + Table */}
        {categories.length > 0 && (
          <div className="mt-6">
            {/* Tabs */}
            <div className="border-gray-300 mb-4 flex flex-wrap gap-2 border-b pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Category Table */}
            {filteredTableData.length > 0 ? (
              <GenericTable
                data={filteredTableData}
                columns={tableColumns as any}
                itemsPerPage={100}
                searchAble={true}
              />
            ) : (
              <p className="text-gray-500 text-sm">
                No materials in this category.
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        {hasEditAccess && (
          <div className="flex justify-end">
            <GenericButton
              type="submit"
              disabled={
                isSubmittingEventPO ||
                !selectedEventId ||
                tableData.length === 0 ||
                !hasChanges
              }
            >
              {isSubmittingEventPO ? 'Saving...' : 'Save Events Outward'}
            </GenericButton>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventsOutward;
