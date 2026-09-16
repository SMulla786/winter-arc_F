/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {
  useDeleteAddedRawmaterialForSubevent,
  useGetCaterorById,
  useGetNewRawMaterialsFroSubevent,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetAllRawmaterialsUsageFromEvent,
  useGetEventRawMaterial,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {usePostExternalVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import {shareLinkSchema} from '@/lib/validation/vendorSchema';
import {Route} from '@/routes/_app/_event/events.$id';
import {zodResolver} from '@hookform/resolvers/zod';
import 'jspdf-autotable';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import {FaAngleDown, FaAngleRight, FaFilter, FaShare} from 'react-icons/fa';
import {Loader} from '../Loader/Loader';
import ExtraRawmaterial from './ExtraRawmaterial';
import RedDishesShow from './RawMaterialComponents/RedDishesShow';
import Download from './RawmaterialOrderComponents/Download';
import {
  CategoryOption,
  ExtraRawMaterial,
  FormattedData,
  RawMaterial,
} from './RawmaterialOrderComponents/RawmaterialOrderTypes';
import * as helpers from './RawmaterialOrderComponents/RawMaterialOrderHelper';

const RawMaterialOrder: React.FC = () => {
  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.rawMaterialOrder;
  const role = user?.role;
  const {id: EventId} = Route.useParams();

  // API Queries
  const {data: vendorData, isLoading} = useGetEventRawMaterial(EventId);
  const {data: usageData} = useGetAllRawmaterialsUsageFromEvent(EventId);

  const usageMap = useMemo(() => {
    if (!usageData?.data) return new Map<string, any[]>();

    const map = new Map<string, any[]>();

    usageData.data.forEach((rm: any) => {
      // Use rmName as key (or rmId if names can collide)
      map.set(rm.rmName, rm.dishes);
    });

    return map;
  }, [usageData]);

  const {data: allRawMaterial} = useGetRawMaterialsCateror();
  const {data: eventData} = useGetSubevent(EventId);
  const {data: subEventResponse} = useGetSubevent(EventId);
  const {mutateAsync: deleteRawMaterialForSubevent} =
    useDeleteAddedRawmaterialForSubevent();

  const catererId = user?.caterorId || '';
  const {data: catererData} = useGetCaterorById(catererId);
  const catererLogo = catererData?.data?.image || '';

  // Memoized data calculations using helpers
  const formattedIds = useMemo(
    () => vendorData?.data?.formatedRawMaterials?.map((item) => item.id),
    [vendorData?.data?.formatedRawMaterials],
  );

  const missingRawMaterials = useMemo(
    () =>
      helpers.calculateMissingRawMaterials(
        allRawMaterial?.data?.rawMaterials,
        formattedIds,
      ),
    [allRawMaterial?.data?.rawMaterials, formattedIds],
  );

  const convertedMissing = useMemo(
    () => helpers.convertMissingToStandardFormat(missingRawMaterials),
    [missingRawMaterials],
  );

  const {
    data: extraAddedRawmaterials,
    refetch: refetchExtraRawMaterials,
    isLoading: isLoadingExtraMaterials,
  } = useGetNewRawMaterialsFroSubevent(EventId);

  const fetchMaterials = useCallback(() => {
    refetchExtraRawMaterials();
  }, [refetchExtraRawMaterials]);

  const {mutate: sendExternalVendor} = usePostExternalVendor();

  // State
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [hasUserChangedExtra, setHasUserChangedExtra] = useState(false);
  const [rawMaterial, setRawMaterial] = useState<FormattedData | null>(null);
  const [filters, setFilters] = useState({
    subEvent: false,
    maharaj: false,
    category: true,
  });
  const [selectedMaharaj, setSelectedMaharaj] = useState<string | null>(null);
  const [startInventoryValue, setInitialInventoryValue] = useState<{
    [key: string]: number;
  }>({});
  const [initialOrderQuanity, setInitialOrderQuanity] = useState<{
    [key: string]: number;
  }>({});
  const [newinitialOrderQuanity, setNewInitialOrderQuanity] = useState<{
    [key: string]: number;
  }>({});
  const [extraQty, setExtraQty] = useState<{[key: string]: number}>({});
  const [categoryForExtra, setCategoryForExtra] = useState<string[]>([]);
  const isManualChange = useRef<{[key: string]: boolean}>({});
  const [extraPercentage, setExtraPercentage] = useState<{
    [key: string]: number;
  }>({});
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  const [selectedColumns, setSelectedColumns] = useState({
    inventory: true,
    inventory_value: true,
    totalQuantity: true,
    orderQuantity: true,
    requiredQuantity: true,
    extraQuantity: true,
  });
  const [inventoryQuantities, setInventoryQuantities] = useState<{
    [key: string]: string | number;
  }>({});

  // Generate vendor link using helper
  const generateVendorLink = useCallback(() => {
    return helpers.generateVendorLink(
      user?.fullname,
      user?.caterorId,
      EventId,
      selectedCategoryIds,
    );
  }, [user?.fullname, user?.caterorId, EventId, selectedCategoryIds]);

  const registrationLink = generateVendorLink();

  const methods = useForm({
    resolver: zodResolver(shareLinkSchema),
    defaultValues: {
      EventId: EventId,
      sponsorId: user?.caterorId,
      link: registrationLink,
    },
  });

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }

      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get clamped inventory function
  const getClampedInventory = useCallback(
    (item: RawMaterial) => {
      const inventoryValue =
        Number(inventoryQuantities[item?.id || '']) || item?.inventory || 0;
      return inventoryValue < 0 ? 0 : inventoryValue;
    },
    [inventoryQuantities],
  );

  // Memoized mergeByName with getClampedInventory
  const mergeByNameMemoized = useCallback(
    (items: RawMaterial[]) => helpers.mergeByName(items, getClampedInventory),
    [getClampedInventory],
  );

  // Initialize data on vendorData change
  useEffect(() => {
    if (vendorData?.data) {
      const sortedMaterials = helpers.sortRawMaterials(
        vendorData.data.formatedRawMaterials,
      );

      if (sortedMaterials && sortedMaterials.length > 0) {
        const uniqueCategories: CategoryOption[] = [];
        const seen = new Set();

        sortedMaterials.forEach((item) => {
          if (!seen.has(item.categoryId)) {
            seen.add(item.categoryId);
            uniqueCategories.push({
              name: item.category,
              id: item.categoryId,
            });
          }
        });
        setCategoryOptions(uniqueCategories);
      }
    }
  }, [vendorData]);

  // Set raw material data
  useEffect(() => {
    if (vendorData?.data) {
      const sortedMaterials = helpers.sortRawMaterials(
        vendorData.data.formatedRawMaterials,
      );

      setRawMaterial({
        ...vendorData.data,
        formatedRawMaterials: sortedMaterials,
      });

      const initialInventory: {[key: string]: number} = {};
      const initialInventoryValue: {[key: string]: number} = {};
      const initialOrderQuantity: {[key: string]: number} = {};

      sortedMaterials.forEach((item) => {
        if (item?.id) {
          initialInventory[item.id] = item.inventory || 0;
          initialInventoryValue[item.id] = item.inventory_value || 0;
          initialOrderQuantity[item.id] = item.orderQuantity || 0;
        }
      });

      setInventoryQuantities(initialInventory);
      setInitialInventoryValue(initialInventoryValue);
      setInitialOrderQuanity(initialOrderQuantity);
      setNewInitialOrderQuanity(initialOrderQuantity);
    }
  }, [vendorData, extraAddedRawmaterials?.data]);

  // Merge extra materials
  const mergedMaterials = useMemo(
    () => helpers.mergeRawMaterials(extraAddedRawmaterials?.data),
    [extraAddedRawmaterials?.data],
  );

  // Get existing material data
  const getExistingMaterialData = useCallback(() => {
    return helpers.getExistingMaterialData(
      rawMaterial?.formatedRawMaterials,
      extraAddedRawmaterials?.data,
    );
  }, [rawMaterial?.formatedRawMaterials, extraAddedRawmaterials?.data]);

  const missing = useMemo(
    () => getExistingMaterialData(),
    [getExistingMaterialData],
  );

  // Column selection handler
  const toggleColumnSelection = useCallback(
    (column: keyof typeof selectedColumns) => {
      setSelectedColumns((prev) => ({...prev, [column]: !prev[column]}));
    },
    [],
  );

  // Expand/collapse handler
  const toggleExpand = useCallback((keyPath: string) => {
    setExpanded((prev) => ({...prev, [keyPath]: !prev[keyPath]}));
  }, []);

  // Inventory change handler
  const handleInventoryChange = useCallback((id: string, value: string) => {
    setInitialInventoryValue((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  }, []);

  // Quantity change handler
  const handleQuantityChange = useCallback((id: string, value: string) => {
    isManualChange.current[id] = true;
    setNewInitialOrderQuanity((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  }, []);

  // Initialize extra quantities
  useEffect(() => {
    if (vendorData?.data?.formatedRawMaterials) {
      const extraQty: {[key: string]: number} = {};
      vendorData?.data?.formatedRawMaterials?.forEach((item: any) => {
        extraQty[item.id] = item?.extra || 0;
      });
      setExtraQty(extraQty);
    }
  }, [vendorData?.data?.formatedRawMaterials]);

  // Calculate extra percentages
  useEffect(() => {
    if (!vendorData?.data?.formatedRawMaterials?.length) return;

    const {percentages, categories} = helpers.calculateExtraPercentages(
      vendorData.data.formatedRawMaterials,
    );

    setCategoryForExtra(categories);
    setExtraPercentage(percentages);
  }, [vendorData?.data?.formatedRawMaterials]);

  // Get grouped data
  const getGroupedData = useCallback(() => {
    if (!rawMaterial) return null;

    let baseData = rawMaterial.formatedRawMaterials;

    // Add extra materials if available
    if (
      extraAddedRawmaterials?.data &&
      extraAddedRawmaterials.data.length > 0
    ) {
      const extraMaterials: RawMaterial[] = extraAddedRawmaterials.data.map(
        (item) => ({
          id: item.id,
          rawMaterialId: item.rawMaterialId,
          name: item.rawMaterial.name,
          unit: item.rawMaterial.unit,
          categoryId: item.rawMaterial.categoryId,
          category: item.rawMaterial.category?.name,
          quantity: item.totalQty,
          inventory: item.rawMaterial?.inventory,
          inventory_value: item?.inventory,
          orderQuantity: initialOrderQuanity[item.id] || item.quantity,
          subEvent: 'Extra',
          maharaj: 'Extra',
          peopleType: 'extra',
        }),
      );
      baseData = [...baseData, ...extraMaterials];
    }

    // Filter by selected categories
    if (selectedCategoryIds.length > 0) {
      baseData = baseData.filter(
        (item) =>
          item.categoryId && selectedCategoryIds.includes(item.categoryId),
      );
    }

    let groupedData: any = {};

    // Grouping logic
    if (filters.subEvent && filters.maharaj) {
      const subEventMaharajGroup: {
        [subEvent: string]: {[maharaj: string]: RawMaterial[]};
      } = {};
      baseData.forEach((item) => {
        const subEvent = item.subEvent;
        const maharaj = item.maharaj;
        if (!subEventMaharajGroup[subEvent])
          subEventMaharajGroup[subEvent] = {};
        if (!subEventMaharajGroup[subEvent][maharaj])
          subEventMaharajGroup[subEvent][maharaj] = [];
        subEventMaharajGroup[subEvent][maharaj].push({
          ...item,
          inventory: getClampedInventory(item),
        });
      });

      Object.keys(subEventMaharajGroup).forEach((subEvent) => {
        Object.keys(subEventMaharajGroup[subEvent]).forEach((maharaj) => {
          subEventMaharajGroup[subEvent][maharaj] = mergeByNameMemoized(
            subEventMaharajGroup[subEvent][maharaj],
          );
        });
      });
      groupedData = subEventMaharajGroup;
    } else if (filters.subEvent) {
      const subEventGroup: {[subEvent: string]: RawMaterial[]} = {};
      baseData.forEach((item) => {
        if (!subEventGroup[item.subEvent]) subEventGroup[item.subEvent] = [];
        subEventGroup[item.subEvent].push({
          ...item,
          inventory: getClampedInventory(item),
        });
      });

      Object.keys(subEventGroup).forEach((subEvent) => {
        subEventGroup[subEvent] = mergeByNameMemoized(subEventGroup[subEvent]);
      });
      groupedData = subEventGroup;
    } else if (filters.maharaj) {
      if (selectedMaharaj) {
        const maharajItems = baseData
          .filter((item) => item.maharaj === selectedMaharaj)
          .map((item) => ({
            ...item,
            inventory: getClampedInventory(item),
          }));
        groupedData[selectedMaharaj] = mergeByNameMemoized(maharajItems);
      } else {
        rawMaterial.maharajList.forEach((maharaj) => {
          const maharajItems = baseData
            .filter((item) => item.maharaj === maharaj)
            .map((item) => ({
              ...item,
              inventory: getClampedInventory(item),
            }));
          groupedData[maharaj] = maharajItems;
        });
      }
    } else {
      groupedData = mergeByNameMemoized(
        baseData.map((item) => ({
          ...item,
          inventory: getClampedInventory(item),
        })),
      );
    }

    // Apply category grouping if enabled
    if (filters.category) {
      groupedData = helpers.groupByCategoryName(groupedData);
    }

    return groupedData;
  }, [
    rawMaterial,
    extraAddedRawmaterials?.data,
    selectedCategoryIds,
    filters.subEvent,
    filters.maharaj,
    filters.category,
    selectedMaharaj,
    initialOrderQuanity,
    getClampedInventory,
    mergeByNameMemoized,
  ]);

  // Get grouped missing data
  const getGroupedMissingData = useCallback(() => {
    if (!convertedMissing) return null;

    let baseData = convertedMissing;

    // Filter by selected categories
    if (selectedCategoryIds.length > 0) {
      baseData = baseData?.filter(
        (item) =>
          item.categoryId && selectedCategoryIds.includes(item.categoryId),
      );
    }

    let groupedMissingData: any = {};

    // Grouping logic similar to getGroupedData
    if (filters.subEvent && filters.maharaj) {
      const subEventMaharajGroup: {
        [subEvent: string]: {[maharaj: string]: RawMaterial[]};
      } = {};
      baseData.forEach((item) => {
        const subEvent = item.subEvent;
        const maharaj = item.maharaj;
        if (!subEventMaharajGroup[subEvent])
          subEventMaharajGroup[subEvent] = {};
        if (!subEventMaharajGroup[subEvent][maharaj])
          subEventMaharajGroup[subEvent][maharaj] = [];
        subEventMaharajGroup[subEvent][maharaj].push({
          ...item,
          inventory: getClampedInventory(item),
        });
      });

      Object.keys(subEventMaharajGroup).forEach((subEvent) => {
        Object.keys(subEventMaharajGroup[subEvent]).forEach((maharaj) => {
          subEventMaharajGroup[subEvent][maharaj] = mergeByNameMemoized(
            subEventMaharajGroup[subEvent][maharaj],
          );
        });
      });
      groupedMissingData = subEventMaharajGroup;
    } else if (filters.subEvent) {
      const subEventGroup: {[subEvent: string]: RawMaterial[]} = {};
      baseData.forEach((item) => {
        if (!subEventGroup[item.subEvent]) subEventGroup[item.subEvent] = [];
        subEventGroup[item.subEvent].push({
          ...item,
          inventory: getClampedInventory(item),
        });
      });

      Object.keys(subEventGroup).forEach((subEvent) => {
        subEventGroup[subEvent] = mergeByNameMemoized(subEventGroup[subEvent]);
      });
      groupedMissingData = subEventGroup;
    } else if (filters.maharaj) {
      if (selectedMaharaj) {
        const maharajItems = baseData
          .filter((item) => item.maharaj === selectedMaharaj)
          .map((item) => ({
            ...item,
            inventory: getClampedInventory(item),
          }));
        groupedMissingData[selectedMaharaj] = mergeByNameMemoized(maharajItems);
      } else {
        rawMaterial?.maharajList?.forEach((maharaj) => {
          const maharajItems = baseData
            .filter((item) => item.maharaj === maharaj)
            .map((item) => ({
              ...item,
              inventory: getClampedInventory(item),
            }));
          groupedMissingData[maharaj] = maharajItems;
        });
      }
    } else {
      groupedMissingData = mergeByNameMemoized(
        baseData.map((item) => ({
          ...item,
          inventory: getClampedInventory(item),
        })),
      );
    }

    // Apply category grouping if enabled
    if (filters.category) {
      groupedMissingData = helpers.groupByCategoryName(groupedMissingData);
    }

    return groupedMissingData;
  }, [
    convertedMissing,
    selectedCategoryIds,
    filters.subEvent,
    filters.maharaj,
    filters.category,
    selectedMaharaj,
    rawMaterial?.maharajList,
    getClampedInventory,
    mergeByNameMemoized,
  ]);

  // Memoized grouped data
  const groupedData = useMemo(() => getGroupedData(), [getGroupedData]);
  const groupedMissingData = useMemo(
    () => getGroupedMissingData(),
    [getGroupedMissingData],
  );

  const finalArray = useMemo(
    () => (groupedMissingData ? helpers.getFinalArray(groupedMissingData) : []),
    [groupedMissingData],
  );

  // Update order quantities when extra percentage changes
  useEffect(() => {
    if (!groupedData) return;

    setNewInitialOrderQuanity((prev) => {
      const updated = {...prev};

      Object.values(groupedData).forEach((items: any[]) => {
        if (!Array.isArray(items)) return;
        items?.forEach((item: any) => {
          const id = item.id;
          const category = item.category;

          if (isManualChange.current[id]) return;

          const hasExtraPercentage = extraPercentage[category] > 0;

          if (hasExtraPercentage) {
            const baseQty = item.quantity ?? 0;
            const inventory = Number(item.inventory ?? 0);
            const extra = Number(extraQty[id] ?? 0);
            const calculated = baseQty + extra - inventory;
            updated[id] = Number(Math.max(0, calculated).toFixed(4));
          }
        });
      });

      return updated;
    });
  }, [extraPercentage, groupedData, extraQty]);

  // Update extra quantities based on category percentages
  useEffect(() => {
    if (!categoryForExtra?.length || !groupedData) return;
    const qtyMap: {[key: string]: number} = {};
    const updatedOrderQuantities: {[key: string]: number} = {};

    categoryForExtra.forEach((category) => {
      const categoryItems = groupedData[category];
      if (!Array.isArray(categoryItems)) return;

      const percentage = Number(extraPercentage?.[category]) || 0;
      categoryItems.forEach((item: any) => {
        const quantity = Number(item.quantity) || 0;
        const extraQtyValue = (quantity * percentage) / 100;
        qtyMap[item.id] = extraQtyValue;

        if (!isManualChange.current[item.id] && percentage > 0) {
          const inventory = Number(item.inventory ?? 0);
          const calculatedOrderQty = Math.max(
            0,
            quantity + extraQtyValue - inventory,
          );
          updatedOrderQuantities[item.id] = Number(
            calculatedOrderQty.toFixed(4),
          );
        }
      });
    });

    setExtraQty(qtyMap);

    if (Object.keys(updatedOrderQuantities).length > 0) {
      setNewInitialOrderQuanity((prev) => ({
        ...prev,
        ...updatedOrderQuantities,
      }));
    }
  }, [categoryForExtra, groupedData, extraPercentage]);

  // Send data to external vendor
  const handleSend = useCallback(
    (eventId: string, data: RawMaterial[]) => {
      const allData = helpers.prepareExternalVendorData(
        data,
        newinitialOrderQuanity,
        extraQty,
        inventoryQuantities,
        startInventoryValue,
        extraAddedRawmaterials?.data,
      );

      sendExternalVendor({eventId, data: allData});
    },
    [
      newinitialOrderQuanity,
      extraQty,
      inventoryQuantities,
      startInventoryValue,
      extraAddedRawmaterials?.data,
      sendExternalVendor,
    ],
  );

  // Delete extra material
  const handleDeleteExtraMaterial = useCallback(
    (id: string) => {
      deleteRawMaterialForSubevent(id);
      fetchMaterials();
    },
    [deleteRawMaterialForSubevent, fetchMaterials],
  );
  // Add this state
  const [recalculateManualChanges, setRecalculateManualChanges] =
    useState(false);
  // Add this effect
  useEffect(() => {
    if (recalculateManualChanges) {
      // Clear all manual change flags when recalculating
      isManualChange.current = {};
      setRecalculateManualChanges(false);
    }
  }, [recalculateManualChanges]);

  // Render rows function
  const renderRows = useCallback(
    (data: any, keyPath: string = '', depth: number = 0): JSX.Element[] => {
      if (Array.isArray(data)) {
        return data.map((item, index) => {
          return (
            <tr
              key={`${keyPath}-${index}`}
              className="bg-white dark:bg-boxdark"
            >
              {/* 1. Name */}
              <td className="group relative w-[10%] border-stroke px-4 py-2 dark:border-strokedark">
                <div className="flex cursor-pointer items-center gap-2">
                  <span>{item.name?.trim()}</span>
                </div>

                {/* Tooltip */}
                {usageMap.has(item.name?.trim()) && (
                  <div
                    className={`pointer-events-none absolute left-0 top-full z-50 mt-2 w-80 rounded-lg bg-graydark p-4 text-sm text-white opacity-0 shadow-2xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-black`}
                  >
                    {(() => {
                      const dishesBySubevent: Record<string, any[]> = {};

                      // Group dishes by subevent
                      usageMap.get(item.name?.trim())?.forEach((dish: any) => {
                        if (!dishesBySubevent[dish.subeventName]) {
                          dishesBySubevent[dish.subeventName] = [];
                        }
                        dishesBySubevent[dish.subeventName].push(dish);
                      });

                      return Object.entries(dishesBySubevent).map(
                        ([subevent, dishes]) => {
                          // Calculate total people for this subevent
                          const totalPeople = dishes.reduce(
                            (sum, d) => sum + (Number(d.people) || 0),
                            0,
                          );

                          return (
                            <div key={subevent} className="mb-4 last:mb-0">
                              {/* Subevent header with people count */}
                              <div className="mb-2 flex items-center justify-between font-medium text-blue-300">
                                <span>{subevent}</span>
                                <span className="text-gray-400 text-xs">
                                  {totalPeople} people
                                </span>
                              </div>

                              {/* Dishes list */}
                              <div className="space-y-1.5">
                                {dishes.map((dish, i) => (
                                  <div
                                    key={i}
                                    className="text-gray-200 flex items-center justify-between"
                                  >
                                    <span className="flex-1 truncate pr-2">
                                      {dish.dishName}
                                    </span>

                                    <div className="text-gray-300 flex items-center gap-4 text-right tabular-nums">
                                      <span className="w-auto">
                                        {Number(dish.rmQuantity).toFixed(3)}{' '}
                                        {item.unit.toLowerCase() || 'kg'}
                                      </span>
                                      <span>
                                        {Number(dish.dishKg || 0).toFixed(1)} kg
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        },
                      );
                    })()}
                  </div>
                )}
              </td>

              {/* 2. Required Qty */}
              {selectedColumns.requiredQuantity && (
                <td className="w-[14%] border-stroke px-4 py-2 dark:border-strokedark">
                  <input
                    disabled
                    type="number"
                    className="w-full bg-white dark:bg-boxdark"
                    defaultValue={Number(item.quantity).toFixed(3)}
                  />
                </td>
              )}

              {/* 3. Inventory */}
              {selectedColumns.inventory && (
                <td className="w-[14%] border-stroke px-4 py-2 dark:border-strokedark">
                  <input
                    disabled
                    type="number"
                    className="w-full bg-white dark:bg-boxdark"
                    defaultValue={
                      item.inventory
                        ? Number(item.inventory).toFixed(3)
                        : '0.000'
                    }
                  />
                </td>
              )}

              {/* 4. Inventory Value */}
              <td className="w-[14%] border-stroke px-4 py-2 dark:border-strokedark">
                <input
                  type="number"
                  className="mt-2 w-24 rounded-md border border-stroke px-2 py-1 dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  value={helpers.calculateInventoryValueDisplay(item, extraQty)}
                  onChange={(e) =>
                    handleInventoryChange(item.id || '', e.target.value)
                  }
                />
              </td>

              {/* 5. Order Qty */}
              {selectedColumns.orderQuantity && (
                <td className="w-[18%] border-stroke px-4 py-2 dark:border-strokedark">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      className="mt-2 w-24 rounded-md border border-stroke px-2 py-1 dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      value={(() => {
                        const id = item.id;
                        if (isManualChange.current[item.id]) {
                          return (
                            newinitialOrderQuanity[item.id]?.toString() || ''
                          );
                        }
                        const backendOrderQty = Number(item.orderQuantity || 0);
                        const backendQuantity = Number(item.quantity || 0);
                        const inventory = Number(item.inventory || 0);
                        const extra = Number(extraQty[item.id] || 0);

                        if (backendOrderQty <= 0) {
                          const calculated = Math.max(
                            0,
                            backendQuantity - inventory + extra,
                          );
                          return calculated.toFixed(3);
                        }

                        return helpers.calculateOrderQuantityDisplay(
                          item,
                          newinitialOrderQuanity,
                          extraPercentage,
                          extraQty,
                          hasUserChangedExtra,
                          isManualChange.current,
                        );
                      })()}
                      onChange={(e) => {
                        isManualChange.current[item.id] = true;
                        handleQuantityChange(item.id, e.target.value);
                      }}
                      onBlur={(e) => {
                        const fixed = Number(e.target.value || 0).toFixed(3);
                        handleQuantityChange(item.id, fixed);
                      }}
                    />
                    <span className="text-gray-600 dark:text-gray-300 min-w-[80px] whitespace-nowrap text-sm">
                      {item.unit}
                    </span>
                  </div>
                </td>
              )}

              {/* 6. Total */}
              {selectedColumns.totalQuantity && (
                <td className="w-[14%] border-stroke px-4 py-2 dark:border-strokedark">
                  <input
                    type="number"
                    className="w-full bg-white focus:outline-none dark:bg-boxdark"
                    value={helpers.calculateTotalDisplay(
                      item,
                      newinitialOrderQuanity,
                    )}
                    readOnly
                  />
                </td>
              )}

              {/* 7. Extra Qty */}
              {selectedColumns.extraQuantity && (
                <td className="w-[14%] border-stroke px-4 py-2 dark:border-strokedark">
                  <input
                    type="number"
                    className="w-full bg-white focus:outline-none dark:bg-boxdark"
                    value={helpers.calculateExtraQtyDisplay(
                      item,
                      newinitialOrderQuanity,
                    )}
                    readOnly
                  />
                </td>
              )}

              {item.peopleType === 'extra' && (
                <td className="w-[14%] border-stroke px-4 py-2 dark:border-strokedark">
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                    onClick={() => handleDeleteExtraMaterial(item.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          );
        });
      } else {
        const rows: JSX.Element[] = [];

        Object.keys(data).forEach((groupKey) => {
          const currentPath = keyPath ? `${keyPath}-${groupKey}` : groupKey;
          const isExpanded =
            currentPath in expanded ? expanded[currentPath] : true;
          const isCategory =
            filters.subEvent && filters.category && depth === 1;

          rows.push(
            <tr
              key={currentPath}
              className="cursor-pointer bg-gray dark:bg-black"
              onClick={() => toggleExpand(currentPath)}
            >
              <td
                colSpan={8}
                className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white"
                style={{paddingLeft: isCategory ? '2rem' : '1rem'}}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {isExpanded ? <FaAngleDown /> : <FaAngleRight />}
                    </span>
                    <span className="mr-4">{groupKey}</span>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="rounded bg-primary px-3 py-1 text-sm text-white"
                      onClick={() => {
                        setCategoryForExtra((prev) => [...prev, groupKey]);
                        toast.success(
                          `${extraPercentage[groupKey]}% for ${groupKey} added successfully`,
                        );
                      }}
                    >
                      Extra
                    </button>
                    <input
                      type="number"
                      placeholder="Enter value (%)"
                      value={extraPercentage[groupKey] || ''}
                      className="w-18 rounded border-[1.7px] border-stroke bg-transparent px-3 py-0.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        setExtraPercentage((prev) => ({
                          ...prev,
                          [groupKey]: value,
                        }));
                        setHasUserChangedExtra(true);

                        // Clear manual changes for this category
                        // You need to find all item IDs in this category
                        const categoryItems = groupedData?.[groupKey];
                        if (Array.isArray(categoryItems)) {
                          categoryItems.forEach((item) => {
                            if (item.id && isManualChange.current[item.id]) {
                              isManualChange.current[item.id] = false;
                            }
                          });
                        }
                      }}
                    />
                    <span>%</span>
                  </div>
                </div>
              </td>
            </tr>,
          );

          if (isExpanded) {
            rows.push(...renderRows(data[groupKey], currentPath, depth + 1));
          }
        });

        return rows;
      }
    },
    [
      selectedColumns,
      extraQty,
      newinitialOrderQuanity,
      extraPercentage,
      hasUserChangedExtra,
      handleQuantityChange,
      handleInventoryChange,
      handleDeleteExtraMaterial,
      filters.subEvent,
      filters.category,
      expanded,
      toggleExpand,
    ],
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Raw Material Order</h1>
          </div>

          <div className="flex gap-3">
            {/* Filter Options Button */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                ref={filterButtonRef}
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
              >
                <FaFilter className="h-4 w-4" />
                Filter Options
                <FaAngleDown
                  className={`transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isFilterDropdownOpen && (
                <div className="border-gray-200 dark:border-gray-700 absolute right-0 top-full z-50 mt-1 w-80 rounded-md border bg-white p-4 shadow-lg dark:bg-meta-4">
                  <h4 className="text-gray-800 mb-3 text-sm font-semibold dark:text-white">
                    Filter Options
                  </h4>

                  <div className="space-y-3">
                    {/* Sub-Event Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Group by Sub-Event
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={filters.subEvent}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              subEvent: !prev.subEvent,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>

                    {/* Maharaj Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Group by Maharaj
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={filters.maharaj}
                          onChange={() => {
                            setFilters((prev) => ({
                              ...prev,
                              maharaj: !prev.maharaj,
                            }));
                            if (!filters.maharaj) setSelectedMaharaj(null);
                          }}
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>

                    {/* Maharaj Select */}
                    {filters.maharaj && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Select Maharaj
                        </span>
                        <select
                          value={selectedMaharaj || ''}
                          onChange={(e) =>
                            setSelectedMaharaj(e.target.value || null)
                          }
                          className="border-gray-300 rounded-lg border bg-white px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-800"
                        >
                          <option value="">All Maharajs</option>
                          {rawMaterial?.maharajList.map((maharaj) => (
                            <option key={maharaj} value={maharaj}>
                              {maharaj}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Category Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Group by Category
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={filters.category}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              category: !prev.category,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>

                    {/* Column visibility toggles */}
                    {Object.keys(selectedColumns).map((column) => (
                      <div
                        key={column}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Show{' '}
                          {column
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedColumns[
                                column as keyof typeof selectedColumns
                              ]
                            }
                            onChange={() =>
                              toggleColumnSelection(
                                column as keyof typeof selectedColumns,
                              )
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Download
              groupedData={groupedData}
              selectedColumns={selectedColumns}
              extraQty={extraQty}
              newinitialOrderQuanity={newinitialOrderQuanity}
              startInventoryValue={startInventoryValue}
              inventoryQuantities={inventoryQuantities}
              user={user}
              subEventResponse={subEventResponse}
              extraPercentage={extraPercentage}
              catererLogo={catererLogo}
              eventName={subEventResponse?.data?.name}
            />
          </div>
        </div>
      </div>

      <RedDishesShow />

      <div className="mb-8 overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
        <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
          {' '}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Required Qty
                </th>
                {selectedColumns.inventory && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Inventory
                  </th>
                )}
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Inventory Value
                </th>
                {selectedColumns.orderQuantity && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Order Qty
                  </th>
                )}
                {selectedColumns.totalQuantity && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Total
                  </th>
                )}
                {selectedColumns.extraQuantity && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Extra Qty
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
              {groupedData ? (
                renderRows(groupedData)
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-gray-500 dark:text-gray-400 px-4 py-6 text-center"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-gray-800 mb-6 flex items-center gap-2 text-lg font-semibold dark:text-white">
          Extra Raw Materials
        </h3>

        <ExtraRawmaterial
          onSuccess={fetchMaterials}
          existingMaterialData={missing}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Save Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSend(EventId, rawMaterial?.formatedRawMaterials || []);
              }}
              className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="hidden sm:inline">Save</span>
              <span className="sm:hidden">Share Order</span>
            </button>

            {/* Copy Link Button (Mobile only) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard
                  .writeText(registrationLink)
                  .then(() => {
                    toast.success('Link copied to clipboard');
                  })
                  .catch((err) => {
                    console.error('Failed to copy:', err);
                    toast.error('Failed to copy link');
                  });
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-3 font-medium text-blue-600 shadow-md transition-all hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:bg-boxdark dark:text-blue-400 dark:hover:bg-blue-900/20 sm:hidden"
            >
              <FaShare className="h-4 w-4" />
              Copy Link
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(RawMaterialOrder);
