/* eslint-disable */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {CreateSubEventSchema} from '@/lib/validation/eventSchema';
import {
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useCreateSubevent,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import Select from 'react-select';
import GenericInputField from '../../components/Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import GenericButton from '../../components/Forms/Buttons/GenericButton';
import SubEventList from './SubEventList';
import toast from 'react-hot-toast';
import {format} from 'date-fns';
import {BiInfoCircle, BiPlus, BiSave} from 'react-icons/bi';
import {Loader} from '../Loader/Loader';
import {useGetAllPackage} from '@/lib/react-query/package/displaypackage';
import {useAuthContext} from '@/context/AuthContext';
import {useGetAddOnServices} from '@/lib/react-query/queriesAndMutations/cateror/addonservice';
import AddDishPopup from '../Popup/AddDishPopup';
import AddOnServicePopup from '../Popup/AddOnServicePopup';

export type SubEventFormValues = z.infer<typeof CreateSubEventSchema>;

interface DishRow {
  id: number;
  category?: string;
  categoryName?: string;
  dishes: {label: string; value: string}[];
  count?: number;
  Rate?: number;
}

// Types based on your package data structure
interface Dish {
  id: string;
  name: string;
  cost?: number;
}

interface SubGroup {
  name: string;
  selectCount: number;
  cost: number;
  dishes: Dish[];
}

interface Group {
  group: string;
  subGroups: SubGroup[];
}

interface Range {
  id: string;
  from: number;
  to: number;
  price: number;
}

interface ExtraDish {
  categoryId: string;
  categoryName: string;
  selectCount: number;
  dishes: Array<{
    id: string;
    name: string;
    cost: number;
  }>;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  packageType: string;
  createdAt: string;
  ranges: Range[];
  groups: Group[];
  extraDishes: ExtraDish[];
}

interface SelectedDish {
  dishId: string;
  dishName: string;
  category?: string;
  subGroupName?: string;
  groupName?: string;
  isExtra?: boolean;
  cost?: number;
}

// Header Component
const SubEventHeader: React.FC = () => (
  <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-white">Subevent Management</h1>
      <div className="rounded-full bg-blue-900/50 p-2">
        <BiInfoCircle className="text-xl text-blue-300" />
      </div>
    </div>
  </div>
);

// Dish Selection Tab Component
const DishSelectionTab: React.FC<{
  dishTab: 'selectDishes' | 'selectPackage';
  setDishTab: (tab: 'selectDishes' | 'selectPackage') => void;
}> = ({dishTab, setDishTab}) => (
  <div className="flex space-x-2 rounded-xl bg-white p-1.5 shadow-md dark:bg-black">
    <button
      onClick={() => setDishTab('selectDishes')}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
        dishTab === 'selectDishes'
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 bg-transparent hover:bg-indigo-100'
      }`}
      aria-selected={dishTab === 'selectDishes'}
    >
      Select Dishes
    </button>
    <button
      onClick={() => setDishTab('selectPackage')}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
        dishTab === 'selectPackage'
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 bg-transparent hover:bg-indigo-100'
      }`}
      aria-selected={dishTab === 'selectPackage'}
    >
      Select Package
    </button>
  </div>
);

const PackageSelectionComponent: React.FC<{
  packages: any[];
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string | null) => void;
  selectedDishes: SelectedDish[];
  setSelectedDishes: (dishes: SelectedDish[]) => void;
  menuPortalRef: React.RefObject<HTMLDivElement>;
  expectedPeople: number;
}> = ({
  packages,
  selectedPackageId,
  setSelectedPackageId,
  selectedDishes,
  setSelectedDishes,
  menuPortalRef,
  expectedPeople,
}) => {
  interface SelectionEntry {
    group: string;
    subGroup: string;
    dishId: string;
  }

  const [groupSelections, setGroupSelections] = useState<{
    [key: string]: {[subGroupName: string]: {label: string; value: string}[]};
  }>({});

  const [selectionOrder, setSelectionOrder] = useState<SelectionEntry[]>([]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Helper function to calculate base price based on expected people
  const calculateBasePrice = (pkg: any, peopleCount: number): number => {
    // Check both 'range' and 'ranges' for backward compatibility
    const ranges = pkg?.range || pkg?.ranges || [];

    if (!Array.isArray(ranges) || ranges.length === 0) {
      return 0; // No price available
    }

    // Sort ranges by 'from' value to ensure proper order
    const sortedRanges = [...ranges].sort((a, b) => a.from - b.from);

    // Find the appropriate range for the people count
    const applicableRange = sortedRanges.find(
      (range) => peopleCount >= range.from && peopleCount <= range.to,
    );

    if (applicableRange) {
      return applicableRange.price;
    }

    // If no range matches, use the closest range
    // For people less than smallest range, use first range price
    if (peopleCount < sortedRanges[0].from) {
      return sortedRanges[0].price;
    }

    // For people greater than largest range, use last range price
    if (peopleCount > sortedRanges[sortedRanges.length - 1].to) {
      return sortedRanges[sortedRanges.length - 1].price;
    }

    // Fallback to first price
    return ranges[0]?.price || 0;
  };

  // Get current base price for selected package
  const getCurrentBasePrice = (): number => {
    if (!selectedPackage) {
      return 0;
    }

    // Use expectedPeople if available, otherwise use 0
    const peopleCount = expectedPeople > 0 ? expectedPeople : 0;
    return calculateBasePrice(selectedPackage, peopleCount);
  };

  // Helper function to display price in package cards
  const getPriceForDisplay = (pkg: any): string => {
    const ranges = pkg?.range || pkg?.ranges || [];

    if (ranges.length === 0) {
      return `₹0`; // No price available
    }

    const sortedRanges = [...ranges].sort((a, b) => a.from - b.from);

    if (sortedRanges.length === 1) {
      return `₹${sortedRanges[0].price} (${sortedRanges[0].from}+ people)`;
    }

    const minPrice = Math.min(...sortedRanges.map((r) => r.price));
    const maxPrice = Math.max(...sortedRanges.map((r) => r.price));

    if (minPrice === maxPrice) {
      return `₹${minPrice} (from ${sortedRanges[0].from} people)`;
    }

    return `₹${minPrice} - ₹${maxPrice}`;
  };

  // Get selected package
  const selectedPackage = selectedPackageId
    ? packages.find((pkg) => pkg.id === selectedPackageId)
    : null;

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
        // Remove from order
        newOrder = newOrder.filter(
          (e) =>
            !(
              e.group === groupName &&
              e.subGroup === subGroupName &&
              e.dishId === dishId
            ),
        );
      } else {
        // Add to end of order
        newOrder.push({group: groupName, subGroup: subGroupName, dishId});
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

      updateSelectedDishes(newState, newOrder);

      return newState;
    });
  };

  // Core logic: determine which dishes are free vs extra
  const updateSelectedDishes = (
    selectionsState: typeof groupSelections,
    order: SelectionEntry[],
  ) => {
    const allDishes: SelectedDish[] = [];

    selectedPackage?.mainDishes?.forEach((group: any) => {
      const groupName = group.group;
      const mainFreeLimit = group.count ?? 0;
      const groupSelections = selectionsState[groupName] || {};
      const groupOrder = order.filter((e) => e.group === groupName);

      // ── 1. Collect candidates that could be free (respect subgroup limit first)
      const freeCandidates: {
        subGroup: string;
        dishId: string;
        dishName: string;
        cost: number;
        globalOrderIndex: number;
      }[] = [];

      // ── Dishes that exceed subgroup limit → always extra
      Object.entries(groupSelections).forEach(
        ([subName, selectedDishes]: any) => {
          const sub = group.subgroup?.find((sg: any) => sg.name === subName);
          if (!sub) return;

          const subFreeLimit = sub.count ?? 0;
          const subCost = sub.cost ?? 0;

          selectedDishes.forEach((opt: any, idxInSub: number) => {
            const dish = sub.dishes?.find((d: any) => d.id === opt.value);
            if (!dish) return;

            const entry = {
              subGroup: subName,
              dishId: opt.value,
              dishName: dish.name,
              cost: subCost,
              globalOrderIndex: groupOrder.findIndex(
                (e) => e.subGroup === subName && e.dishId === opt.value,
              ),
            };

            if (idxInSub < subFreeLimit) {
              // Still eligible for group free slot
              freeCandidates.push(entry);
            } else {
              // Exceeds subgroup's own limit → extra
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
            }
          });
        },
      );

      // ── 2. Sort candidates by selection order (earliest selected get priority)
      freeCandidates.sort((a, b) => a.globalOrderIndex - b.globalOrderIndex);

      // ── 3. Apply group-level limit
      freeCandidates.forEach((cand, idx) => {
        const isFree = idx < mainFreeLimit;

        const sub = group.subgroup?.find(
          (sg: any) => sg.name === cand.subGroup,
        );
        const subFreeLimit = sub?.count ?? 0;

        allDishes.push({
          dishId: cand.dishId,
          dishName: cand.dishName,
          groupName,
          subGroupName: cand.subGroup,
          category: cand.subGroup,
          cost: isFree ? 0 : cand.cost,
          isExtra: !isFree,
          index: idx,
          freeSelectionCount: subFreeLimit,
        });
      });
    });

    // Sort dishes by global selection order (optional - improves UX)
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
    return dish.isExtra ? 'extra' : 'free';
  };

  // Calculate current prices - Use useEffect to update when expectedPeople changes
  const [currentBasePrice, setCurrentBasePrice] = useState(0);
  const [applicableRange, setApplicableRange] = useState<any>(null);
  const [extraDishesCost, setExtraDishesCost] = useState(0);
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);

  // Update prices whenever expectedPeople, selectedPackage, or selectedDishes changes
  useEffect(() => {
    if (selectedPackage) {
      const basePrice = getCurrentBasePrice();
      setCurrentBasePrice(basePrice);

      // Find applicable range for display
      const ranges = selectedPackage?.range || selectedPackage?.ranges || [];
      if (ranges.length > 0) {
        const sortedRanges = [...ranges].sort((a, b) => a.from - b.from);
        const range = sortedRanges.find(
          (range) => expectedPeople >= range.from && expectedPeople <= range.to,
        );
        setApplicableRange(range || null);
      } else {
        setApplicableRange(null);
      }
    }
  }, [selectedPackage, expectedPeople]);

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

  // Check if expected people falls within any range
  const isWithinAnyRange = () => {
    if (expectedPeople <= 0) return false;
    const ranges = getPackageRanges();
    return ranges.some(
      (range) => expectedPeople >= range.from && expectedPeople <= range.to,
    );
  };

  return (
    <div className="space-y-8">
      {/* Package Selection Cards */}
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
            <span className="font-semibold">{expectedPeople || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
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
                  <span className="font-semibold">₹{currentBasePrice}</span>
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
              {selectedPackage.mainDishes?.map((group: any, gIdx: number) => (
                <div
                  key={gIdx}
                  className="overflow-hidden rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                >
                  <button
                    onClick={() => toggleGroupExpansion(group.group)}
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
                      {group.subgroup?.map((sub: any, sIdx: number) => {
                        const {
                          selectedCount,
                          extraCount,
                          cost,
                          freeSelectionCount,
                        } = getSubGroupSelectionInfo(group.group, sub.name);

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
                                      <strong>{freeSelectionCount}</strong>{' '}
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
                                const isSelected = status !== 'unselected';

                                return (
                                  <button
                                    key={dish.id}
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
                      })}
                    </div>
                  )}
                </div>
              ))}
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
                      {selectedDishes.filter((d) => !d.isExtra).length}
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
                  Expand categories above and pick your favorite dishes
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
                          For {expectedPeople || 0} people
                        </span>
                        {getPackageRanges().length > 0 && (
                          <>
                            {applicableRange ? (
                              <span className="ml-2">
                                (Range: {applicableRange.from} -{' '}
                                {applicableRange.to} people)
                              </span>
                            ) : expectedPeople > 0 ? (
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

                {/* Show range breakdown if applicable */}
                {getPackageRanges().length > 0 &&
                  expectedPeople > 0 &&
                  !applicableRange && (
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                      <div className="text-gray-700 dark:text-gray-300 text-sm">
                        <div className="mb-1 font-medium">
                          Available Price Ranges:
                        </div>
                        <ul className="space-y-1">
                          {getSortedRanges().map((range, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>
                                {range.from} - {range.to} people:
                              </span>
                              <span className="font-medium">
                                ₹{range.price}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

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
                          {selectedDishes.filter((d) => d.isExtra).length} items
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
                      {expectedPeople > 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          For {expectedPeople} people
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
    </div>
  );
};
interface SelectedDish {
  dishId: string;
  dishName: string;
  groupName?: string;
  subGroupName?: string;
  category: string;
  cost: number;
}
// Universal Dish Selector Component
const UniversalDishSelector: React.FC<{
  control: any;
  allDishOptions: any[];
  setIsAddDishModalOpen: (open: boolean) => void;
  menuPortalRef: React.RefObject<HTMLDivElement>;
}> = ({control, allDishOptions, setIsAddDishModalOpen, menuPortalRef}) => {
  return (
    <div>
      <label className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium">
        Universal Dish Selector
      </label>
      <Controller
        name="universalDish"
        control={control}
        render={({field}) => (
          <Select
            options={[
              {value: 'add_new_dish', label: '➕ Add New Dish'},
              ...allDishOptions.map(({value, label}) => ({value, label})),
            ]}
            value={
              allDishOptions.find((opt) => opt.value === field.value) || null
            }
            onChange={(option) => {
              if (option?.value === 'add_new_dish') {
                setIsAddDishModalOpen(true);
                field.onChange('');
              } else {
                field.onChange(option?.value || '');
              }
            }}
            className="w-full"
            classNamePrefix="react-select"
            placeholder="Select Dish"
            aria-label="Universal Dish Selector"
            menuPortalTarget={menuPortalRef.current || document.body}
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
  );
};

// Category Dish Selection Component
const CategoryDishSelection: React.FC<{
  DishCategories: any;
  Dishes: any;
  control: any;
  handleDishSelect: (categoryName: string, selectedOptions: any) => void;
  setIsAddDishModalOpen: (open: boolean) => void;
  menuPortalRef: React.RefObject<HTMLDivElement>;
}> = ({
  DishCategories,
  Dishes,
  control,
  handleDishSelect,
  setIsAddDishModalOpen,
  menuPortalRef,
}) => {
  // Sort categories by priority (step-wise order)
  const sortedCategories = useMemo(() => {
    const categories = DishCategories?.data?.categories || [];
    return categories.sort(
      (a: any, b: any) => (a.priority || 0) - (b.priority || 0),
    );
  }, [DishCategories]);

  return (
    <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
      <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
        <h3 className="text-gray-800 font-semibold">
          Dish Selection by Category (Step-wise Order)
        </h3>
      </div>
      <div className="space-y-5 p-4">
        {sortedCategories.map((category: {id: string; name: string}) => {
          const fieldName = `dishes.${category.name.replace(/\s+/g, '')}`;
          return (
            <div
              key={category.id}
              className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
            >
              <label className="text-gray-700 dark:text-gray-200 mb-2 w-full text-sm font-medium sm:w-1/4">
                {category.name}
              </label>
              <Controller
                name={fieldName}
                control={control}
                render={({field}) => (
                  <Select
                    isMulti
                    options={[
                      ...(Dishes?.data?.dishes
                        ?.filter((dish: any) => dish.categoryId === category.id)
                        ?.map((dish: any) => ({
                          label: dish.name,
                          value: dish.id,
                        })) || []),
                    ]}
                    value={field.value || []}
                    onChange={(selectedOptions) => {
                      // Update the form field with new selection
                      field.onChange(selectedOptions || []);
                      // Update selected dishes state
                      handleDishSelect(category.name, selectedOptions || []);
                    }}
                    className="w-full sm:w-3/4"
                    classNamePrefix="react-select"
                    menuPortalTarget={menuPortalRef.current || document.body}
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
                    aria-label={`Select dishes for ${category.name}`}
                  />
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// AddOn Service Selection Component
const AddOnServiceSelection: React.FC<{
  control: any;
  allAddOnServices: any;
  setIsAddServiceModalOpen: (open: boolean) => void;
  menuPortalRef: React.RefObject<HTMLDivElement>;
}> = ({control, allAddOnServices, setIsAddServiceModalOpen, menuPortalRef}) => {
  const mappedServices = allAddOnServices?.map((service: any) => ({
    label: `${service.name} ( ₹ ${service.price} )`,
    value: service.id,
  }));

  return (
    <div className="flex flex-col gap-1">
      <label className="text-black dark:text-white">Add On service</label>
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
              {value: 'add_new_service', label: '+ Add New Service'},
            ]}
            value={mappedServices?.filter((service) =>
              field.value?.includes(service.value),
            )}
            onChange={(selectedOptions) => {
              const hasAddNewOption = selectedOptions?.some(
                (opt: any) => opt.value === 'add_new_service',
              );
              if (hasAddNewOption) {
                setIsAddServiceModalOpen(true);
                const filteredOptions =
                  selectedOptions?.filter(
                    (opt: any) => opt.value !== 'add_new_service',
                  ) || [];
                const selectedValues = filteredOptions
                  ? filteredOptions.map((opt: any) => opt.value)
                  : [];
                field.onChange(selectedValues);
              } else {
                const selectedValues = selectedOptions
                  ? selectedOptions.map((opt: any) => opt.value)
                  : [];
                field.onChange(selectedValues);
              }
            }}
            className="w-full"
            classNamePrefix="react-select"
            placeholder="Select Services..."
            noOptionsMessage={() => 'No services available'}
            menuPortalTarget={menuPortalRef.current}
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
            styles={{menuPortal: (base) => ({...base, zIndex: 9999})}}
            menuShouldScrollIntoView={false}
          />
        )}
      />
    </div>
  );
};

// Main Form Component
const CreateSubEventForm: React.FC<{eventId: string}> = ({eventId}) => {
  const methods = useForm<SubEventFormValues & {universalDish: string}>({
    resolver: zodResolver(CreateSubEventSchema),
    defaultValues: {
      subEventName: '',
      date: '',
      time: '',
      dishes: {},
      universalDish: '',
      note: '',
    },
  });

  const {watch, setValue, getValues, handleSubmit, control} = methods;
  const {data: DishCategories} = useGetDishCategories();
  const {data: Dishes, refetch: refetchDishes} = useGetDishes();
  const {mutate: createSubevent, isPending} = useCreateSubevent();
  const {data: subEventResponse} = useGetSubevent(eventId);
  const {data: packagesResponse} = useGetAllPackage();
  const {user} = useAuthContext();
  const {data: allAddOnServices, refetch: refetchAddOnServices} =
    useGetAddOnServices(user?.id ?? '');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [dishTab, setDishTab] = useState<'selectDishes' | 'selectPackage'>(
    'selectDishes',
  );
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // New states for package selection
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [packageSelectedDishes, setPackageSelectedDishes] = useState<
    SelectedDish[]
  >([]);

  const menuPortalRef = useRef<HTMLDivElement | null>(null);
  const restriction = user?.employeeRestriction?.subEventPage;
  const role = user?.role;

  useEffect(() => {
    setStartDate(localStorage.getItem('startDate'));
    setEndDate(localStorage.getItem('endDate'));
  }, []);

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
        menuPortalRef.current = null;
      }
    };
  }, []);

  const generateDateOptions = (start: string | null, end: string | null) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArray = [];
    while (startDate <= endDate) {
      dateArray.push({
        value: startDate.toISOString().split('T')[0],
        label: format(startDate, 'dd-MMM-yyyy'),
      });
      startDate.setDate(startDate.getDate() + 1);
    }
    return dateArray;
  };

  const dateOptions = generateDateOptions(startDate, endDate);

  useEffect(() => {
    if (dateOptions?.length > 0) {
      setValue('date', dateOptions[0].value);
    }
  }, [dateOptions, setValue]);

  const allDishOptions = React.useMemo(() => {
    return (
      Dishes?.data?.dishes.map((d: any) => ({
        value: d.id,
        label: d.name,
        categoryId: d.category?.id,
        categoryName: d.category?.name,
      })) || []
    );
  }, [Dishes]);

  const handleDishAddSuccess = () => {
    refetchDishes();
    setIsAddDishModalOpen(false);
  };

  const handleServiceAddSuccess = () => {
    refetchAddOnServices();
    setIsAddServiceModalOpen(false);
  };

  const universalDish = watch('universalDish');

  React.useEffect(() => {
    if (!universalDish) return;
    const selectedDish = allDishOptions.find(
      (d: any) => d.value === universalDish,
    );
    if (!selectedDish) return;
    const fieldName = `dishes.${selectedDish.categoryName?.replace(/\s+/g, '') || 'Uncategorized'}`;
    const existing = getValues(fieldName) || [];
    if (!existing.some((item: any) => item.value === selectedDish.value)) {
      const newEntry = {value: selectedDish.value, label: selectedDish.label};
      setValue(fieldName, [...existing, newEntry]);
      handleDishSelect(selectedDish.categoryName || 'Uncategorized', [
        ...existing,
        newEntry,
      ]);
    }
    setValue('universalDish', '');
  }, [universalDish, allDishOptions, setValue, getValues]);

  const handleDishSelect = (categoryName: string, selectedOptions: any) => {
    const selectedDishIds =
      selectedOptions?.map((option: any) => option.value) || [];

    // Get all dish IDs from all categories to have a complete picture
    const formDishes = getValues('dishes') || {};
    const allSelectedDishes = Object.values(formDishes).flatMap(
      (dishes: any) => dishes?.map((dish: any) => dish.value) || [],
    );

    // Create a Set of all unique dish IDs
    const allDishSet = new Set(allSelectedDishes);

    // Remove deselected dishes and add newly selected ones
    selectedDishIds.forEach((dishId: string) => {
      allDishSet.add(dishId);
    });

    // Update the state with the complete set
    setSelectedDishes(Array.from(allDishSet));
  };

  const onSubmit = (data: SubEventFormValues) => {
    const isNameAlreadyExist = subEventResponse?.data?.subEvents?.some(
      (subEvent: any) => subEvent.name === data.subEventName,
    );
    if (isNameAlreadyExist) {
      toast.error('Sub Event name already exists');
      return;
    }

    const combinedDateTime = new Date(
      `${data.date}T${data.time}:00Z`,
    ).toISOString();

    let formattedDishes: {dishId: string; isExtra: boolean}[];

    if (dishTab === 'selectDishes') {
      // ── Mode: manual dish selection ──
      // For now we assume ALL manually selected dishes are included (no extra logic)
      // If you later want to apply counting rules here too → you can extend it
      const allDishIds = selectedDishes; // string[]
      formattedDishes = allDishIds.map((dishId) => ({
        dishId,
        isExtra: false, // ← most common default for manual selection
      }));
    } else {
      // ── Mode: package + customization ──
      formattedDishes = packageSelectedDishes.map((dish) => ({
        dishId: dish.dishId,
        isExtra: dish.isExtra ?? false, // ← this is what you want!
      }));
    }

    const formData = {
      name: data.subEventName,
      address: data.subEventAddress || '',
      dishes: formattedDishes,
      expectedPeople: data.expectedPeople,
      sittingPeople: data.sittingPeople || 0,
      buffetPeople: data.buffetPeople || 0,
      time: combinedDateTime,
      date: data.date,
      eventId,
      packageId:
        dishTab === 'selectPackage'
          ? selectedPackageId || undefined
          : undefined,
      note: data.note || '',
      addon: data.addon || [],
    };

    createSubevent(formData, {
      onSuccess: () => {
        methods.reset();
        setSelectedDishes([]);
        setSelectedPackageId(null);
        setPackageSelectedDishes([]);
      },
    });
  };
  const expectedPeople = watch('expectedPeople') || 0;

  if (isPending || !Dishes?.data?.dishes) return <Loader />;

  return (
    <FormProvider {...methods}>
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="overflow-hidden rounded-md bg-white shadow-md dark:bg-black">
          <div className="from-gray-50 to-gray-100 flex items-center justify-between border-b border-stroke bg-gradient-to-r p-5 dark:border-strokedark">
            <div className="flex items-center">
              <div className="mr-4 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
                Create Subevent
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GenericInputField
                  name="subEventName"
                  label="Subevent Name"
                  placeholder="Enter Subevent Name"
                  required
                  className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                />
                <GenericInputField
                  name="subEventAddress"
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
                  <GenericDropdown
                    name="date"
                    label="Date"
                    required
                    options={dateOptions}
                    control={control}
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
              <div className="space-y-6">
                <DishSelectionTab dishTab={dishTab} setDishTab={setDishTab} />
                {dishTab === 'selectDishes' && (
                  <div className="space-y-6">
                    <UniversalDishSelector
                      control={control}
                      allDishOptions={allDishOptions}
                      setIsAddDishModalOpen={setIsAddDishModalOpen}
                      menuPortalRef={menuPortalRef}
                    />
                    <CategoryDishSelection
                      DishCategories={DishCategories}
                      Dishes={Dishes}
                      control={control}
                      handleDishSelect={handleDishSelect}
                      setIsAddDishModalOpen={setIsAddDishModalOpen}
                      menuPortalRef={menuPortalRef}
                    />
                  </div>
                )}

                {dishTab === 'selectPackage' && (
                  <PackageSelectionComponent
                    packages={packagesResponse || []}
                    selectedPackageId={selectedPackageId}
                    setSelectedPackageId={setSelectedPackageId}
                    selectedDishes={packageSelectedDishes}
                    setSelectedDishes={setPackageSelectedDishes}
                    menuPortalRef={menuPortalRef}
                    expectedPeople={expectedPeople}
                  />
                )}

                <AddOnServiceSelection
                  control={control}
                  allAddOnServices={allAddOnServices}
                  setIsAddServiceModalOpen={setIsAddServiceModalOpen}
                  menuPortalRef={menuPortalRef}
                />

                {isAddDishModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-black">
                      <AddDishPopup
                        onClose={() => setIsAddDishModalOpen(false)}
                        onSuccess={handleDishAddSuccess}
                      />
                    </div>
                  </div>
                )}
                {isAddServiceModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-black">
                      <AddOnServicePopup
                        onClose={() => setIsAddServiceModalOpen(false)}
                        onSuccess={handleServiceAddSuccess}
                      />
                    </div>
                  </div>
                )}

                <GenericTextArea
                  name="note"
                  label="Note"
                  placeholder="Enter any additional notes"
                  validation={{required: 'Note is required'}}
                />

                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending}
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <BiSave className="mr-2 text-lg" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  );
};

// Main Component
const SubEventManagement: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.subEventPage;
  const role = user?.role;
  const {id: EventId} = Route.useParams();
  const {
    data: subEventResponse,
    isLoading: isLoadingSubEvents,
    refetch,
  } = useGetSubevent(EventId);

  useEffect(() => {
    refetch();
  }, []);

  if (isLoadingSubEvents) {
    return <Loader />;
  }

  return (
    <div className="mx-auto">
      <SubEventHeader />
      <div className="mt-6">
        {subEventResponse?.data?.subEvents?.length > 0 ? (
          <SubEventList />
        ) : (
          <></>
        )}
        <div className="animate-fade-in">
          <CreateSubEventForm eventId={EventId} />
        </div>
      </div>
    </div>
  );
};

export default SubEventManagement;
