/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import {toast} from 'react-hot-toast';

interface SelectedDish {
  dishId: string;
  dishName: string;
  groupName: string;
  subGroupName: string;
  category: string;
  cost: number;
  isExtra: boolean;
  index: number;
  freeSelectionCount: number;
}

interface Package {
  id: string;
  name: string;
  description?: string;
  packageType: 'VEG' | 'NON_VEG';
  mainDishes?: Array<{
    group: string;
    count?: number;
    optional?: boolean;
    subgroup?: Array<{
      name: string;
      count?: number;
      cost?: number;
      dishes?: Array<{
        id: string;
        name: string;
      }>;
    }>;
  }>;
  range?: Array<{from: number; to: number; price: number}>;
  ranges?: Array<{from: number; to: number; price: number}>;
}

interface SubEvent {
  id: string;
  name?: string;
  address?: string;
  date?: string;
  time?: string;
  expectedPeople?: number;
  buffetPeople?: number;
  sittingPeople?: number;
  note?: string;
  packageId?: string;
  dishes?: Array<{
    id?: string;
    dishId?: string;
    isExtra: boolean;
    dish?: {id: string; name: string};
  }>;
  SubeventAddonServices?: Array<{addonServiceId: string}>;
}

interface PremiumPackageDishSelectionProps {
  subevent: SubEvent;
  singlePackage: Package;
  selectedDishes: SelectedDish[];
  onDishesChange: (dishes: SelectedDish[]) => void;
  expandedCategories: Set<string> | string[];
  onToggleCategory: (category: string) => void;
}

interface SelectionEntry {
  group: string;
  subGroup: string;
  dishId: string;
}

const PremiumPackageDishSelection: React.FC<
  PremiumPackageDishSelectionProps
> = ({
  subevent,
  singlePackage,
  selectedDishes,
  onDishesChange,
  expandedCategories,
  onToggleCategory,
}) => {
  const [groupSelections, setGroupSelections] = useState<{
    [key: string]: {[subGroupName: string]: {label: string; value: string}[]};
  }>({});
  const [selectionOrder, setSelectionOrder] = useState<SelectionEntry[]>([]);
  const [selectedDishesState, setSelectedDishesState] =
    useState<SelectedDish[]>(selectedDishes);
  const [extraDishesCost, setExtraDishesCost] = useState(0);
  const [activeOptionalGroup, setActiveOptionalGroup] = useState<string | null>(
    null,
  );
  const menuPortalRef = useRef<HTMLDivElement | null>(null);

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

  // Initialize from saved data
  useEffect(() => {
    if (!singlePackage || !subevent) {
      setGroupSelections({});
      setSelectionOrder([]);
      setSelectedDishesState([]);
      onDishesChange([]);
      return;
    }

    const allAvailableDishes = new Map<
      string,
      {dish: any; group: string; subGroup: string}
    >();

    singlePackage.mainDishes?.forEach((group: any) => {
      const groupName = group.group;
      group.subgroup?.forEach((subGroup: any) => {
        const subGroupName = subGroup.name;
        subGroup.dishes?.forEach((dish: any) => {
          allAvailableDishes.set(dish.id, {
            dish,
            group: groupName,
            subGroup: subGroupName,
          });
        });
      });
    });

    const newGroupSelections: typeof groupSelections = {};
    const newSelectionOrder: SelectionEntry[] = [];

    subevent.dishes?.forEach((d: any) => {
      const dishId = d.dishId || d.dish?.id || d.id;
      const info = allAvailableDishes.get(dishId);
      if (info) {
        if (!newGroupSelections[info.group])
          newGroupSelections[info.group] = {};
        if (!newGroupSelections[info.group][info.subGroup])
          newGroupSelections[info.group][info.subGroup] = [];

        newGroupSelections[info.group][info.subGroup].push({
          label: info.dish.name,
          value: dishId,
        });
        newSelectionOrder.push({
          group: info.group,
          subGroup: info.subGroup,
          dishId,
        });
      }
    });

    setGroupSelections(newGroupSelections);
    setSelectionOrder(newSelectionOrder);
    updateSelectedDishes(newGroupSelections, newSelectionOrder);
  }, [singlePackage, subevent]);

  // Determine which optional group (if any) is currently active
  useEffect(() => {
    let active: string | null = null;

    singlePackage?.mainDishes?.forEach((group) => {
      if (!group.optional) return;

      const selections = groupSelections[group.group];
      if (!selections) return;

      const hasAny = Object.values(selections).some((arr) => arr.length > 0);
      if (hasAny) {
        active = group.group;
        // We take the first one we find (assuming only one should be active)
      }
    });

    setActiveOptionalGroup(active);
  }, [groupSelections, singlePackage]);

  const updateSelectedDishes = (
    selections: typeof groupSelections,
    order: SelectionEntry[],
  ) => {
    const allDishes: SelectedDish[] = [];

    singlePackage?.mainDishes?.forEach((group: any) => {
      const groupName = group.group;
      const groupData = selections[groupName] || {};

      group.subgroup?.forEach((sub: any) => {
        const subName = sub.name;
        const selectedInSub = groupData[subName] || [];
        const subFreeLimit = sub.count ?? 0;
        const subCost = sub.cost ?? 0;

        selectedInSub.forEach((opt, idx) => {
          const dishInfo = sub.dishes?.find((d: any) => d.id === opt.value);
          if (!dishInfo) return;

          const isExtra = idx >= subFreeLimit;

          allDishes.push({
            dishId: opt.value,
            dishName: dishInfo.name,
            groupName,
            subGroupName: subName,
            category: subName,
            cost: subCost,
            isExtra,
            index: idx,
            freeSelectionCount: subFreeLimit,
          });
        });
      });
    });

    const sortedDishes = [...allDishes].sort((a, b) => {
      const ia = order.findIndex((e) => e.dishId === a.dishId);
      const ib = order.findIndex((e) => e.dishId === b.dishId);
      return ia - ib;
    });

    setSelectedDishesState(sortedDishes);
    onDishesChange(sortedDishes);
  };

  const handleDishSelect = (
    groupName: string,
    subGroupName: string,
    dishId: string,
    dishName: string,
  ) => {
    const group = singlePackage?.mainDishes?.find((g) => g.group === groupName);
    const isOptional = group?.optional === true;

    setGroupSelections((prev) => {
      const currentSub = prev[groupName]?.[subGroupName] || [];
      const isCurrentlySelected = currentSub.some((d) => d.value === dishId);

      // Block selection if trying to select in a different optional group
      if (!isCurrentlySelected && isOptional) {
        if (activeOptionalGroup !== null && activeOptionalGroup !== groupName) {
          toast.error('Only one optional category can be selected at a time');
          return prev;
        }
      }

      let newSubSelections = isCurrentlySelected
        ? currentSub.filter((d) => d.value !== dishId)
        : [...currentSub, {label: dishName, value: dishId}];

      const newSelections = {
        ...prev,
        [groupName]: {
          ...(prev[groupName] || {}),
          [subGroupName]: newSubSelections,
        },
      };

      // Clean up empty subgroup
      if (newSubSelections.length === 0) {
        const updatedGroup = {...newSelections[groupName]};
        delete updatedGroup[subGroupName];
        if (Object.keys(updatedGroup).length === 0) {
          delete newSelections[groupName];
        } else {
          newSelections[groupName] = updatedGroup;
        }
      }

      setSelectionOrder((prevOrder) => {
        const newOrder = isCurrentlySelected
          ? prevOrder.filter((e) => e.dishId !== dishId)
          : [...prevOrder, {group: groupName, subGroup: subGroupName, dishId}];

        updateSelectedDishes(newSelections, newOrder);
        return newOrder;
      });

      return newSelections;
    });
  };

  const getSubGroupSelectionInfo = (
    groupName: string,
    subGroupName: string,
  ) => {
    const subDishes = selectedDishesState.filter(
      (d) => d.groupName === groupName && d.subGroupName === subGroupName,
    );
    const sub = singlePackage?.mainDishes
      ?.find((g) => g.group === groupName)
      ?.subgroup?.find((sg) => sg.name === subGroupName);

    return {
      selectedCount: subDishes.length,
      extraCount: subDishes.filter((d) => d.isExtra).length,
      cost: sub?.cost ?? 0,
      freeSelectionCount: sub?.count ?? 0,
    };
  };

  const getDishStatus = (
    groupName: string,
    subGroupName: string,
    dishId: string,
  ) => {
    const dish = selectedDishesState.find(
      (d) =>
        d.groupName === groupName &&
        d.subGroupName === subGroupName &&
        d.dishId === dishId,
    );
    if (!dish) return 'unselected';
    return dish.isExtra ? 'extra' : 'free';
  };

  useEffect(() => {
    const extraCost = selectedDishesState
      .filter((d) => d.isExtra)
      .reduce((sum, d) => sum + (d.cost || 0), 0);
    setExtraDishesCost(extraCost);
  }, [selectedDishesState]);

  if (!singlePackage) {
    return (
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
          No package selected
        </h4>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Please select a package first to customize dishes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Customize Your Menu
            </h3>
            <p className="text-gray-400 text-sm">
              Select dishes from each category. Previously selected dishes are
              auto-populated.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Included</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-gray-600 dark:text-gray-400">Extra</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {singlePackage.mainDishes?.map((group: any, gIdx: number) => {
            const isExpanded =
              expandedCategories instanceof Set
                ? expandedCategories.has(group.group)
                : (expandedCategories as string[]).includes(group.group);

            const isOptional = group.optional === true;
            const isDisabledOptional =
              isOptional &&
              activeOptionalGroup !== null &&
              activeOptionalGroup !== group.group;

            return (
              <div
                key={gIdx}
                className="bg-gray-900 overflow-hidden rounded-md"
              >
                <button
                  type="button"
                  onClick={() => onToggleCategory(group.group)}
                  style={{
                    background:
                      'linear-gradient(135deg, #D4AF37 0%, #F5E3A9 50%, #B8941F 100%)',
                    padding: '15px',
                    borderRadius: '10px',
                  }}
                  className="hover:bg-gray-800 flex w-full items-center justify-between p-4 text-left text-black"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isExpanded ? 'text-black' : 'text-black'
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
                          d={isExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">{group.group}</h4>
                      {isOptional && (
                        <span className="mt-1 inline-block rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-300">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {
                      selectedDishesState.filter(
                        (d) => d.groupName === group.group,
                      ).length
                    }{' '}
                    selected
                  </div>
                </button>

                {isExpanded && (
                  <div className="relative space-y-6 px-5 pb-5">
                    {isDisabledOptional && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/40">
                        <p className="text-gray-300 px-6 text-center text-sm font-medium">
                          Only one optional section can be selected
                        </p>
                      </div>
                    )}

                    {group.subgroup?.map((sub: any, sIdx: number) => {
                      const {
                        selectedCount,
                        extraCount,
                        cost,
                        freeSelectionCount,
                      } = getSubGroupSelectionInfo(group.group, sub.name);

                      return (
                        <div key={sIdx} className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-white">
                                {sub.name}
                              </h5>
                              {cost > 0 && (
                                <span className="text-gray-400 text-xs">
                                  {freeSelectionCount === 0
                                    ? `All extra (₹${cost}/extra)`
                                    : `Up to ${freeSelectionCount} included (₹${cost}/extra)`}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-white">
                                {selectedCount}
                              </span>{' '}
                              selected
                              {extraCount > 0 && (
                                <div className="text-xs text-amber-400">
                                  +₹{extraCount * cost} extra
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {sub.dishes?.map((dish: any) => {
                              const status = getDishStatus(
                                group.group,
                                sub.name,
                                dish.id,
                              );
                              const isSelected = status !== 'unselected';

                              const dishDisabled =
                                !isSelected && isDisabledOptional;

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
                                  disabled={dishDisabled}
                                  className={`relative rounded-lg border p-3 text-left transition-all ${
                                    isSelected
                                      ? status === 'free'
                                        ? 'border-green-600 bg-green-950/40'
                                        : 'border-amber-600 bg-amber-950/40'
                                      : dishDisabled
                                        ? 'border-gray-800 bg-gray-800/50 cursor-not-allowed opacity-50'
                                        : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`font-medium ${
                                        isSelected
                                          ? 'text-white'
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      {dish.name}
                                    </span>
                                    {isSelected && (
                                      <div
                                        className={`ml-2 rounded-full p-1 ${
                                          status === 'free'
                                            ? 'bg-green-800'
                                            : 'bg-amber-800'
                                        }`}
                                      >
                                        <svg
                                          className="h-4 w-4 text-white"
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
                                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                          status === 'free'
                                            ? 'bg-green-900/60 text-green-200'
                                            : 'bg-amber-900/60 text-amber-200'
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export {PremiumPackageDishSelection};
