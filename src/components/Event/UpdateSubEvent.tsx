/* eslint-disable */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {subEventSchema} from '@/lib/validation/eventSchema';
import {
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetSubeventById,
  useUpdateSubEvent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetAllPackage} from '@/lib/react-query/package/displaypackage';
import {useGetAddOnServices} from '@/lib/react-query/queriesAndMutations/cateror/addonservice';
import {useAuthContext} from '@/context/AuthContext';
import {Route} from '@/routes/_app/_event/update-subevent.$id';
import {useNavigate} from '@tanstack/react-router';
import Select from 'react-select';
import toast from 'react-hot-toast';
import {BiInfoCircle, BiSave} from 'react-icons/bi';
import {FaArrowLeft} from 'react-icons/fa';
import {Loader} from '../Loader/Loader';
import GenericInputField from '../../components/Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';

// ──────────────────────────────────────────────────────────────
// 1. ORIGINAL UpdateSubEvent – 100% UNCHANGED (for non-package)
// ──────────────────────────────────────────────────────────────
const UpdateSubEvent: React.FC = () => {
  const {id: subEventId} = Route.useParams();
  const navigate = useNavigate();
  const {user} = useAuthContext();
  const adminId = user?.id ?? '';

  const {data: allAddOnServices} = useGetAddOnServices(adminId);
  const {data: subEventResponse} = useGetSubeventById(subEventId);

  const {data: DishCategories} = useGetDishCategories();
  const {data: Dishes} = useGetDishes();
  const {mutate: updateSubEvent, isPending} = useUpdateSubEvent();

  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const subEventAddOnServices =
    subEventResponse?.data?.subevent?.SubeventAddonServices || [];
  const subEvent = subEventResponse?.data?.subevent;
  const methods = useForm({resolver: zodResolver(subEventSchema)});
  const {watch, setValue, getValues, reset, control} = methods;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDishSelect = (categoryId: string, selectedOptions: any) => {
    const selectedDishIdsForCategory = selectedOptions.map(
      (opt: any) => opt.value,
    );
    const categoryDishIds =
      Dishes?.data?.dishes
        .filter((d: any) => d.categoryId === categoryId)
        .map((d: any) => d.id) || [];

    setSelectedDishes((prev) => [
      ...prev.filter((id) => !categoryDishIds.includes(id)),
      ...selectedDishIdsForCategory,
    ]);
  };

  const onSubmit = async (data: any) => {
    // Add back 5.5 hours to get the original time
    const combinedDateTime = addFiveAndHalfHours(data.date, data.time);
    const formattedDishes = selectedDishes.map((dishId) => ({dishId}));

    const formData = {
      name: data.name,
      address: data.address,
      dishes: formattedDishes,
      time: combinedDateTime,
      date: data.date,
      eventId: subEvent?.eventId,
      subEventId,
      expectedPeople: Number(data.expectedPeople) || 0,
      buffetPeople: Number(data.buffetPeople) || 0,
      sittingPeople: Number(data.sittingPeople) || 0,
      note: data.note,
      addon: data.addon,
    };

    updateSubEvent(formData);
    navigate({to: `/events/${subEvent?.eventId}`});
  };

  const mappedServices = useMemo(() => {
    return (
      allAddOnServices?.map((service: any) => ({
        label: `${service.name} ( ₹ ${service.price} )`,
        value: service.id,
      })) || []
    );
  }, [allAddOnServices]);

  const selectedServiceOptions = useMemo(() => {
    return mappedServices.filter((service) =>
      subEventAddOnServices.some(
        (s: any) => s.addonServiceId === service.value,
      ),
    );
  }, [mappedServices, subEventAddOnServices]);

  const menuPortalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuPortalRef.current) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      menuPortalRef.current = div;
    }
    return () => {
      if (menuPortalRef.current)
        document.body.removeChild(menuPortalRef.current);
    };
  }, []);

  // This function creates the category-wise dish options for each category
  const getCategoryDishOptions = (categoryId: string) => {
    if (!Dishes?.data?.dishes) return [];

    return Dishes.data.dishes
      .filter((dish: any) => dish.categoryId === categoryId)
      .map((dish: any) => ({
        label: dish.name,
        value: dish.id,
      }));
  };

  // This function gets the selected dishes for a specific category
  const getSelectedDishesForCategory = (categoryId: string) => {
    if (!Dishes?.data?.dishes || !selectedDishes.length) return [];

    return Dishes.data.dishes
      .filter(
        (dish: any) =>
          dish.categoryId === categoryId && selectedDishes.includes(dish.id),
      )
      .map((dish: any) => ({
        label: dish.name,
        value: dish.id,
      }));
  };

  // Helper function to subtract 5.5 hours for display
  const subtractFiveAndHalfHours = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const adjustedTime = date.getTime() - 5.5 * 60 * 60 * 1000;
    const adjustedDate = new Date(adjustedTime);

    return adjustedDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Helper function to add back 5.5 hours for submission
  const addFiveAndHalfHours = (dateStr: string, timeStr: string): string => {
    if (!dateStr || !timeStr) return '';

    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');

    const formDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
    );

    const originalTime = new Date(
      formDateTime.getTime() + 5.5 * 60 * 60 * 1000,
    );

    const year2 = originalTime.getFullYear();
    const month2 = String(originalTime.getMonth() + 1).padStart(2, '0');
    const day2 = String(originalTime.getDate()).padStart(2, '0');
    const hours2 = String(originalTime.getHours()).padStart(2, '0');
    const minutes2 = String(originalTime.getMinutes()).padStart(2, '0');
    const seconds2 = String(originalTime.getSeconds()).padStart(2, '0');

    return `${year2}-${month2}-${day2}T${hours2}:${minutes2}:${seconds2}+05:30`;
  };

  useEffect(() => {
    if (!subEvent || !subEvent.dishes || !Dishes?.data?.dishes) return;

    // Set selected dishes from subEvent
    const selectedDishIds =
      subEvent.dishes?.map((dish: any) => dish.dishId) || [];
    setSelectedDishes(selectedDishIds);

    // Use adjusted time (5.5 hours back) for display
    const localTime = subtractFiveAndHalfHours(subEvent.time);

    const selectedServiceIds = subEventAddOnServices.map(
      (service: any) => service.addonServiceId,
    );

    reset({
      name: subEvent.name || '',
      address: subEvent.address || '',
      date: formatDate(subEvent.date),
      time: localTime, // Display time 5.5 hours back
      expectedPeople: subEvent.expectedPeople?.toString() || '',
      buffetPeople: subEvent.buffetPeople?.toString() || '',
      sittingPeople: subEvent.sittingPeople?.toString() || '',
      note: subEvent.note || '',
      addon: selectedServiceIds,
    });

    // Set category-specific dish selections
    if (DishCategories?.data?.categories) {
      DishCategories.data.categories.forEach((category: any) => {
        const fieldName = `category_${category.id}`;
        const categorySelectedDishes = getSelectedDishesForCategory(
          category.id,
        );
        setValue(fieldName, categorySelectedDishes);
      });
    }
  }, [
    subEvent,
    reset,
    subEventAddOnServices,
    Dishes,
    DishCategories,
    setValue,
  ]);

  const universalDish = watch('universalDish');
  const allDishOptions = useMemo(() => {
    return (
      Dishes?.data?.dishes.map((d: any) => ({
        value: d.id,
        label: d.name,
        categoryId: d.categoryId,
      })) || []
    );
  }, [Dishes]);

  useEffect(() => {
    if (!universalDish) return;
    const selectedDish = allDishOptions.find((d) => d.value === universalDish);
    if (!selectedDish) return;

    const fieldName = `category_${selectedDish.categoryId}`;
    const existing = getValues(fieldName) || [];
    if (!existing.some((item: any) => item.value === selectedDish.value)) {
      const newEntry = {value: selectedDish.value, label: selectedDish.label};
      setValue(fieldName, [...existing, newEntry]);
      handleDishSelect(selectedDish.categoryId, [...existing, newEntry]);
    }
    setValue('universalDish', '');
  }, [universalDish, allDishOptions, getValues, setValue]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div>
          <h1 className="col-span-12 mb-4 flex items-center gap-2 text-lg font-semibold">
            <FaArrowLeft
              className="cursor-pointer"
              onClick={() => navigate({to: `/events/${subEvent?.eventId}`})}
            />
            Update Sub Event
          </h1>
          {/* Row 1: Name + Address */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <GenericInputField
                name="name"
                label="Sub Event Name"
                placeholder="Enter Sub Event Name"
                required
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <GenericInputField
                name="address"
                label="Sub Event Address"
                placeholder="Enter Sub Event Address"
                required
              />
            </div>
          </div>

          <div className="h-6"></div>
          <div className="grid grid-cols-12 gap-4">
            {/* Left Section (6 columns) */}
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <GenericInputField
                    name="expectedPeople"
                    label="Expected People"
                    type="number"
                    required
                    min="0"
                  />
                </div>

                <div className="col-span-4">
                  <GenericInputField
                    name="buffetPeople"
                    label="Buffet People"
                    type="number"
                    min="0"
                  />
                </div>

                <div className="col-span-4">
                  <GenericInputField
                    name="sittingPeople"
                    label="Sitting People"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Right Section (6 columns) */}
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <GenericInputField
                    name="date"
                    label="Date"
                    type="date"
                    required
                  />
                </div>

                <div className="col-span-6">
                  <GenericInputField
                    name="time"
                    label="Time"
                    type="time"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-b py-4"></div>
          <div className="col-span-12 mt-4">
            <GenericSearchDropdown
              name="universalDish"
              label="Universal Dish Selector"
              options={allDishOptions.map(({value, label}) => ({value, label}))}
            />
          </div>

          <div className="col-span-12 mt-4">
            <div className="rounded-sm bg-white dark:border-strokedark dark:bg-boxdark">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                        Dish Category
                      </th>
                      <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                        Dish
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DishCategories?.data?.categories?.map((category: any) => {
                      const fieldName = `category_${category.id}`;
                      const categoryOptions = getCategoryDishOptions(
                        category.id,
                      );

                      return (
                        <tr
                          key={category.id}
                          className="border-b border-[#eee] px-4 py-5 dark:border-strokedark"
                        >
                          <td className="px-4 py-4 text-center">
                            {category.name}
                          </td>
                          <td className="px-4 py-4">
                            <Controller
                              name={fieldName}
                              control={control}
                              render={({field}) => (
                                <Select
                                  {...field}
                                  isMulti
                                  options={categoryOptions}
                                  value={getSelectedDishesForCategory(
                                    category.id,
                                  )}
                                  onChange={(selectedOptions) => {
                                    handleDishSelect(
                                      category.id,
                                      selectedOptions,
                                    );
                                    field.onChange(selectedOptions);
                                  }}
                                  menuPortalTarget={document.body}
                                  menuPosition="absolute"
                                  classNames={{
                                    control: (state) =>
                                      `border border-gray-300 bg-white text-black placeholder:text-gray-500
                         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
                         ${state.isFocused ? 'border-gray-400 dark:border-slate-600' : ''}`,
                                    menu: () =>
                                      `bg-white text-black border border-gray-300 shadow-md
                         dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                                    option: (state) =>
                                      `px-3 py-2 cursor-pointer 
                         ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
                         ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                                    multiValue: () =>
                                      `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1`,
                                    multiValueLabel: () =>
                                      `text-black dark:text-white`,
                                    multiValueRemove: () =>
                                      `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600`,
                                  }}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  menuShouldScrollIntoView={false}
                                />
                              )}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-6 flex flex-col gap-1 p-4">
                  <label className="text-black dark:text-white">
                    Add On Services
                  </label>
                  <Controller
                    name="addon"
                    control={control}
                    defaultValue={selectedServiceOptions.map((s) => s.value)}
                    render={({field}) => (
                      <Select
                        {...field}
                        isMulti
                        options={mappedServices}
                        value={mappedServices.filter((service) =>
                          field.value?.includes(service.value),
                        )}
                        onChange={(selectedOptions) => {
                          const selectedValues = selectedOptions
                            ? selectedOptions.map((opt: any) => opt.value)
                            : [];
                          field.onChange(selectedValues);
                        }}
                        menuPortalTarget={menuPortalRef.current}
                        classNames={{
                          control: (state) =>
                            `border border-gray-300 bg-white text-black placeholder:text-gray-500
                         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
                         ${state.isFocused ? 'border-gray-400 dark:border-slate-600' : ''}`,
                          menu: () =>
                            `bg-white text-black border border-gray-300 shadow-md
                         dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                          option: (state) =>
                            `px-3 py-2 cursor-pointer 
                         ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
                         ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                          multiValue: () =>
                            `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1`,
                          multiValueLabel: () => `text-black dark:text-white`,
                          multiValueRemove: () =>
                            `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600`,
                        }}
                        styles={{
                          menuPortal: (base) => ({...base, zIndex: 9999}),
                        }}
                        menuShouldScrollIntoView={false}
                      />
                    )}
                  />
                </div>

                <div className="p-4">
                  <GenericTextArea
                    name="note"
                    label="Note"
                    placeholder="Enter any additional notes"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate({to: `/events/${subEvent?.eventId}`})}
            className="rounded-lg border px-6 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-white"
          >
            {isPending ? 'Updating...' : 'Update Sub Event'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

// ──────────────────────────────────────────────────────────────
// 2. NEW: UpdatePackageSubEvent – with Package Dropdown + Multi-select
// ──────────────────────────────────────────────────────────────
const UpdatePackageSubEvent: React.FC = () => {
  const {id: subEventId} = Route.useParams();
  const navigate = useNavigate();
  const {user} = useAuthContext();

  const {data: subEventRes, isLoading: loadingSubEvent} =
    useGetSubeventById(subEventId);

  console.log(subEventRes?.data?.subevent?.dishes[0]);

  const {data: packages, isLoading: loadingPackages} = useGetAllPackage();
  const {data: allAddOnServices} = useGetAddOnServices(user?.id ?? '');
  const {mutate: updateSubEvent, isPending} = useUpdateSubEvent();

  const subEvent = subEventRes?.data?.subevent;
  const expectedPeople = subEvent?.expectedPeople || 0;

  interface SelectionEntry {
    group: string;
    subGroup: string;
    dishId: string;
    isExtra?: boolean;
  }

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [groupSelections, setGroupSelections] = useState<{
    [key: string]: {[subGroupName: string]: {label: string; value: string}[]};
  }>({});
  const [selectionOrder, setSelectionOrder] = useState<SelectionEntry[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]);
  const [currentBasePrice, setCurrentBasePrice] = useState(0);
  const [applicableRange, setApplicableRange] = useState<any>(null);
  const [extraDishesCost, setExtraDishesCost] = useState(0);
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);

  const menuPortalRef = useRef<HTMLDivElement | null>(null);

  const methods = useForm({
    resolver: zodResolver(subEventSchema),
  });
  const {control, handleSubmit, reset, watch} = methods;

  const formExpectedPeople = watch('expectedPeople') || expectedPeople;

  // Portal cleanup
  useEffect(() => {
    if (!menuPortalRef.current) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      menuPortalRef.current = div;
    }
    return () => {
      if (
        menuPortalRef.current &&
        document.body.contains(menuPortalRef.current)
      ) {
        document.body.removeChild(menuPortalRef.current);
      }
    };
  }, []);

  // Helper function to calculate base price based on expected people
  const calculateBasePrice = (pkg: any, peopleCount: number): number => {
    const ranges = pkg?.range || pkg?.ranges || [];

    if (!Array.isArray(ranges) || ranges.length === 0) {
      return 0;
    }

    const sortedRanges = [...ranges].sort((a, b) => a.from - b.from);
    const applicableRange = sortedRanges.find(
      (range) => peopleCount >= range.from && peopleCount <= range.to,
    );

    if (applicableRange) {
      return applicableRange.price;
    }

    if (peopleCount < sortedRanges[0].from) {
      return sortedRanges[0].price;
    }

    if (peopleCount > sortedRanges[sortedRanges.length - 1].to) {
      return sortedRanges[sortedRanges.length - 1].price;
    }

    return ranges[0]?.price || 0;
  };

  // Get current base price for selected package
  const getCurrentBasePrice = (): number => {
    if (!selectedPackage) {
      return 0;
    }

    const peopleCount =
      formExpectedPeople > 0 ? formExpectedPeople : expectedPeople;
    return calculateBasePrice(selectedPackage, peopleCount);
  };

  // Get selected package
  const selectedPackage =
    selectedPackageId && packages
      ? packages.find((pkg: any) => pkg.id === selectedPackageId)
      : null;

  // Set initial form values + package
  useEffect(() => {
    if (!subEvent) return;

    const localTime = subEvent.time
      ? new Date(subEvent.time).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '';

    // Format date to YYYY-MM-DD for input field
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDateForInput(subEvent.date);

    // Set package ID
    setSelectedPackageId(subEvent.packageId || null);

    reset({
      name: subEvent.name || '',
      address: subEvent.address || '',
      date: formattedDate,
      time: localTime,
      expectedPeople: subEvent.expectedPeople?.toString() || '',
      buffetPeople: subEvent.buffetPeople?.toString() || '',
      sittingPeople: subEvent.sittingPeople?.toString() || '',
      note: subEvent.note || '',
      addon:
        subEvent.SubeventAddonServices?.map((s: any) => s.addonServiceId) || [],
    });
  }, [subEvent, reset]);

  // Initialize package selections when package or subevent changes
  useEffect(() => {
    if (!selectedPackageId || !packages || !subEvent) {
      setGroupSelections({});
      setSelectionOrder([]);
      setSelectedDishes([]);
      setExpandedGroups(new Set());
      return;
    }

    const pkg = packages.find((p: any) => p.id === selectedPackageId);
    if (!pkg) return;

    // Create a map of saved dishes with their isExtra status
    const savedDishes = new Map(
      subEvent.dishes?.map((d: any) => [
        d.dishId,
        {isExtra: d.isExtra, dishData: d},
      ]) || [],
    );

    // Initialize group selections and selection order
    const newGroupSelections: typeof groupSelections = {};
    const newSelectionOrder: SelectionEntry[] = [];

    // Process mainDishes
    pkg.mainDishes?.forEach((group: any) => {
      const groupName = group.group;
      newGroupSelections[groupName] = {};

      group.subgroup?.forEach((subGroup: any) => {
        const subGroupName = subGroup.name;
        const subGroupDishes: {label: string; value: string}[] = [];

        // Find all saved dishes in this subgroup
        subGroup.dishes?.forEach((dish: any) => {
          if (savedDishes.has(dish.id)) {
            subGroupDishes.push({
              label: dish.name,
              value: dish.id,
            });

            // Add to selection order with isExtra status
            const savedDish = savedDishes.get(dish.id);
            newSelectionOrder.push({
              group: groupName,
              subGroup: subGroupName,
              dishId: dish.id,
              isExtra: savedDish?.isExtra || false,
            });
          }
        });

        newGroupSelections[groupName][subGroupName] = subGroupDishes;
      });
    });

    setGroupSelections(newGroupSelections);
    setSelectionOrder(newSelectionOrder);

    // Initialize selected dishes with correct isExtra status
    initializeSelectedDishesFromSaved(
      newGroupSelections,
      newSelectionOrder,
      pkg,
      savedDishes,
    );
  }, [selectedPackageId, packages, subEvent]);

  // Initialize selected dishes from saved data with isExtra status
  const initializeSelectedDishesFromSaved = (
    selectionsState: typeof groupSelections,
    order: SelectionEntry[],
    pkg: any,
    savedDishes: Map<string, any>,
  ) => {
    const allDishes: SelectedDish[] = [];

    pkg?.mainDishes?.forEach((group: any) => {
      const groupName = group.group;
      const mainFreeLimit = group.count ?? 0;
      const groupSelections = selectionsState[groupName] || {};

      // Track free selections per group
      let groupFreeCount = 0;

      // First pass: Process all selections in order
      Object.entries(groupSelections).forEach(
        ([subName, selectedDishes]: any) => {
          const sub = group.subgroup?.find((sg: any) => sg.name === subName);
          if (!sub) return;

          const subFreeLimit = sub.count ?? 0;
          const subCost = sub.cost ?? 0;
          let subFreeCount = 0;

          selectedDishes.forEach((opt: any, idxInSub: number) => {
            const dish = sub.dishes?.find((d: any) => d.id === opt.value);
            if (!dish) return;

            const savedDish = savedDishes.get(dish.id);
            const isExtraFromSaved = savedDish?.isExtra || false;

            // Check if this dish was originally marked as extra
            if (isExtraFromSaved) {
              // Always keep as extra if it was saved as extra
              allDishes.push({
                dishId: dish.id,
                dishName: dish.name,
                groupName,
                subGroupName: subName,
                category: subName,
                cost: subCost,
                isExtra: true,
                index: idxInSub,
                freeSelectionCount: subFreeLimit,
              });
            } else {
              // Apply limits to non-extra dishes
              const canBeFree =
                subFreeCount < subFreeLimit && groupFreeCount < mainFreeLimit;

              allDishes.push({
                dishId: dish.id,
                dishName: dish.name,
                groupName,
                subGroupName: subName,
                category: subName,
                cost: canBeFree ? 0 : subCost,
                isExtra: !canBeFree,
                index: idxInSub,
                freeSelectionCount: subFreeLimit,
              });

              if (canBeFree) {
                subFreeCount++;
                groupFreeCount++;
              }
            }
          });
        },
      );
    });

    // Sort by selection order
    allDishes.sort((a, b) => {
      const ia = order.findIndex(
        (e) => e.group === a.groupName && e.dishId === a.dishId,
      );
      const ib = order.findIndex(
        (e) => e.group === b.groupName && e.dishId === b.dishId,
      );
      return ia - ib;
    });

    setSelectedDishes(allDishes);
  };

  // Update selected dishes when selections change
  const updateSelectedDishes = (
    selectionsState: typeof groupSelections,
    order: SelectionEntry[],
  ) => {
    const allDishes: SelectedDish[] = [];

    // Create a map of previously selected dishes with their isExtra status
    const prevDishes = new Map(
      selectedDishes.map((d) => [d.dishId, d.isExtra]),
    );

    selectedPackage?.mainDishes?.forEach((group: any) => {
      const groupName = group.group;
      const mainFreeLimit = group.count ?? 0;
      const groupSelections = selectionsState[groupName] || {};

      let groupFreeCount = 0;

      // Process each subgroup
      Object.entries(groupSelections).forEach(
        ([subName, selectedDishes]: any) => {
          const sub = group.subgroup?.find((sg: any) => sg.name === subName);
          if (!sub) return;

          const subFreeLimit = sub.count ?? 0;
          const subCost = sub.cost ?? 0;
          let subFreeCount = 0;

          selectedDishes.forEach((opt: any, idxInSub: number) => {
            const dish = sub.dishes?.find((d: any) => d.id === opt.value);
            if (!dish) return;

            const wasExtraBefore = prevDishes.get(dish.id) || false;

            // Check if this dish was originally saved as extra
            const originalSelection = order.find(
              (entry) =>
                entry.group === groupName &&
                entry.subGroup === subName &&
                entry.dishId === dish.id,
            );
            const wasOriginallyExtra = originalSelection?.isExtra || false;

            // If dish count exceeds subgroup limit, mark as extra
            if (idxInSub >= subFreeLimit) {
              allDishes.push({
                dishId: dish.id,
                dishName: dish.name,
                groupName,
                subGroupName: subName,
                category: subName,
                cost: subCost,
                isExtra: true,
                index: idxInSub,
                freeSelectionCount: subFreeLimit,
              });
            } else {
              // Check if it can be free
              const canBeFree =
                subFreeCount < subFreeLimit &&
                groupFreeCount < mainFreeLimit &&
                !wasOriginallyExtra; // If it was originally extra, keep it extra

              allDishes.push({
                dishId: dish.id,
                dishName: dish.name,
                groupName,
                subGroupName: subName,
                category: subName,
                cost: canBeFree ? 0 : subCost,
                isExtra: !canBeFree,
                index: idxInSub,
                freeSelectionCount: subFreeLimit,
              });

              if (canBeFree) {
                subFreeCount++;
                groupFreeCount++;
              }
            }
          });
        },
      );
    });

    // Sort by selection order
    allDishes.sort((a, b) => {
      const ia = order.findIndex(
        (e) => e.group === a.groupName && e.dishId === a.dishId,
      );
      const ib = order.findIndex(
        (e) => e.group === b.groupName && e.dishId === b.dishId,
      );
      return ia - ib;
    });

    setSelectedDishes(allDishes);
  };

  // Reset everything when changing package
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    setGroupSelections({});
    setSelectionOrder([]);
    setSelectedDishes([]);
    setExpandedGroups(new Set());
  };

  // Toggle accordion
  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Handle clicking a dish card
  const handleDishSelect = (
    groupName: string,
    subGroupName: string,
    dishId: string,
    dishName: string,
  ) => {
    setGroupSelections((prev) => {
      const current = prev[groupName]?.[subGroupName] || [];
      const isCurrentlySelected = current.some((d) => d.value === dishId);

      let newOrder = [...selectionOrder];

      if (isCurrentlySelected) {
        // Remove from selection order
        newOrder = newOrder.filter(
          (e) =>
            !(
              e.group === groupName &&
              e.subGroup === subGroupName &&
              e.dishId === dishId
            ),
        );
      } else {
        // Check if this dish was previously saved as extra
        const wasExtraBefore =
          selectedDishes.find((d) => d.dishId === dishId)?.isExtra || false;

        // Add to selection order
        newOrder.push({
          group: groupName,
          subGroup: subGroupName,
          dishId,
          isExtra: wasExtraBefore,
        });
      }

      setSelectionOrder(newOrder);

      let newSubSelections: {label: string; value: string}[];
      if (isCurrentlySelected) {
        newSubSelections = current.filter((d) => d.value !== dishId);
      } else {
        newSubSelections = [...current, {label: dishName, value: dishId}];
      }

      const newGroupState = {
        ...(prev[groupName] || {}),
        [subGroupName]: newSubSelections,
      };

      const newState = {
        ...prev,
        [groupName]: newGroupState,
      };

      // Pass the updated selection order to updateSelectedDishes
      updateSelectedDishes(newState, newOrder);

      return newState;
    });
  };

  // Helper: get info for sub-group display
  const getSubGroupSelectionInfo = (
    groupName: string,
    subGroupName: string,
  ) => {
    const subDishes = selectedDishes.filter(
      (d) => d.groupName === groupName && d.subGroupName === subGroupName,
    );
    const selectedCount = subDishes.length;
    const extraCount = subDishes.filter((d) => d.isExtra).length;

    const sub = selectedPackage?.mainDishes
      ?.find((g: any) => g.group === groupName)
      ?.subgroup?.find((sg: any) => sg.name === subGroupName);

    return {
      selectedOptions: groupSelections[groupName]?.[subGroupName] || [],
      freeSelectionCount: sub?.count ?? 0,
      selectedCount,
      extraCount,
      cost: sub?.cost ?? 0,
    };
  };

  const isDishSelected = (
    groupName: string,
    subGroupName: string,
    dishId: string,
  ) => {
    return (
      groupSelections[groupName]?.[subGroupName]?.some(
        (d) => d.value === dishId,
      ) ?? false
    );
  };

  const getDishStatus = (
    groupName: string,
    subGroupName: string,
    dishId: string,
  ) => {
    const dish = selectedDishes.find(
      (d) =>
        d.groupName === groupName &&
        d.subGroupName === subGroupName &&
        d.dishId === dishId,
    );

    if (!dish) return 'unselected';

    // Check if this dish was originally saved as extra
    const wasOriginallyExtra =
      selectionOrder.find(
        (entry) =>
          entry.group === groupName &&
          entry.subGroup === subGroupName &&
          entry.dishId === dishId,
      )?.isExtra || false;

    // If it was originally extra and is still selected, show as extra
    if (wasOriginallyExtra && dish.isExtra) {
      return 'extra';
    }

    return dish.isExtra ? 'extra' : 'free';
  };

  // Update prices whenever expectedPeople, selectedPackage, or selectedDishes changes
  useEffect(() => {
    if (selectedPackage) {
      const basePrice = getCurrentBasePrice();
      setCurrentBasePrice(basePrice);

      const ranges = selectedPackage?.range || selectedPackage?.ranges || [];
      if (ranges.length > 0) {
        const sortedRanges = [...ranges].sort((a, b) => a.from - b.from);
        const range = sortedRanges.find(
          (range) =>
            formExpectedPeople >= range.from && formExpectedPeople <= range.to,
        );
        setApplicableRange(range || null);
      } else {
        setApplicableRange(null);
      }
    }
  }, [selectedPackage, formExpectedPeople]);

  // Update extra dishes cost and total when selectedDishes changes
  useEffect(() => {
    const extraCost = selectedDishes
      .filter((d) => d.isExtra)
      .reduce((sum, d) => sum + (d.cost || 0), 0);
    setExtraDishesCost(extraCost);
  }, [selectedDishes]);

  // Update total when base price or extra cost changes
  useEffect(() => {
    setTotalEstimatedCost(currentBasePrice + extraDishesCost);
  }, [currentBasePrice, extraDishesCost]);

  // Get ranges for the selected package
  const getPackageRanges = () => {
    if (!selectedPackage) return [];
    return selectedPackage.range || selectedPackage.ranges || [];
  };

  // Get all ranges sorted by from value
  const getSortedRanges = () => {
    const ranges = getPackageRanges();
    return [...ranges].sort((a, b) => a.from - b.from);
  };

  const onSubmit = (data: any) => {
    // Get all selected dish IDs with their isExtra status
    const allDishIds = selectedDishes.map((dish) => ({
      dishId: dish.dishId,
      isExtra: dish.isExtra,
    }));

    // Format time properly for UTC
    const formatTimeForUTC = (dateStr: string, timeStr: string) => {
      if (!dateStr || !timeStr) return '';

      const localDateTime = new Date(`${dateStr}T${timeStr}`);
      return localDateTime.toISOString();
    };

    const formattedTime = formatTimeForUTC(data.date, data.time);

    const payload = {
      subEventId,
      name: data.name,
      address: data.address,
      date: data.date,
      time: formattedTime,
      expectedPeople: Number(data.expectedPeople) || 0,
      buffetPeople: Number(data.buffetPeople) || 0,
      sittingPeople: Number(data.sittingPeople) || 0,
      note: data.note || '',
      addon: data.addon || [],
      dishes: allDishIds,
      packageId: selectedPackageId,
    };

    updateSubEvent(payload, {
      onSuccess: () => {
        toast.success('Subevent updated successfully!');
        navigate({to: `/events/${subEvent?.eventId}`});
      },
      onError: () => toast.error('Failed to update subevent'),
    });
  };

  // Loading states
  if (loadingSubEvent || loadingPackages) return <Loader />;
  if (!subEvent) return <div>Subevent not found</div>;

  const packageOptions =
    packages?.map((pkg: any) => ({
      label: pkg.name,
      value: pkg.id,
      description: pkg.description,
      type: pkg.packageType,
    })) || [];

  const mappedServices =
    allAddOnServices?.map((s: any) => ({
      label: `${s.name} ( ₹ ${s.price || 0} )`,
      value: s.id,
    })) || [];

  return (
    <FormProvider {...methods}>
      <div className="mx-auto">
        <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              Update Subevent (Package)
            </h1>
            <div className="rounded-full bg-blue-900/50 p-2">
              <BiInfoCircle className="text-xl text-blue-300" />
            </div>
          </div>
        </div>

        <div className="animate-fade-in mt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-hidden rounded-md bg-white shadow-md dark:bg-black"
          >
            <div className="from-gray-50 to-gray-100 flex items-center justify-between border-b border-stroke bg-gradient-to-r p-5 dark:border-strokedark">
              <div className="flex items-center">
                <FaArrowLeft
                  className="mr-4 cursor-pointer text-xl transition hover:text-indigo-600"
                  onClick={() => navigate({to: `/events/${subEvent?.eventId}`})}
                />
                <div className="mr-4 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
                  Update Package Subevent
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <GenericInputField
                    name="name"
                    label="Subevent Name"
                    placeholder="Enter Subevent Name"
                    required
                    className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                  />
                  <GenericInputField
                    name="address"
                    label="Address"
                    placeholder="Enter Address"
                    required
                    className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <GenericInputField
                      name="expectedPeople"
                      label="Expected People"
                      placeholder="Enter Expected People"
                      type="number"
                      required
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                      min="0"
                    />
                    <GenericInputField
                      name="buffetPeople"
                      label="Buffet"
                      placeholder="Enter Buffet"
                      type="number"
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                      min="0"
                    />
                    <GenericInputField
                      name="sittingPeople"
                      label="Sitting"
                      placeholder="Enter Sitting"
                      type="number"
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                      min="0"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <GenericInputField
                      name="date"
                      label="Date"
                      required
                      placeholder="Select Date"
                      type="date"
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                    />
                    <GenericInputField
                      name="time"
                      label="Time"
                      required
                      placeholder="Select Time"
                      type="time"
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                    />
                  </div>
                </div>

                {/* Package Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
                        Select Package
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Choose a package that fits your event
                      </p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Expected People:{' '}
                      <span className="font-semibold">
                        {formExpectedPeople || 0}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {packages?.map((pkg: any) => (
                      <div
                        key={pkg.id}
                        type="button"
                        onClick={() => handlePackageSelect(pkg.id)}
                        className={`relative cursor-pointer rounded-md border border-stroke p-3 transition-all dark:border-strokedark ${
                          selectedPackageId === pkg.id
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 bg-white hover:shadow-sm dark:bg-boxdark'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="text-gray-900 text-base font-medium dark:text-white">
                              {pkg.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm">
                              {pkg.description || 'No description'}
                            </p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              pkg.packageType === 'VEG'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {pkg.packageType}
                          </span>
                        </div>

                        {selectedPackageId === pkg.id && (
                          <div className="absolute -right-2 -top-2">
                            <div className="rounded-full bg-blue-500 p-1 text-white">
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPackage && (
                  <div className="space-y-8">
                    {/* Customize Menu */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
                            Customize Your Menu
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Select dishes from each category
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-gray-600 dark:text-gray-400">
                            Base Price:{' '}
                            <span className="font-semibold">
                              ₹{currentBasePrice}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Included
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-amber-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Extra
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedPackage.mainDishes?.map(
                          (group: any, gIdx: number) => (
                            <div
                              key={gIdx}
                              className="overflow-hidden rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  toggleGroupExpansion(group.group)
                                }
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 flex w-full items-center justify-between p-4 text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                      expandedGroups.has(group.group)
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}
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
                                        d={
                                          expandedGroups.has(group.group)
                                            ? 'M19 9l-7 7-7-7'
                                            : 'M9 5l7 7-7 7'
                                        }
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-gray-900 font-semibold dark:text-white">
                                      {group.group}
                                    </h4>
                                    {group.optional && (
                                      <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-800/30 dark:text-amber-300">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>

                              {expandedGroups.has(group.group) && (
                                <div className="space-y-6 px-5 pb-2">
                                  {group.subgroup?.map(
                                    (sub: any, sIdx: number) => {
                                      const {
                                        selectedCount,
                                        extraCount,
                                        cost,
                                        freeSelectionCount,
                                      } = getSubGroupSelectionInfo(
                                        group.group,
                                        sub.name,
                                      );

                                      return (
                                        <div key={sIdx} className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <h5 className="text-gray-900 font-medium dark:text-white">
                                                {sub.name}
                                              </h5>
                                              {cost > 0 && (
                                                <>
                                                  <span className="text-xs">
                                                    ( You can select up to {''}
                                                    <strong>
                                                      {freeSelectionCount}
                                                    </strong>{' '}
                                                    dishes )
                                                  </span>
                                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                    (₹{cost}/extra)
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                            <div className="text-right text-sm">
                                              <span className="text-gray-900 font-medium dark:text-white">
                                                {selectedCount}
                                              </span>{' '}
                                              selected
                                              {extraCount > 0 && (
                                                <div className="text-xs text-amber-600 dark:text-amber-400">
                                                  +₹{extraCount * cost} extra
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                            {sub.dishes?.map((dish: any) => {
                                              const status = getDishStatus(
                                                group.group,
                                                sub.name,
                                                dish.id,
                                              );
                                              const isSelected =
                                                status !== 'unselected';

                                              return (
                                                <button
                                                  key={dish.id}
                                                  type="button"
                                                  onClick={() =>
                                                    handleDishSelect(
                                                      group.group,
                                                      sub.name,
                                                      dish.id,
                                                      dish.name,
                                                    )
                                                  }
                                                  className={`relative rounded-md border border-stroke p-2 text-left transition-all dark:border-strokedark ${
                                                    isSelected
                                                      ? status === 'free'
                                                        ? 'border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                                        : 'border-amber-500 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                                                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750'
                                                  }`}
                                                >
                                                  <div className="flex items-start justify-between">
                                                    <span className="text-gray-900 font-medium dark:text-white">
                                                      {dish.name}
                                                    </span>
                                                    {isSelected && (
                                                      <div
                                                        className={`rounded-full p-1 ${
                                                          status === 'free'
                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
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
                                                            d="M5 13l4 4L19 7"
                                                          />
                                                        </svg>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {isSelected && (
                                                    <div className="mt-2">
                                                      <span
                                                        className={`inline-block rounded px-2 text-xs font-medium ${
                                                          status === 'free'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                                        }`}
                                                      >
                                                        {status === 'free'
                                                          ? 'Included'
                                                          : `Extra (+₹${cost})`}
                                                      </span>
                                                    </div>
                                                  )}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Selected Dishes Summary */}
                    <div className="space-y-4 px-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
                            Selected Dishes
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {selectedDishes.length} dishes selected
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            Included:{' '}
                            <span className="font-medium text-green-600">
                              {selectedDishes.filter((d) => !d.isExtra).length}
                            </span>
                          </div>
                          <div className="bg-gray-300 dark:bg-gray-600 h-4 w-px" />
                          <div>
                            Extra:{' '}
                            <span className="font-medium text-amber-600">
                              {selectedDishes.filter((d) => d.isExtra).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedDishes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          {/* Included */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500" />
                              <h4 className="text-gray-900 font-medium dark:text-white">
                                Included Dishes
                              </h4>
                              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                {
                                  selectedDishes.filter((d) => !d.isExtra)
                                    .length
                                }
                              </span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {selectedDishes
                                .filter((d) => !d.isExtra)
                                .map((dish, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                                        <svg
                                          className="h-5 w-5 text-green-600 dark:text-green-400"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="text-gray-900 font-medium dark:text-white">
                                          {dish.dishName}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                          {dish.groupName} • {dish.subGroupName}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Included
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Extra */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-amber-500" />
                              <h4 className="text-gray-900 font-medium dark:text-white">
                                Additional Dishes
                              </h4>
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                {selectedDishes.filter((d) => d.isExtra).length}
                              </span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {selectedDishes
                                .filter((d) => d.isExtra)
                                .map((dish, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                        <svg
                                          className="h-5 w-5 text-amber-600 dark:text-amber-400"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="text-gray-900 font-medium dark:text-white">
                                          {dish.dishName}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                          {dish.groupName} • {dish.subGroupName}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                      +₹{dish.cost}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-gray-300 dark:border-gray-600 rounded-xl border-2 border-dashed p-10 text-center">
                          <div className="bg-gray-100 dark:bg-gray-700 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                            <svg
                              className="text-gray-400 dark:text-gray-500 h-8 w-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <h4 className="text-gray-900 mt-4 text-lg font-medium dark:text-white">
                            No dishes selected yet
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Expand categories above and pick your favorite
                            dishes
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cost Summary */}
                    <div className="rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                      <div className="p-6">
                        <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
                          Cost Summary
                        </h3>

                        <div className="mt-4 space-y-3">
                          {/* Base Package Price with Range Info */}
                          <div className="bg-gray-50 dark:bg-gray-800 flex items-center justify-between rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <svg
                                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 .402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-900 font-medium dark:text-white">
                                  Base Package Price
                                </p>
                                <div className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                                  <span className="font-medium">
                                    For {formExpectedPeople || 0} people
                                  </span>
                                  {getPackageRanges().length > 0 && (
                                    <>
                                      {applicableRange ? (
                                        <span className="ml-2">
                                          (Range: {applicableRange.from} -{' '}
                                          {applicableRange.to} people)
                                        </span>
                                      ) : formExpectedPeople > 0 ? (
                                        <span className="ml-2 text-amber-600">
                                          (Using closest available range)
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-gray-900 text-base font-bold dark:text-white">
                              ₹{currentBasePrice}
                            </span>
                          </div>

                          {/* Extra Dishes Cost */}
                          {extraDishesCost > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                  <svg
                                    className="h-5 w-5 text-amber-600 dark:text-amber-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-gray-900 font-medium dark:text-white">
                                    Extra Dishes
                                  </p>
                                  <p className="text-sm text-amber-600 dark:text-amber-400">
                                    {
                                      selectedDishes.filter((d) => d.isExtra)
                                        .length
                                    }{' '}
                                    items
                                  </p>
                                </div>
                              </div>
                              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                                +₹{extraDishesCost}
                              </span>
                            </div>
                          )}

                          {/* Total Estimated Cost */}
                          <div className="border-t border-stroke pt-4 dark:border-strokedark">
                            <div className="flex items-center justify-between px-2">
                              <div>
                                <p className="text-gray-900 text-base font-semibold dark:text-white">
                                  Total Estimated Cost
                                </p>
                                {formExpectedPeople > 0 && (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    For {formExpectedPeople} people
                                  </p>
                                )}
                              </div>
                              <p className="text-gray-900 text-xl font-bold dark:text-white">
                                ₹{totalEstimatedCost}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add-on Services */}
                <div className="flex flex-col gap-1">
                  <label className="text-black dark:text-white">
                    Add On service
                  </label>
                  <Controller
                    name="addon"
                    control={control}
                    defaultValue={[]}
                    render={({field}) => (
                      <Select
                        {...field}
                        isMulti
                        options={[
                          ...(mappedServices || []),
                          {
                            value: 'add_new_service',
                            label: '+ Add New Service',
                          },
                        ]}
                        value={mappedServices?.filter((service) =>
                          field.value?.includes(service.value),
                        )}
                        onChange={(selectedOptions) => {
                          const selectedValues = selectedOptions
                            ? selectedOptions.map((opt: any) => opt.value)
                            : [];
                          field.onChange(selectedValues);
                        }}
                        className="w-full"
                        classNamePrefix="react-select"
                        placeholder="Select Services..."
                        noOptionsMessage={() => 'No services available'}
                        menuPortalTarget={
                          menuPortalRef.current || document.body
                        }
                        menuPosition="fixed"
                        classNames={{
                          control: (state) =>
                            `border border-gray-300 bg-white text-black placeholder:text-gray-500
                             dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
                             ${state.isFocused ? 'border-gray-400 dark:border-slate-600' : ''}`,
                          menu: () =>
                            `bg-white text-black border border-gray-300 shadow-md
                             dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                          option: (state) =>
                            `px-3 py-2 cursor-pointer 
                             ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
                             ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                          multiValue: () =>
                            `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1`,
                          multiValueLabel: () => `text-black dark:text-white`,
                          multiValueRemove: () =>
                            `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600`,
                        }}
                        styles={{
                          menuPortal: (base) => ({...base, zIndex: 9999}),
                        }}
                        menuShouldScrollIntoView={false}
                      />
                    )}
                  />
                </div>

                <GenericTextArea
                  name="note"
                  label="Note"
                  placeholder="Enter any additional notes"
                  validation={{required: 'Note is required'}}
                />

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({to: `/events/${subEvent?.eventId}`})
                    }
                    className="hover:bg-gray-50 rounded-lg border px-6 py-3 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !selectedPackageId}
                    className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-700 py-3 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <BiSave className="mr-2 text-lg" />
                        Update Subevent
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

// ──────────────────────────────────────────────────────────────
// FINAL EXPORT: Smart wrapper that chooses the correct component
// ──────────────────────────────────────────────────────────────
const UpdateSubEventPage: React.FC = () => {
  const {id: subEventId} = Route.useParams();
  const {data: subEventRes, isLoading} = useGetSubeventById(subEventId);

  if (isLoading) return <Loader />;

  const hasPackage = !!subEventRes?.data?.subevent?.packageId;

  return hasPackage ? <UpdatePackageSubEvent /> : <UpdateSubEvent />;
};

export default UpdateSubEventPage;
