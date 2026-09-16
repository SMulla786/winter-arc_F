/* eslint-disable */
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import Select from 'react-select';
import GenericButton from '../../Forms/Buttons/GenericButton';
import {
  useGetAllEventsWithSubEventsPO,
  useSubmitReturnStore,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useRawMaterialReturnByEventId} from '../storeApi';
import {FiChevronDown, FiChevronRight} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';

const returnSchema = z.object({
  event: z.string().min(1, 'Event is required'),
});
type ReturnFormValues = z.infer<typeof returnSchema>;

interface ReturnInventoryItem {
  rawmaterialId: string;
  rawmaterialName: string;
  unit: string;
  category: string;
  quantity: number;
  inventory: number;
  preparation: number;
  subeventId: string;
  subeventName: string;
  inword: number;
}

interface TableRow {
  id: string;
  name: string;
  unit: string;
  category: string;
  quantity: number;
  inword: number;
  subeventName?: string;
}
interface RawMaterialReturnInwardProps {
  hasEditAccess?: boolean;
}
const RawMaterialReturnInward: React.FC<RawMaterialReturnInwardProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [tableQuantities, setTableQuantities] = useState<{[k: string]: number}>(
    {},
  );
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [eventsInwordStatus, setEventsInwordStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const {control, handleSubmit, reset, setValue} = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {event: ''},
  });
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.inwordStore;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  const {data: eventsData, isLoading: isEventsLoading} =
    useGetAllEventsWithSubEventsPO();
  const {mutate: submitRawMaterialReturn, isPending: isSubmittingReturn} =
    useSubmitReturnStore();
  const {data: rawMaterialReturnByEventId} =
    useRawMaterialReturnByEventId(selectedEventId);

  /* ---------------------------------------- */
  /* Update inword status cache when data loads */
  /* ---------------------------------------- */
  useEffect(() => {
    if (rawMaterialReturnByEventId && selectedEventId) {
      const items = Array.isArray(rawMaterialReturnByEventId)
        ? rawMaterialReturnByEventId
        : [rawMaterialReturnByEventId];

      const hasInworded = items.some(
        (item: any) => item.inword && item.inword > 0,
      );

      setEventsInwordStatus((prev) => ({
        ...prev,
        [selectedEventId]: hasInworded,
      }));
    }
  }, [rawMaterialReturnByEventId, selectedEventId]);

  /* ---------------------------------------- */
  /* Build Select Options                     */
  /* ---------------------------------------- */
  const eventOptions = useMemo(() => {
    if (!eventsData?.data) return [];

    return eventsData.data.map((e: any) => {
      const startDate = new Date(e.startDate);
      const endDate = new Date(e.endDate);
      const startDateStr = startDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const endDateStr = endDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const hasInworded = eventsInwordStatus[e.id] || false;
      const inwordText = hasInworded ? ' (inword)' : '';

      return {
        label: `${e.name} - ${startDateStr} to ${endDateStr}${e.venue ? ` - ${e.venue}` : ''}${inwordText}`,
        value: e.id,
        data: e,
        hasInworded: hasInworded,
      };
    });
  }, [eventsData, eventsInwordStatus]);

  /* ---------------------------------------- */
  /* Reset table when event changes           */
  /* ---------------------------------------- */
  useEffect(() => {
    if (selectedEventId) {
      setTableQuantities({});
      setHasChanges(false);
      setExpandedCategories({});
    }
  }, [selectedEventId]);

  /* ---------------------------------------- */
  /* Load existing returned materials         */
  /* ---------------------------------------- */
  useEffect(() => {
    if (!rawMaterialReturnByEventId) return;

    const qtyMap: {[id: string]: number} = {};
    const arr = Array.isArray(rawMaterialReturnByEventId)
      ? rawMaterialReturnByEventId
      : [rawMaterialReturnByEventId];

    arr.forEach((i: ReturnInventoryItem) => {
      qtyMap[i.rawmaterialId] = 0;
    });

    setTableQuantities(qtyMap);
  }, [rawMaterialReturnByEventId]);

  /* ---------------------------------------- */
  /* Build table data with grouping           */
  /* ---------------------------------------- */
  const groupedReturnMaterials = useMemo(() => {
    if (!rawMaterialReturnByEventId) return {};

    const items = Array.isArray(rawMaterialReturnByEventId)
      ? rawMaterialReturnByEventId
      : [rawMaterialReturnByEventId];

    const groupedByCategory: Record<string, any[]> = {};

    items.forEach((item: ReturnInventoryItem) => {
      const materialData = {
        id: item.rawmaterialId,
        name: item.rawmaterialName,
        category: item.category || 'Uncategorized',
        unit: item.unit,
        inword: item.inword || 0,
        quantity: 0,
        subeventName: item.subeventName || 'Main Event',
      };

      if (!groupedByCategory[materialData.category]) {
        groupedByCategory[materialData.category] = [];
      }
      groupedByCategory[materialData.category].push(materialData);
    });

    return groupedByCategory;
  }, [rawMaterialReturnByEventId, tableQuantities]);

  /* ---------------------------------------- */
  /* Toggle category expansion                */
  /* ---------------------------------------- */
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  /* ---------------------------------------- */
  /* Handle quantity change                   */
  /* ---------------------------------------- */
  const handleQuantityChange = (materialId: string, quantity: number) => {
    setTableQuantities((prev) => ({
      ...prev,
      [materialId]: quantity,
    }));
    setHasChanges(true);
    setErrorMessage('');
  };

  /* ---------------------------------------- */
  /* Auto-expand all categories when data loads */
  /* ---------------------------------------- */
  useEffect(() => {
    if (Object.keys(groupedReturnMaterials).length > 0) {
      const newExpanded: Record<string, boolean> = {};
      Object.keys(groupedReturnMaterials).forEach((category) => {
        newExpanded[category] = true;
      });
      setExpandedCategories(newExpanded);
    }
  }, [groupedReturnMaterials]);

  /* ---------------------------------------- */
  /* Event change handling                    */
  /* ---------------------------------------- */
  const onSelectEvent = (value: string) => {
    setSelectedEventId(value);
    setValue('event', value);
    const ev = eventOptions.find((o: any) => o.value === value)?.data;
    setSelectedEvent(ev ?? null);
    setErrorMessage('');
    setHasChanges(false);
  };

  /* ---------------------------------------- */
  /* Calculate category totals                */
  /* ---------------------------------------- */
  const calculateCategoryTotal = useCallback(
    (materials: any[]) => {
      return materials.reduce((total, mat) => {
        const returnQty = tableQuantities[mat.id] ?? 0;
        const eventReturn = mat.inword || 0;
        return returnQty - eventReturn;
      }, 0);
    },
    [tableQuantities],
  );

  /* ---------------------------------------- */
  /* Submit function                          */
  /* ---------------------------------------- */
  const onSubmit = (data: ReturnFormValues) => {
    const materialsToSubmit: any[] = [];

    Object.values(groupedReturnMaterials).forEach((categoryMaterials) => {
      categoryMaterials.forEach((material) => {
        const qty = tableQuantities[material.id] ?? 0;
        if (qty > 0) {
          materialsToSubmit.push({
            materialId: material.id,
            quantity: qty,
            price: 0,
          });
        }
      });
    });

    if (materialsToSubmit.length === 0) {
      setErrorMessage('Please enter quantity for at least one material.');
      return;
    }

    submitRawMaterialReturn(
      {
        materials: materialsToSubmit,
        type: 'INWORD',
        eventId: data.event,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Raw Material Return submitted successfully!');
          setTimeout(() => setSuccessMessage(''), 4000);
          reset();
          setTableQuantities({});
          setSelectedEvent(null);
          setSelectedEventId('');
          setErrorMessage('');
          setHasChanges(false);

          setEventsInwordStatus((prev) => ({
            ...prev,
            [data.event]: true,
          }));
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message || err?.message || 'Save failed';
          setErrorMessage(msg);
        },
      },
    );
  };

  return (
    <div className="relative">
      {/* Error / Success Messages */}
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
        {/* Filter Section */}
        <div className="rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-meta-4">
          <h3 className="text-gray-800 mb-3 text-lg font-semibold dark:text-white">
            Select Event for Return Inward
          </h3>

          <div>
            <label className="mb-1 block font-medium">Event</label>
            <Controller
              control={control}
              name="event"
              render={({field}) => (
                <Select
                  {...field}
                  options={eventOptions}
                  value={
                    eventOptions.find((o: any) => o.value === field.value) ||
                    null
                  }
                  onChange={(v) => onSelectEvent(v?.value || '')}
                  placeholder="Select Event"
                  isLoading={isEventsLoading}
                  styles={{
                    option: (base, {data}: any) => ({
                      ...base,
                      color: data.hasInworded ? '#000000' : base.color,
                      fontWeight: data.hasInworded ? '600' : base.fontWeight,
                    }),
                    singleValue: (base, {data}: any) => ({
                      ...base,
                      color: data?.hasInworded ? '#000000' : base.color,
                      fontWeight: data?.hasInworded ? '600' : base.fontWeight,
                    }),
                  }}
                />
              )}
            />

            {selectedEvent && (
              <div className="text-gray-600 mt-2 text-sm">
                <div>Venue: {selectedEvent.venue}</div>
                <div>
                  {new Date(selectedEvent.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedEvent.endDate).toLocaleDateString()}
                </div>
                {selectedEvent.hasInworded && (
                  <div className="mt-1 font-medium text-black">
                    This event has already been inwarded
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Table Section - Matching PO Inward Design */}
        {Object.keys(groupedReturnMaterials).length > 0 ? (
          <div className="mt-6">
            <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
              <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                    Return Materials
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    Event: {selectedEvent?.name}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                  <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Raw Material
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Sub Event
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Event Return
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Return Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Difference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                    {Object.keys(groupedReturnMaterials).map(
                      (category, categoryIndex) => {
                        const materials = groupedReturnMaterials[category];
                        const categoryTotal = calculateCategoryTotal(materials);
                        const isExpanded =
                          expandedCategories[category] !== false;

                        return (
                          <React.Fragment key={category}>
                            {/* Category Header Row */}
                            <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                              <td colSpan={6} className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div
                                    className="flex cursor-pointer items-center gap-2"
                                    onClick={() => toggleCategory(category)}
                                  >
                                    {isExpanded ? (
                                      <FiChevronDown className="h-4 w-4" />
                                    ) : (
                                      <FiChevronRight className="h-4 w-4" />
                                    )}
                                    <span className="text-gray-800 font-semibold dark:text-white">
                                      {category}
                                    </span>
                                    <span className="text-gray-500 text-sm font-normal">
                                      ({materials.length} items)
                                    </span>
                                  </div>
                                  {/* <div className="text-gray-700 text-sm">
                                    Category Difference: 
                                    <span className={`ml-2 font-bold ${
                                      categoryTotal === 0
                                        ? 'text-gray-600'
                                        : categoryTotal > 0
                                          ? 'text-blue-600'
                                          : 'text-red-600'
                                    }`}>
                                      {categoryTotal}
                                    </span>
                                  </div> */}
                                </div>
                              </td>
                            </tr>

                            {/* Category Items - Only show when expanded */}
                            {isExpanded &&
                              materials.map((material, materialIndex) => {
                                const returnQty =
                                  tableQuantities[material.id] ?? 0;
                                const eventReturn = material.inword || 0;
                                const diff = returnQty - eventReturn;
                                const rowBg =
                                  materialIndex % 2 === 0
                                    ? 'bg-white'
                                    : 'bg-gray-50';

                                return (
                                  <tr
                                    key={material.id}
                                    className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${rowBg}`}
                                  >
                                    {/* Raw Material Name */}
                                    <td className="px-4 py-3">
                                      <div className="text-gray-800 text-sm font-medium dark:text-white">
                                        {material.name}
                                      </div>
                                    </td>

                                    {/* Sub Event */}
                                    <td className="px-4 py-3">
                                      <div className="text-gray-600 dark:text-gray-300">
                                        {material.subeventName}
                                      </div>
                                    </td>

                                    {/* Unit */}
                                    <td className="px-4 py-3">
                                      <div className="text-gray-600 dark:text-gray-300">
                                        {material.unit}
                                      </div>
                                    </td>

                                    {/* Event Return (inword) */}
                                    <td className="px-4 py-3">
                                      <span className="rounded bg-green-50 px-2 py-1 text-sm font-medium text-green-600 dark:bg-green-900 dark:text-green-200">
                                        {eventReturn}
                                      </span>
                                    </td>

                                    {/* Return Quantity - Editable */}
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                          tableQuantities[material.id] || ''
                                        }
                                        onChange={(e) => {
                                          const value =
                                            Number(e.target.value) || 0;
                                          handleQuantityChange(
                                            material.id,
                                            value,
                                          );
                                        }}
                                        className="border-gray-300 w-24 rounded border px-2 py-1 text-center text-sm dark:border-strokedark dark:bg-boxdark"
                                        placeholder="0"
                                      />
                                    </td>

                                    {/* Difference */}
                                    <td className="px-4 py-3">
                                      <span
                                        className={`text-sm font-medium ${
                                          diff === 0
                                            ? 'text-gray-500'
                                            : diff > 0
                                              ? 'text-green-500'
                                              : 'text-red-500'
                                        }`}
                                      >
                                        {diff}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </React.Fragment>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            {hasEditAccess && (
              <div className="mt-6 flex justify-end">
                <GenericButton
                  type="submit"
                  disabled={
                    isSubmittingReturn ||
                    !selectedEventId ||
                    Object.keys(groupedReturnMaterials).length === 0 ||
                    !hasChanges
                  }
                  className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingReturn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    'Save Return Inward'
                  )}
                </GenericButton>
              </div>
            )}
          </div>
        ) : (
          selectedEventId && (
            <div className="rounded bg-yellow-50 p-8 text-center">
              <p className="text-lg text-yellow-600">
                No materials found for this event.
              </p>
            </div>
          )
        )}
      </form>
    </div>
  );
};

export default RawMaterialReturnInward;
