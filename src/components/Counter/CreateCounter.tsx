/* eslint-disable */
import useColorMode from '@/hooks/useColorMode';
import {
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetAllVendorManpowerRole,
  useGetVendorManpower,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {MdDelete} from 'react-icons/md';
import React, {useState, useEffect, useMemo} from 'react';
import Select from 'react-select';
import {
  useGetCounter,
  useGetCounterById,
  useGetEmployeeandMaharaj,
  useSaveNewcounter,
  useUpdateCounter,
} from './counterHelper';
import {FiArrowLeft} from 'react-icons/fi';

interface Range {
  from: number;
  to: number;
  countersCount: number;
}

interface CreateCounterProps {
  mode: 'create' | 'edit';
  counterId?: string;
  onBack: () => void;
}

const CreateCounter: React.FC<CreateCounterProps> = ({
  mode,
  counterId,
  onBack,
}) => {
  const [colorMode] = useColorMode();

  // Form States
  const [counterName, setCounterName] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [display, setDisplay] = useState<number>(0);
  const [dishCategory, setDishCategory] = useState<any[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<any[]>([]);
  const [rangeErrors, setRangeErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const [formErrors, setFormErrors] = useState({
    counterName: '',
    quantity: '',
    display: '',
    dishes: '',
    services: '',
  });

  // Updated: vendor is now string[] (array of IDs)
  const [multiRows, setMultiRows] = useState<
    {
      services: any;
      count: number;
      employees: any[];
      vendor: string[]; // ← Now multiple vendors
    }[]
  >([{services: null, count: 0, employees: [], vendor: []}]);

  const [ranges, setRanges] = useState<Range[]>([]);

  // Set default range only on create
  useEffect(() => {
    if (mode === 'create') {
      setRanges([{from: 1, to: 100, countersCount: 1}]);
    }
  }, [mode]);

  // Queries
  const {data: dishCategoriesResponse} = useGetDishCategories();
  const {data: DishNames} = useGetDishes();
  const {data: vendorManpowerData} = useGetVendorManpower();
  const {data: maharajandemployeeeData} = useGetEmployeeandMaharaj();
  const {data: VendorRoleData} = useGetAllVendorManpowerRole();
  const {
    mutateAsync: saveNewcounter,
    isSuccess: isSaveSuccess,
    isPending: isSavePending,
  } = useSaveNewcounter();
  const {
    mutateAsync: updateCounter,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdateCounter(counterId!);
  const {data: counter} = useGetCounterById(counterId!);
  const {data: counters} = useGetCounter();

  // Combined loading state
  const isLoading = isSavePending || isUpdatePending || isSubmitting;

  // Mappings
  const employeesMapped =
    maharajandemployeeeData?.employees?.map(
      (item: {id: string; user: {fullname: string}}) => ({
        label: item.user.fullname + ' (Employee)',
        value: item.id,
      }),
    ) || [];

  const maharajMapped =
    maharajandemployeeeData?.maharaj?.map(
      (item: {id: string; fullname: string}) => ({
        label: item.fullname + ' (Maharaj)',
        value: item.id,
      }),
    ) || [];

  const employeeMaharajOptions = employeesMapped.concat(maharajMapped);

  const dishCategoriesData = dishCategoriesResponse?.data?.categories || [];
  const dishesData = DishNames?.data?.dishes || [];

  const mappedDishes = useMemo(() => {
    return dishesData.map((dish) => ({
      value: dish.id,
      label: dish.name,
      categoryId: dish.categoryId,
    }));
  }, [dishesData]);

  const dishCategories = dishCategoriesData.map(
    (cat: {id: string; name: string}) => ({
      value: cat.id,
      label: cat.name,
    }),
  );

  const selectedCategoryIds = dishCategory.map((c: any) => c.value);
  const dishes = mappedDishes.filter((d: any) =>
    selectedCategoryIds.includes(d.categoryId),
  );

  const servicesRoles =
    VendorRoleData?.map((role: {id: string; name: string}) => ({
      value: role.id,
      label: role.name,
    })) || [];

  // 1. Compute the roles that are already used in other rows
  const usedServiceIds = multiRows
    .map((row, idx) => (idx !== undefined ? row.services?.value : null))
    .filter((id, idx) => id && idx !== undefined); // keep only existing selections

  const getAvailableServiceOptions = (currentRowIndex: number) => {
    const currentRowServiceId = multiRows[currentRowIndex]?.services?.value;

    return servicesRoles.filter((role) => {
      return (
        role.value === currentRowServiceId ||
        !usedServiceIds.includes(role.value)
      );
    });
  };

  const vendors =
    vendorManpowerData?.map((v: any) => ({value: v.id, label: v.name})) || [];

  // Select Styles
  const selectStyles = (theme: string) => {
    const isDark = theme === 'dark';
    return {
      control: (base, state) => ({
        ...base,
        minHeight: '28px',
        backgroundColor: isDark ? '#1d2a39' : '#FFFFFF',
        borderColor: state.isFocused
          ? isDark
            ? '#3d4d60'
            : '#3C50E0'
          : isDark
            ? '#2E3A47'
            : '#E2E8F0',
        boxShadow: 'none',
        ':hover': {borderColor: isDark ? '#3d4d60' : '#3C50E0'},
        height: 'auto',
        maxHeight: 'none',
        overflow: 'visible',
      }),
      valueContainer: (base) => ({
        ...base,
        padding: '0 6px',
        height: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        maxHeight: 'none',
        overflowY: 'visible',
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
      }),
      clearIndicator: (base, state) => ({
        ...base,
        display: state.isMulti ? 'none' : 'flex',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        height: '28px',
      }),
      dropdownIndicator: (base) => ({
        ...base,
        padding: '2px',
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDark ? '#1A222C' : '#FFFFFF',
        zIndex: 9999,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? isDark
            ? '#24303F'
            : '#EFF4FB'
          : state.isFocused
            ? isDark
              ? '#333A48'
              : '#F7F9FC'
            : isDark
              ? '#1A222C'
              : '#FFFFFF',
        color: isDark ? '#DEE4EE' : '#1C2434',
        cursor: 'pointer',
      }),
      placeholder: (base) => ({
        ...base,
        color: isDark ? '#8A99AF' : '#64748B',
      }),
      singleValue: (base) => ({
        ...base,
        color: isDark ? '#DEE4EE' : '#1C2434',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: isDark ? '#333A48' : '#EFF4FB',
        borderRadius: 4,
        padding: '0 4px',
        margin: '2px 4px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: isDark ? '#F1F5F9' : '#1C2434',
        fontSize: '11px',
        padding: 0,
        lineHeight: '20px',
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: isDark ? '#F5F7FD' : '#1C2434',
        padding: '0 2px',
        ':hover': {
          backgroundColor: isDark ? '#2E3A47' : '#E5E7EB',
          color: isDark ? '#FFFFFF' : '#000000',
        },
      }),
    };
  };

  // Populate form on edit
  const populateForm = (data: any) => {
    setCounterName(data.name || '');
    setDisplay(data.display || 0);
    setQuantity(data.perDishQuantity || 0);

    // Dishes
    const selectedDishValues = data.caterorCounterDishes
      ? data.caterorCounterDishes.map((d: any) =>
          mappedDishes.find((dish: any) => dish.value === d.caterorDishId),
        )
      : [];
    setSelectedDishes(selectedDishValues.filter(Boolean));

    // Services
    const rows =
      data.caterorCounterServices?.length > 0
        ? data.caterorCounterServices.map((srv: any) => {
            const serviceOption = servicesRoles.find(
              (r: any) => r.value === srv.serviceId,
            );

            const employeeList = [
              ...(srv.caterorCounterEmployees?.map((e: any) =>
                employeesMapped.find((opt: any) => opt.value === e.employeeId),
              ) || []),
              ...(srv.caterorCounterMaharajs?.map((m: any) =>
                maharajMapped.find((opt: any) => opt.value === m.maharajId),
              ) || []),
            ].filter(Boolean);

            // Multiple vendors
            const vendorIds =
              srv.caterorCounterManpowerVendors?.map(
                (v: any) => v.manpowerVendorId,
              ) || [];

            return {
              services: serviceOption || null,
              count: srv.quantity || 0,
              employees: employeeList,
              vendor: vendorIds, // ← array
            };
          })
        : [{services: null, count: 0, employees: [], vendor: []}];

    setMultiRows(rows);

    // Ranges
    if (data.counterServicesRanges && data.counterServicesRanges.length > 0) {
      const populatedRanges = data.counterServicesRanges.map((r: any) => ({
        from: Number(r.from) || 1,
        to: Number(r.to) || 100,
        countersCount: Number(r.count) || 1,
      }));
      setRanges(populatedRanges);
    } else {
      setRanges([]);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && counter) {
      populateForm(counter);
    }
  }, [mode, counter, mappedDishes]);

  // Row handlers
  const autoAddRow = () => {
    setMultiRows((prev) => [
      ...prev,
      {services: null, count: 0, employees: [], vendor: []},
    ]);
  };

  const deleteRow = (index: number) => {
    if (multiRows.length > 1) {
      setMultiRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Range handlers
  const addRange = () => {
    const last = ranges[ranges.length - 1];
    const nextFrom = last ? last.to + 1 : 1;

    const updated = [
      ...ranges,
      {from: nextFrom, to: nextFrom + 99, countersCount: 1},
    ];

    setRanges(updated);
    runLiveRangeValidation(updated);
  };

  const updateRange = (index: number, field: keyof Range, value: number) => {
    const updated = ranges.map((r, i) =>
      i === index ? {...r, [field]: value} : r,
    );

    setRanges(updated);

    // LIVE auto validation
    runLiveRangeValidation(updated);
  };

  const deleteRange = (index: number) => {
    const updated = ranges.filter((_, i) => i !== index);
    setRanges(updated);
    runLiveRangeValidation(updated);
  };

  // Save
  const SaveCounter = async () => {
    const errors: any = {
      counterName: '',
      quantity: '',
      display: '',
      dishes: '',
      services: '',
    };

    let hasError = false;

    // Counter Name
    if (!counterName.trim()) {
      errors.counterName = 'Counter name is required';
      hasError = true;
    }

    // Quantity
    if (quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
      hasError = true;
    }

    // Display
    if (display <= 0) {
      errors.display = 'Display quantity must be greater than 0';
      hasError = true;
    }

    // Dishes
    if (selectedDishes.length === 0) {
      errors.dishes = 'Please select at least one dish';
      hasError = true;
    }

    // Services
    const hasValidService = multiRows.some((r) => r.services?.value);
    if (!hasValidService) {
      errors.services = 'Add at least one service/role';
      hasError = true;
    }

    setFormErrors(errors);

    if (hasError) return;

    const isRangeValid = validateRanges(ranges);
    if (!isRangeValid) return;

    setIsSubmitting(true); // Set loading state

    const formattedData = {
      name: counterName.trim(),
      display,
      perDishQuantity: quantity,
      dishes: selectedDishes.map((dish: any) => ({id: dish.value})),
      services: multiRows
        .filter((row) => row.services?.value)
        .map((row) => ({
          serviceId: row.services.value,
          vendorId: row.vendor.map((id) => ({id})), // ← Multiple vendors
          employeeId: row.employees
            .filter((e: any) => e.label.includes('(Employee)'))
            .map((e: any) => ({id: e.value})),
          maharajId: row.employees
            .filter((e: any) => e.label.includes('(Maharaj)'))
            .map((e: any) => ({id: e.value})),
          count: row.count || 0,
          price: 0,
        })),
      range:
        ranges.length > 0
          ? ranges.map((r) => ({
              from: Number(r.from),
              to: Number(r.to),
              count: Number(r.countersCount) || 1,
            }))
          : [],
    };

    try {
      if (mode === 'edit') {
        await updateCounter(formattedData);
      } else {
        await saveNewcounter(formattedData);
      }
    } finally {
      setIsSubmitting(false); // Clear loading state
    }
  };

  // Handle success navigation
  useEffect(() => {
    if (isSaveSuccess || isUpdateSuccess) {
      onBack();
    }
  }, [isSaveSuccess, isUpdateSuccess, onBack]);

  // Prevent dish duplication across counters
  const usedDishIds =
    counters
      ?.filter((c) => (mode === 'edit' ? c.id !== counterId : true))
      .flatMap(
        (c) => c.caterorCounterDishes?.map((d) => d.caterorDishId) || [],
      ) || [];

  const currentCounterDishes =
    mode === 'edit'
      ? counter?.caterorCounterDishes?.map((d) => d.caterorDishId) || []
      : [];

  const filteredDishes = dishes?.filter(
    (dish) =>
      !usedDishIds.includes(dish.value) ||
      currentCounterDishes.includes(dish.value),
  );

  const runLiveRangeValidation = (updatedRanges: Range[]) => {
    if (!updatedRanges || updatedRanges.length === 0) {
      setRangeErrors([]);
      return;
    }

    const errors: string[] = Array(updatedRanges.length).fill('');

    const sorted = [...updatedRanges].sort((a, b) => a.from - b.from);

    // Validate individual ranges
    updatedRanges.forEach((r, index) => {
      if (!r.from || !r.to) {
        errors[index] = 'Both fields are required';
      } else if (r.from <= 0 || r.to <= 0) {
        errors[index] = 'Range values must be greater than 0';
      } else if (r.from > r.to) {
        errors[index] = 'From cannot be greater than To';
      }
    });

    // Check overlapping
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];

      if (next.from <= curr.to) {
        const currIdx = updatedRanges.findIndex(
          (r) => r.from === curr.from && r.to === curr.to,
        );
        const nextIdx = updatedRanges.findIndex(
          (r) => r.from === next.from && r.to === next.to,
        );

        errors[currIdx] = 'Overlapping range!';
        errors[nextIdx] = 'Overlapping range!';
      }
    }

    setRangeErrors(errors);
  };

  const validateRanges = (ranges: Range[]) => {
    if (!ranges || ranges.length === 0) {
      setRangeErrors([]);
      return true;
    }

    const errors: string[] = Array(ranges.length).fill('');

    const sorted = [...ranges].sort((a, b) => a.from - b.from);
    const originalIndexes = ranges.map((_, i) => i);

    // Check individual row errors
    ranges.forEach((r, index) => {
      if (r.from <= 0 || r.to <= 0) {
        errors[index] = 'Range values must be greater than 0';
      } else if (r.from > r.to) {
        errors[index] = 'From cannot be greater than To';
      }
    });

    // Check overlapping errors
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];

      if (next.from <= curr.to) {
        // find original indexes so error maps properly
        const currIdx = ranges.findIndex(
          (r) => r.from === curr.from && r.to === curr.to,
        );
        const nextIdx = ranges.findIndex(
          (r) => r.from === next.from && r.to === next.to,
        );

        errors[currIdx] = 'Overlapping range!';
        errors[nextIdx] = 'Overlapping range!';
      }
    }

    setRangeErrors(errors);

    return errors.every((e) => e === '');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-1">
      <button
        onClick={onBack}
        disabled={isLoading}
        className={`bg-gray-300 hover:bg-gray-400 mb-2 rounded px-4 ${
          isLoading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <FiArrowLeft className="mr-2 inline h-5 w-5 font-bold" />
        {mode === 'edit' ? 'Edit Counter' : 'Create Counter'}
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="flex items-center space-x-4 rounded-lg bg-white p-6 shadow-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="text-gray-700">
              {mode === 'edit' ? 'Updating counter...' : 'Creating counter...'}
            </span>
          </div>
        </div>
      )}

      {/* Counter Details */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-black">
        <h2 className="text-gray-700 mb-4 border-b pb-2 text-lg font-semibold">
          Counter Details
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Counter Name
            </label>
            <input
              type="text"
              value={counterName}
              onChange={(e) => {
                setCounterName(e.target.value);
                setFormErrors((prev) => ({...prev, counterName: ''}));
              }}
              disabled={isLoading}
              placeholder="Enter counter name"
              className={`w-full rounded border border-stroke px-3 py-0.5 dark:border-strokedark dark:bg-form-input dark:text-white ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            />
            {formErrors.counterName && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.counterName}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Quantity (per dish)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(parseInt(e.target.value) || 0);
                setFormErrors((prev) => ({...prev, quantity: ''}));
              }}
              disabled={isLoading}
              className={`w-full rounded border border-stroke px-3 py-0.5 dark:border-strokedark dark:bg-form-input dark:text-white ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            />
            {formErrors.quantity && (
              <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>
            )}
          </div>
          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Display Quantity
            </label>
            <input
              type="number"
              value={display}
              onChange={(e) => {
                setDisplay(parseInt(e.target.value) || 0);
                setFormErrors((prev) => ({...prev, display: ''}));
              }}
              disabled={isLoading}
              className={`w-full rounded border border-stroke px-3 py-0.5 dark:border-strokedark dark:bg-form-input dark:text-white ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            />
            {formErrors.display && (
              <p className="mt-1 text-xs text-red-500">{formErrors.display}</p>
            )}
          </div>
        </div>

        {/* Quantity Ranges - Now in Tabular Format */}
        <div className="mt-8 overflow-hidden rounded-md bg-white shadow-md dark:bg-black">
          <div className="flex items-center justify-between border-b border-stroke px-6 py-2 dark:border-strokedark">
            <h3 className="text-gray-700 text-lg font-semibold dark:text-white">
              Quantity Ranges
            </h3>
            <button
              onClick={addRange}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Range
            </button>
          </div>

          {ranges.length === 0 ? (
            <div className="text-gray-500 px-6 py-8 text-center">
              No ranges defined. Click "Add Range" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-2 dark:bg-meta-4">
                  <tr>
                    <th className="text-gray-500 w-40 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      From
                    </th>
                    <th className="text-gray-500 w-40 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      To
                    </th>
                    <th className="text-gray-500 w-40 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Counters Count
                    </th>
                    <th className="text-gray-500 w-32 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-gray-200 divide-y dark:divide-strokedark">
                  {ranges.map((range, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-meta-4"
                    >
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          value={range.from}
                          onChange={(e) =>
                            updateRange(
                              index,
                              'from',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          disabled={isLoading}
                          className={`w-full rounded border border-stroke px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input ${
                            isLoading ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          value={range.to}
                          onChange={(e) =>
                            updateRange(
                              index,
                              'to',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          disabled={isLoading}
                          className={`w-full rounded border border-stroke px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input ${
                            isLoading ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          value={range.countersCount}
                          onChange={(e) =>
                            updateRange(
                              index,
                              'countersCount',
                              parseInt(e.target.value) || 1,
                            )
                          }
                          disabled={isLoading}
                          className={`w-full rounded border border-stroke px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input ${
                            isLoading ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => deleteRange(index)}
                          disabled={ranges.length === 1 || isLoading}
                          className={`rounded p-2 transition ${
                            ranges.length === 1 || isLoading
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'dark:text- text-graydark hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Show validation errors below the table */}
              {rangeErrors.some((err) => err) && (
                <div className="border-t border-stroke px-6 py-3 dark:border-strokedark">
                  {rangeErrors.map((err, i) =>
                    err ? (
                      <p key={i} className="text-sm text-red-500">
                        Row {i + 1}: {err}
                      </p>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dish Category Filter */}
      <div className="mb-6 w-[30%]">
        <h3 className="text-gray-700 mb-2 font-medium">
          Filter Dishes by Category
        </h3>
        <Select
          isMulti
          options={dishCategories}
          value={dishCategory}
          onChange={(selected) => setDishCategory(selected || [])}
          menuPortalTarget={document.body}
          isDisabled={isLoading}
          styles={{
            ...selectStyles(colorMode || 'dark'),
            menuPortal: (base) => ({...base, zIndex: 9999}),
          }}
          menuPosition="fixed"
          menuShouldScrollIntoView={false}
          components={{IndicatorSeparator: () => null}}
        />
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-md bg-white shadow-md dark:bg-black">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-2 dark:bg-meta-4">
              <tr>
                {[
                  {label: 'Dish', width: 'w-80'}, // 320px-ish
                  {label: 'Service/Role', width: 'w-64'}, // 256px
                  {label: 'Count', width: 'w-32'}, // 128px
                  {label: 'Employee/Maharaj', width: 'w-72'}, // 288px
                  {label: 'Manpower Vendor', width: 'w-72'}, // 288px
                  {label: 'Action', width: 'w-32'}, // 128px
                ].map((col, i) => (
                  <th
                    key={i}
                    className={`text-gray-500 px-4 py-3 text-left text-sm font-semibold ${col.width}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="dark:bg-black">
              {multiRows.map((row, index) => (
                <tr
                  key={index}
                  className="border-gray-200 dark:border-gray-700 border-b" // optional thin border
                >
                  {/* Dish column – only rendered on first row */}
                  {index === 0 && (
                    <td
                      rowSpan={multiRows.length}
                      className="w-80 px-4 py-2 align-top align-middle"
                    >
                      <Select
                        isMulti
                        options={filteredDishes || []}
                        isLoading={!mappedDishes.length}
                        value={selectedDishes}
                        onChange={(selected) => {
                          setSelectedDishes(selected || []);
                          setFormErrors((prev) => ({...prev, dishes: ''}));
                        }}
                        isDisabled={isLoading}
                        placeholder="Select dishes..."
                        menuPortalTarget={document.body}
                        styles={{
                          ...selectStyles(colorMode || 'dark'),
                          menuPortal: (base) => ({...base, zIndex: 9999}),
                        }}
                        menuPosition="fixed"
                        menuShouldScrollIntoView={false}
                        components={{IndicatorSeparator: () => null}}
                      />
                      {formErrors.dishes && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.dishes}
                        </p>
                      )}
                    </td>
                  )}

                  {/* Service/Role */}
                  <td className="px-4 py-2">
                    <Select
                      options={getAvailableServiceOptions(index)}
                      value={row.services}
                      onChange={(selected) => {
                        const updated = [...multiRows];
                        updated[index].services = selected;
                        setMultiRows(updated);
                        setFormErrors((prev) => ({...prev, services: ''}));
                      }}
                      isDisabled={isLoading}
                      placeholder="Select service"
                      menuPortalTarget={document.body}
                      styles={{
                        ...selectStyles(colorMode || 'dark'),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                      }}
                      components={{IndicatorSeparator: () => null}}
                    />
                  </td>

                  {/* Count */}
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.count}
                      onChange={(e) => {
                        const updated = [...multiRows];
                        updated[index].count = parseInt(e.target.value) || 0;
                        setMultiRows(updated);
                      }}
                      disabled={isLoading}
                      className={`w-full rounded border border-stroke px-3 py-1 dark:border-strokedark dark:bg-form-input ${
                        isLoading ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    />
                  </td>

                  {/* Employee/Maharaj */}
                  <td className="px-4 py-2">
                    <Select
                      isMulti
                      options={employeeMaharajOptions}
                      value={row.employees}
                      onChange={(selected) => {
                        const updated = [...multiRows];
                        updated[index].employees = selected || [];
                        setMultiRows(updated);
                      }}
                      isDisabled={isLoading}
                      menuPortalTarget={document.body}
                      styles={{
                        ...selectStyles(colorMode || 'dark'),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                      }}
                      components={{IndicatorSeparator: () => null}}
                    />
                  </td>

                  {/* Manpower Vendor – multi select */}
                  <td className="px-4 py-2">
                    <Select
                      isMulti
                      options={vendors}
                      value={vendors.filter((v) =>
                        row.vendor.includes(v.value),
                      )}
                      onChange={(selected) => {
                        const updated = [...multiRows];
                        updated[index].vendor = selected
                          ? selected.map((s) => s.value)
                          : [];
                        setMultiRows(updated);
                      }}
                      isDisabled={isLoading}
                      placeholder="Select vendor(s)"
                      menuPortalTarget={document.body}
                      styles={{
                        ...selectStyles(colorMode || 'dark'),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                      }}
                      menuPosition="fixed"
                      menuShouldScrollIntoView={false}
                      components={{IndicatorSeparator: () => null}}
                    />
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteRow(index)}
                        disabled={multiRows.length === 1 || isLoading}
                        className={`rounded p-1.5 ${
                          multiRows.length === 1 || isLoading
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-graydark hover:bg-red-50 dark:text-gray'
                        }`}
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                      {index === multiRows.length - 1 && (
                        <button
                          onClick={() =>
                            setMultiRows((prev) => [
                              ...prev,
                              {
                                services: null,
                                count: 0,
                                employees: [],
                                vendor: [],
                              },
                            ])
                          }
                          disabled={isLoading}
                          className={`rounded p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 ${
                            isLoading ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          title="Add new role"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={SaveCounter}
          disabled={isLoading}
          className={`flex items-center gap-2 rounded-md bg-primary px-6 py-1.5 text-sm font-medium text-white hover:bg-primary/90 ${
            isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isLoading && (
            <svg
              className="h-4 w-4 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isLoading
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
              ? 'Update Counter'
              : 'Save Counter'}
        </button>
      </div>
    </div>
  );
};

export default CreateCounter;
