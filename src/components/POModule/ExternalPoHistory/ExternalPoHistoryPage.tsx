/* eslint-disable */
import {
  extractLastPrices,
  formatDateForAPI,
  formatDateForInput,
  formatQuantityDisplay,
  formatTimeForAPI,
  formatTimeForInput,
  LineItem,
  PurchaseMaterialData,
  validateRequiredFields,
  Vendor,
} from '@/components/Event/subEvent/eventHelper';
import {
  useGetEventRawMaterialsPO,
  useGetHistoryeventPoById,
  useGetVendorsPo,
  useSubmitExternalventPONew,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {
  useGetExternalPoById,
  useGetExternalPoDataById,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useNavigate} from '@tanstack/react-router';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
import ExternalPoHistoryButtons from './ExternalPoHistoryButtons';
import ExternalPoHistoryTable from './ExternalPoHistoryTable';

export type props = {
  id: string;
};
const ExternalPoHistoryPage: React.FC<props> = ({id}) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  console.log('line itemsss////////////', lineItems);

  const materialLookupMap = React.useRef<
    Map<string, {category: string; unit: string}>
  >(new Map());
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});

  console.log('expanded catttt////', expandedCategories);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [categoryConfigs, setCategoryConfigs] = useState<{
    [category: string]: {
      date: string;
      time: string;
      location: string;
      vendorId?: string;
    };
  }>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasPartialData, setHasPartialData] = useState(false);
  const [currentPoStatus, setCurrentPoStatus] = useState<
    'PARTIAL' | 'COMPLETED' | null
  >(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const {
    data: vendorData,
    isLoading: isMaterialsLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetEventRawMaterialsPO(id);
  console.log('vendorrrrrr///////', vendorData);

  const {data: eventPO, refetch: refetchEventPO} = useGetExternalPoById(id);

  console.log('pooo raw list dataaaa///////', eventPO);
  const {mutate: saveEventPO, isPending: isSubmitting} =
    useSubmitExternalventPONew(id!);
  const {
    data: poHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetHistoryeventPoById(id);
  console.log('pooo historyy///////', poHistory);

  const {data: vendorsResponse, isLoading: isLoadingVendors} =
    useGetVendorsPo();

  const {
    data: rawMaterialOrderData,
    isLoading: isLoadingRawMaterialOrder,
    refetch: refetchRawMaterialOrder,
  } = useGetExternalPoById(id);

  const {data: getpodata} = useGetExternalPoDataById(id);

  console.log('allllll.....//////', getpodata);
  const navigate = useNavigate();

  const vendors: Vendor[] = useMemo(() => {
    const vendorsData = vendorsResponse?.data || vendorsResponse || [];
    return vendorsData;
  }, [vendorsResponse]);

  const originalTotals = useMemo(() => {
    const map = new Map<string, number>();
    let rawMats: any[] = [];
    if (rawMaterialOrderData?.data?.formatedRawMaterials) {
      rawMats = rawMaterialOrderData.data.formatedRawMaterials;
    } else if (vendorData) {
      rawMats = Array.isArray(vendorData) ? vendorData : vendorData.data || [];
    }
    rawMats.forEach((item: any) => {
      const id = item.id || item.rawmaterialId || item.rawMaterialId;
      const qty = parseFloat(
        (item.orderQuantity || item.quantity || 0).toFixed(1),
      );
      if (id) {
        map.set(id, (map.get(id) || 0) + qty);
      }
    });
    return map;
  }, [rawMaterialOrderData, vendorData]);

  // Get vendor options
  const getVendorOptions = useCallback(
    (category: string, categoryId?: string) => {
      if (!vendors || vendors.length === 0) {
        return [];
      }
      return vendors.map((vendor) => ({
        id: vendor.id,
        label: vendor.name,
      }));
    },
    [vendors],
  );

  // Priority 1: Use rawMaterialOrderData (most accurate for current event)
  useEffect(() => {
    materialLookupMap.current.clear();

    if (rawMaterialOrderData?.data) {
      // Check if data is an array
      if (Array.isArray(rawMaterialOrderData.data)) {
        rawMaterialOrderData.data.forEach((item: any) => {
          materialLookupMap.current.set(item.id, {
            category: item.category || 'Uncategorized',
            unit: item.unit || 'GRAM',
          });
        });
      }
      // If data is not an array but has other structure, try to extract
      else if (typeof rawMaterialOrderData.data === 'object') {
        // Handle case where data might be an object with materials array
        const materials =
          rawMaterialOrderData.data.materials ||
          rawMaterialOrderData.data.items ||
          rawMaterialOrderData.data.rawMaterials ||
          [];

        if (Array.isArray(materials)) {
          materials.forEach((item: any) => {
            const id = item.id || item.rawmaterialId || item.rawMaterialId;
            if (id) {
              materialLookupMap.current.set(id, {
                category: item.category || 'Uncategorized',
                unit: item.unit || 'GRAM',
              });
            }
          });
        }
      }
    } else if (vendorData && isSuccess) {
      let rawMaterials: any[] = [];

      // Handle different vendorData structures
      if (Array.isArray(vendorData)) {
        rawMaterials = vendorData;
      } else if (vendorData.data && Array.isArray(vendorData.data)) {
        rawMaterials = vendorData.data;
      } else if (vendorData.materials && Array.isArray(vendorData.materials)) {
        rawMaterials = vendorData.materials;
      } else if (vendorData.items && Array.isArray(vendorData.items)) {
        rawMaterials = vendorData.items;
      } else {
        // If it's an object, try to extract values
        rawMaterials = Object.values(vendorData).filter(Array.isArray)[0] || [];
      }

      rawMaterials.forEach((item: any) => {
        const id = item.rawmaterialId || item.rawMaterialId || item.id;
        if (id) {
          materialLookupMap.current.set(id, {
            category: item.category || 'Uncategorized',
            unit: item.unit || 'GRAM',
          });
        }
      });
    }
  }, [rawMaterialOrderData, vendorData, isSuccess]);

  const processPurchaseMaterials = useCallback(
    (purchaseMaterials: any[], status: string): LineItem[] => {
      const items: LineItem[] = [];
      purchaseMaterials.forEach((material, index) => {
        const lookup = materialLookupMap.current.get(material.materialId);
        const category = lookup?.category || 'Uncategorized';
        const unit = lookup?.unit || 'GRAM';

        const isBreakdown =
          material.parentId !== null && material.parentId !== undefined;

        const item: LineItem = {
          id:
            material.id ||
            `saved-${material.materialId}-${index}-${Date.now()}`,
          rawmaterialId: material.materialId,
          name: material.materialName,
          unit: unit,
          category: category,
          quantity: material.quantity || 0,
          particular: material.particular || '',
          packageType: material.packageType || '',
          date: formatDateForInput(material.date || ''),
          time: formatTimeForInput(material.time || ''),
          location: material.venue || '',
          vendorId: material.vendor?.id || material.vendorId,
          vendorName: material.vendor?.name || material.vendorName || '',
          price: material.price || 0,
          isBreakdown: isBreakdown,
          parentId: material.parentId || null,
          breakdownQuantity: material.quantity || 0,
          totalAmount: (material.price || 0) * (material.quantity || 0),
          submitMainRow: !isBreakdown,
        };
        items.push(item);
      });
      return items;
    },
    [],
  );

  // NEW: Process getpodata (COMPLETED status directly from API)
  const processGetPoData = useCallback((getpodata: any): LineItem[] => {
    try {
      console.log('Processing getpo data:', getpodata);

      // Check if status is COMPLETED
      if (getpodata?.data?.status !== 'COMPLETED') {
        console.log('Status is not COMPLETED, returning empty');
        return [];
      }

      const purchaseMaterials = getpodata.data.PurchaseMaterial;
      if (!purchaseMaterials || !Array.isArray(purchaseMaterials)) {
        console.log('No purchase materials found');
        return [];
      }

      const items: LineItem[] = [];

      purchaseMaterials.forEach((category: any) => {
        const categoryName = category.name;

        if (category.materials && Array.isArray(category.materials)) {
          category.materials.forEach((material: any) => {
            if (material.purchase && Array.isArray(material.purchase)) {
              material.purchase.forEach((purchase: any) => {
                const item: LineItem = {
                  id: purchase.id || `completed-${Date.now()}-${Math.random()}`,
                  rawmaterialId: material.materialId,
                  name: material.name,
                  unit: material.unit || 'GRAM',
                  quantity: purchase.quantity || 0,
                  category: categoryName,
                  particular: purchase.particular || '',
                  packageType: purchase.packageType || '',
                  date: formatDateForInput(purchase.date || ''),
                  time: formatTimeForInput(purchase.time || ''),
                  location: purchase.venue || '',
                  vendorId: purchase.vendorId,
                  vendorName: purchase.vendorName || '',
                  price: purchase.price || 0,
                  isBreakdown: false,
                  parentId: null,
                  breakdownQuantity: purchase.quantity || 0,
                  totalAmount: (purchase.price || 0) * (purchase.quantity || 0),
                  submitMainRow: true,
                };
                items.push(item);
              });
            }
          });
        }
      });

      console.log('Processed items from getpodata:', items);
      return items;
    } catch (error) {
      console.error('Error processing getpodata:', error);
      return [];
    }
  }, []);

  // NEW: Process getpodata for PARTIAL status
  const processGetPoDataPartial = useCallback((getpodata: any): LineItem[] => {
    try {
      console.log('Processing getpo data for PARTIAL:', getpodata);

      // Check if status is PARTIAL
      if (getpodata?.data?.status !== 'PARTIAL') {
        console.log('Status is not PARTIAL, returning empty');
        return [];
      }

      const purchaseMaterials = getpodata.data.PurchaseMaterial;
      if (!purchaseMaterials || !Array.isArray(purchaseMaterials)) {
        console.log('No purchase materials found');
        return [];
      }

      const items: LineItem[] = [];

      purchaseMaterials.forEach((category: any) => {
        const categoryName = category.name;

        if (category.materials && Array.isArray(category.materials)) {
          category.materials.forEach((material: any) => {
            if (material.purchase && Array.isArray(material.purchase)) {
              material.purchase.forEach((purchase: any) => {
                const item: LineItem = {
                  id: purchase.id || `partial-${Date.now()}-${Math.random()}`,
                  rawmaterialId: material.materialId,
                  name: material.name,
                  unit: material.unit || 'GRAM',
                  quantity: purchase.quantity || 0,
                  category: categoryName,
                  particular: purchase.particular || '',
                  packageType: purchase.packageType || '',
                  date: formatDateForInput(purchase.date || ''),
                  time: formatTimeForInput(purchase.time || ''),
                  location: purchase.venue || '',
                  vendorId: purchase.vendorId,
                  vendorName: purchase.vendorName || '',
                  price: purchase.price || 0,
                  isBreakdown: false,
                  parentId: null,
                  breakdownQuantity: purchase.quantity || 0,
                  totalAmount: (purchase.price || 0) * (purchase.quantity || 0),
                  submitMainRow: true,
                };
                items.push(item);
              });
            }
          });
        }
      });

      console.log('Processed items from getpodata (PARTIAL):', items);
      return items;
    } catch (error) {
      console.error('Error processing getpodata for PARTIAL:', error);
      return [];
    }
  }, []);

  const getVendorNameById = useCallback(
    (vendorId?: string) => {
      if (!vendorId || !vendors) return '';
      const vendor = vendors.find((v) => v.id === vendorId);
      return vendor ? vendor.name : '';
    },
    [vendors],
  );

  // Process raw material data with merging by rawmaterialId
  const processRawMaterialOrderData = useCallback(
    (rawMaterials: any[]): LineItem[] => {
      const lastPriceMap = extractLastPrices(rawMaterials);
      const materialAccumulator = new Map<
        string,
        {quantity: number; items: any[]}
      >();
      rawMaterials.forEach((item) => {
        const rawMaterialId = item.rawmaterialId || item.id;
        const key = rawMaterialId;
        const qty = item.orderQuantity || item.quantity || 0;
        if (materialAccumulator.has(key)) {
          const acc = materialAccumulator.get(key)!;
          acc.quantity += qty;
          acc.items.push(item);
        } else {
          materialAccumulator.set(key, {
            quantity: qty,
            items: [item],
          });
        }
      });
      const processedItems: LineItem[] = [];
      materialAccumulator.forEach((acc, key) => {
        const firstItem = acc.items[0];
        const totalQuantity = parseFloat(acc.quantity.toFixed(1));
        const subEvents = acc.items
          .map((i: any) => i.subEvent)
          .filter(Boolean)
          .join(', ');
        const lastPrice = lastPriceMap.get(key) || firstItem.price || 0;
        processedItems.push({
          id: `${key}-${Date.now()}`,
          rawmaterialId: key,
          name:
            firstItem.rawmaterialName || firstItem.name || 'Unknown Material',
          unit: firstItem.unit || 'GRAM',
          quantity: totalQuantity,
          category: firstItem.category || 'Uncategorized',
          categoryId: firstItem.categoryId,
          subEvent: subEvents || undefined,
          subEventId: acc.items.map((i: any) => i.subEventId).join(', '),
          isBreakdown: false,
          breakdownQuantity: totalQuantity,
          submitMainRow: true,
          price: lastPrice,
          totalAmount: lastPrice * totalQuantity,
          date: '',
          time: '',
          location: '',
          vendorId: undefined,
          vendorName: undefined,
        });
      });
      return processedItems;
    },
    [extractLastPrices],
  );

  const updateLineItem = useCallback(
    (lineId: string, updates: Partial<LineItem>) => {
      // Prevent any updates in view mode
      if (isViewMode && currentPoStatus === 'COMPLETED') {
        toast.error(
          'Cannot edit in view mode. Click "Edit Mode" to make changes.',
        );
        return;
      }
      setLineItems((prev) =>
        prev.map((li) => {
          if (li.id === lineId) {
            const tempItem = {
              ...li,
              ...updates,
              error: undefined,
              requiredErrors: undefined,
            };
            // Special handling for price to ensure it's always a number or undefined
            if (updates.price !== undefined) {
              tempItem.price =
                updates.price === '' ? undefined : Number(updates.price);
            }
            if (updates.quantity !== undefined || updates.price !== undefined) {
              const quantity =
                updates.quantity !== undefined ? updates.quantity : li.quantity;
              const price =
                tempItem.price !== undefined ? tempItem.price : li.price;
              tempItem.totalAmount = (price || 0) * (quantity || 0);
            }
            // Global over-allocation validation
            if (updates.quantity !== undefined) {
              const rawId = li.rawmaterialId;
              const original = originalTotals.get(rawId) || 0;
              const oldQty = li.quantity || 0;
              const newQty = updates.quantity;
              const currentSum = prev
                .filter((i) => i.rawmaterialId === rawId)
                .reduce((s, i) => s + (i.quantity || 0), 0);
              const newSum = currentSum - oldQty + newQty;
              if (newSum > original) {
                toast.error(
                  `Cannot exceed available quantity of ${formatQuantityDisplay(
                    original,
                  )} ${li.unit} for ${li.name}. Current total would be ${formatQuantityDisplay(
                    newSum,
                  )}.`,
                );
                return li; // Prevent update
              }
              tempItem.error = undefined;
            }
            // Validate required fields
            tempItem.requiredErrors = undefined;
            return tempItem;
          }
          return li;
        }),
      );
    },
    [isViewMode, currentPoStatus, originalTotals, validateRequiredFields],
  );

  const applyCategoryConfig = useCallback(
    (category: string) => {
      if (isViewMode) return;

      const config = categoryConfigs[category];
      if (!config) return;

      setLineItems((prev) =>
        prev.map((item) => {
          const isMainInCategory =
            !item.isBreakdown && item.category === category;
          const isBreakdownInCategory =
            item.isBreakdown &&
            item.parentId &&
            prev.find((p) => p.id === item.parentId)?.category === category;

          if (!(isMainInCategory || isBreakdownInCategory)) {
            return item;
          }

          const updatedItem: LineItem = {
            ...item,
            date: config.date || item.date,
            time: config.time || item.time,
            location: config.location || item.location,
            vendorId: config.vendorId || undefined,
            // Optional: also update vendorName if clearing
            vendorName: config.vendorId
              ? getVendorNameById(config.vendorId)
              : '',
          };

          // CRITICAL FIX:
          // Use DRAFT mode validation (true) so vendor/price NOT required
          const newErrors = validateRequiredFields(updatedItem, true);

          return {
            ...updatedItem,
            requiredErrors: newErrors.length > 0 ? newErrors : undefined,
            error: undefined,
          };
        }),
      );
    },
    [categoryConfigs, getVendorNameById, isViewMode],
  );

  const updateCategoryConfig = useCallback(
    (category: string, field: string, value: string) => {
      if (isViewMode) return; // Don't update config in view mode
      setCategoryConfigs((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    },
    [isViewMode],
  );

  const addBreakdownRow = useCallback(
    (parentItem: LineItem) => {
      if (isViewMode) return; // Don't add breakdown in view mode
      const newBreakdownId = `breakdown-${parentItem.id}-${Date.now()}`;
      const parentTime = parentItem.time || '';
      let formattedTime = '';
      if (parentTime.includes('T')) {
        try {
          const timeDate = new Date(parentTime);
          const hours = String(timeDate.getHours()).padStart(2, '0');
          const minutes = String(timeDate.getMinutes()).padStart(2, '0');
          formattedTime = `${hours}:${minutes}`;
        } catch (e) {
          formattedTime = '';
        }
      } else if (parentTime.match(/^\d{1,2}:\d{2}$/)) {
        formattedTime = parentTime;
      } else {
        formattedTime = parentTime;
      }
      const newBreakdown: LineItem = {
        id: newBreakdownId,
        rawmaterialId: parentItem.rawmaterialId,
        name: parentItem.name,
        category: parentItem.category,
        categoryId: parentItem.categoryId,
        subEvent: parentItem.subEvent,
        subEventId: parentItem.subEventId,
        unit: parentItem.unit,
        quantity: 0,
        date: parentItem.date || '',
        time: formattedTime,
        location: parentItem.location || '',
        vendorId: parentItem.vendorId,
        vendorName: parentItem.vendorName,
        price: parentItem.price,
        isBreakdown: true,
        parentId: parentItem.id,
        totalAmount: 0,
      };
      setLineItems((prev) => [...prev, newBreakdown]);
      setExpandedBreakdowns((prev) => ({
        ...prev,
        [parentItem.id]: true,
      }));
    },
    [isViewMode],
  );

  const removeBreakdownRow = useCallback(
    (breakdownId: string) => {
      if (isViewMode) return; // Don't remove breakdown in view mode
      setLineItems((prev) => prev.filter((item) => item.id !== breakdownId));
    },
    [isViewMode],
  );

  const toggleBreakdown = useCallback((parentId: string) => {
    setExpandedBreakdowns((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getBreakdownItems = useCallback(
    (parentId: string) => {
      return lineItems.filter(
        (item) => item.parentId === parentId && item.isBreakdown,
      );
    },
    [lineItems],
  );

  const groupedItems = useMemo(() => {
    // If there's an existing PO (PARTIAL or COMPLETED), do NOT merge duplicates
    // Because saved POs may have intentional multiple entries or breakdowns
    if (currentPoStatus === 'PARTIAL' || currentPoStatus === 'COMPLETED') {
      const grouped: {[category: string]: LineItem[]} = {};
      const mainItems = lineItems.filter((item) => !item.isBreakdown);

      mainItems.forEach((item) => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });

      // Sort categories and items within
      const sortedGrouped: {[category: string]: LineItem[]} = {};
      Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b, 'hi', {sensitivity: 'base'}))
        .forEach((category) => {
          sortedGrouped[category] = grouped[category].sort((a, b) =>
            a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'}),
          );
        });

      return sortedGrouped;
    }

    // === NEW PO CASE: Merge duplicates by rawmaterialId ===
    const mergedMap = new Map<string, LineItem>();

    lineItems
      .filter((item) => !item.isBreakdown) // Only main rows
      .forEach((item) => {
        const key = item.rawmaterialId || `${item.category}-${item.name}`; // Fallback if no ID

        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key)!;
          existing.quantity += item.quantity || 0;
          existing.breakdownQuantity += item.quantity || 0;
          existing.totalAmount = (existing.price || 0) * existing.quantity;
          // Optional: Aggregate subEvents if multiple (e.g., comma-join)
          if (item.subEvent && existing.subEvent !== item.subEvent) {
            existing.subEvent = `${existing.subEvent}, ${item.subEvent}`;
          }
        } else {
          mergedMap.set(key, {
            ...item,
            // Ensure we don't carry over breakdown-specific fields
            isBreakdown: false,
            parentId: null,
          });
        }
      });

    // Now group merged items by category
    const grouped: {[category: string]: LineItem[]} = {};
    Array.from(mergedMap.values()).forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Sort categories and items
    const sortedGrouped: {[category: string]: LineItem[]} = {};
    Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, 'hi', {sensitivity: 'base'}))
      .forEach((category) => {
        sortedGrouped[category] = grouped[category].sort((a, b) =>
          a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'}),
        );
      });

    return sortedGrouped;
  }, [lineItems, currentPoStatus]);

  console.log('groped itemssss', groupedItems);
  const handleSubmitOrder = (isDraft: boolean = true) => {
    if (isViewMode && currentPoStatus === 'COMPLETED') {
      toast.error('Cannot submit in view mode');
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    }

    if (lineItems.length === 0) {
      toast.error('No items to submit');
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    const itemsToSubmit = lineItems;
    const filteredItems = isDraft
      ? itemsToSubmit
      : itemsToSubmit.filter((item) => (item.quantity || 0) > 0);

    if (filteredItems.length === 0) {
      toast.error(
        isDraft
          ? 'No data to save as draft'
          : 'No items with quantity to generate PO',
      );
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    // === CLEAR ALL ERRORS FIRST ===
    setLineItems((prev) =>
      prev.map((item) => ({
        ...item,
        requiredErrors: undefined,
        error: undefined,
      })),
    );

    // === FINAL PO: VALIDATE REQUIRED FIELDS ONLY ON GENERATE PO ===
    if (!isDraft) {
      const itemsWithErrors: LineItem[] = [];

      filteredItems.forEach((item) => {
        if (item.quantity > 0) {
          const errors = validateRequiredFields(item, false); // strict mode
          if (errors.length > 0) {
            itemsWithErrors.push({...item, requiredErrors: errors});
          }
        }
      });

      if (itemsWithErrors.length > 0) {
        // ONLY NOW show errors in UI
        setLineItems((prev) =>
          prev.map((li) => {
            const match = itemsWithErrors.find((e) => li.id === e.id);
            return match ? {...li, requiredErrors: match.requiredErrors} : li;
          }),
        );

        toast.error(
          'Please fill all required fields (Vendor, Price, Date, Time, Location) for items with quantity > 0',
        );
        if (isDraft) setIsSavingDraft(false);
        return;
      }
    }

    // === DRAFT: CLEAR ANY REMAINING ERRORS (just in case) ===
    if (isDraft) {
      setLineItems((prev) =>
        prev.map((item) => ({
          ...item,
          requiredErrors: undefined,
          error: undefined,
        })),
      );
    }

    // Proceed with submission...
    const materialsPayload = filteredItems.map((item) => ({
      materialId: item.rawmaterialId,
      materialName: item.name,
      unit: item.unit,
      quantity: item.quantity || 0,
      particular: item.particular || '',
      packageType: item.packageType || '',
      category: item.category,
      subeventId: item.subEventId || null,
      subeventName: item.subEvent || 'Main Event',
      date: formatDateForAPI(item.date) || undefined,
      time: formatTimeForAPI(item.time) || undefined,
      venue: item.location || '',
      vendorId: item.vendorId || undefined,
      vendorName: item.vendorName || getVendorNameById(item.vendorId),
      price: Number(item.price || 0),
      totalAmount: (item.price || 0) * (item.quantity || 0),
    }));

    const orderData = {
      eventId: id,
      status: isDraft ? 'PARTIAL' : 'COMPLETED',
      materials: materialsPayload,
    };

    saveEventPO(orderData, {
      onSuccess: () => {
        toast.success(
          isDraft
            ? 'Draft saved successfully!'
            : 'Purchase Order generated successfully!',
        );

        refetchEventPO();
        refetchHistory();
        refetchRawMaterialOrder();
        refetch();

        if (isDraft) {
          setCurrentPoStatus('PARTIAL');
          setHasPartialData(true);
          setIsViewMode(false);
        } else {
          setCurrentPoStatus('COMPLETED');
          setIsViewMode(true);
          setHasPartialData(false);
        }
      },
      onError: (error: any) => {
        toast.error(
          `Failed to ${isDraft ? 'save draft' : 'generate PO'}: ${
            error?.message || 'Unknown error'
          }`,
        );
      },
      onSettled: () => {
        if (isDraft) setIsSavingDraft(false);
      },
    });
  };

  const handleEditMode = () => {
    if (currentPoStatus === 'COMPLETED') {
      setIsViewMode(false);
      // Clear any lingering errors when starting to edit
      setLineItems((prev) =>
        prev.map((item) => ({
          ...item,
          requiredErrors: undefined,
          error: undefined,
        })),
      );
      toast.success('Now in edit mode. Changes will create a new draft.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // CHECK 1: First check getpodata for COMPLETED status
        if (getpodata?.data?.status === 'COMPLETED') {
          console.log('Found COMPLETED PO in getpodata');
          const completedItems = processGetPoData(getpodata);

          if (completedItems.length > 0) {
            setLineItems(completedItems);
            setIsViewMode(true); // Set to view mode for COMPLETED
            setCurrentPoStatus('COMPLETED');
            setHasPartialData(false);

            const categories = [
              ...new Set(completedItems.map((item) => item.category)),
            ];
            const expanded: {[key: string]: boolean} = {};
            categories.forEach((cat) => (expanded[cat] = true));
            setExpandedCategories(expanded);
            return;
          }
        }

        // CHECK 2: Check getpodata for PARTIAL status
        if (getpodata?.data?.status === 'PARTIAL') {
          console.log('Found PARTIAL PO in getpodata');
          const partialItems = processGetPoDataPartial(getpodata);

          if (partialItems.length > 0) {
            setLineItems(partialItems);
            setIsViewMode(false); // Set to edit mode for PARTIAL
            setCurrentPoStatus('PARTIAL');
            setHasPartialData(true);

            const categories = [
              ...new Set(partialItems.map((item) => item.category)),
            ];
            const expanded: {[key: string]: boolean} = {};
            categories.forEach((cat) => (expanded[cat] = true));
            setExpandedCategories(expanded);
            return;
          }
        }

        // CHECK 3: Fallback to existing eventPO data
        if (eventPO?.data) {
          const status = eventPO.data.status;
          if (status === 'COMPLETED' || status === 'PARTIAL') {
            let processedItems = processPurchaseMaterials(
              eventPO.data || [],
              status,
            );
            // Adjust with original totals for breakdownQuantity
            const originalMap = new Map<string, number>();
            let rawMats: any[] = [];
            if (rawMaterialOrderData?.data) {
              rawMats = rawMaterialOrderData.data;
            } else if (vendorData && isSuccess) {
              rawMats = Array.isArray(vendorData)
                ? vendorData
                : vendorData.data || [];
            }
            rawMats.forEach((item: any) => {
              const matId = item.id || item.rawmaterialId || item.rawMaterialId;
              const qty = parseFloat(
                (item.orderQuantity || item.quantity || 0).toFixed(1),
              );
              if (matId) {
                originalMap.set(matId, (originalMap.get(matId) || 0) + qty);
              }
            });
            processedItems = processedItems.map((item) => {
              const originalQty =
                originalMap.get(item.rawmaterialId) ||
                item.breakdownQuantity ||
                0;
              if (!item.isBreakdown) {
                item.breakdownQuantity = originalQty;
                if (item.quantity > originalQty) {
                  item.quantity = originalQty;
                  item.totalAmount = (item.price || 0) * originalQty;
                }
              }
              return item;
            });
            setLineItems(processedItems);
            setIsViewMode(status === 'COMPLETED');
            setCurrentPoStatus(status);
            setHasPartialData(status === 'PARTIAL');

            const categories = [
              ...new Set(processedItems.map((item) => item.category)),
            ];
            const expanded: {[key: string]: boolean} = {};
            categories.forEach((cat) => (expanded[cat] = true));
            setExpandedCategories(expanded);
            return;
          }
        }

        // CHECK 4: Priority 3: New PO from rawMaterialOrderData
        if (rawMaterialOrderData?.data) {
          const rawMaterials = rawMaterialOrderData.data;
          if (
            rawMaterials &&
            Array.isArray(rawMaterials) &&
            rawMaterials.length > 0
          ) {
            const processedItems = processRawMaterialOrderData(rawMaterials);
            setLineItems(processedItems);
            setCurrentPoStatus(null);
            setIsViewMode(false);
            setHasPartialData(false);

            const categories = [
              ...new Set(processedItems.map((item) => item.category)),
            ];
            const expanded: {[key: string]: boolean} = {};
            categories.forEach((cat) => (expanded[cat] = true));
            setExpandedCategories(expanded);
            return;
          }
        }

        // CHECK 5: Fallback vendorData
        if (vendorData && isSuccess) {
          let rawMaterials: any[] = [];
          if (Array.isArray(vendorData)) rawMaterials = vendorData;
          else if (vendorData.data && Array.isArray(vendorData.data))
            rawMaterials = vendorData.data;

          if (rawMaterials.length > 0) {
            // Use processVendorData or processRawMaterialOrderData
            const processedItems = processRawMaterialOrderData(rawMaterials);
            setLineItems(processedItems);
            setCurrentPoStatus(null);
            setIsViewMode(false);
            setHasPartialData(false);

            const categories = [
              ...new Set(processedItems.map((item) => item.category)),
            ];
            const expanded: {[key: string]: boolean} = {};
            categories.forEach((cat) => (expanded[cat] = true));
            setExpandedCategories(expanded);
          } else {
            setLineItems([]);
          }
        } else {
          setLineItems([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLineItems([]);
      }
    };

    if (
      id &&
      !isMaterialsLoading &&
      !isHistoryLoading &&
      !isLoadingRawMaterialOrder
    ) {
      loadData();
    }
  }, [
    id,
    isMaterialsLoading,
    isHistoryLoading,
    isLoadingRawMaterialOrder,
    eventPO,
    poHistory,
    rawMaterialOrderData,
    vendorData,
    isSuccess,
    getpodata,
    processGetPoData,
    processGetPoDataPartial,
    processPurchaseMaterials,
    processRawMaterialOrderData,
  ]);

  if (
    isMaterialsLoading ||
    isLoadingVendors ||
    isLoadingRawMaterialOrder ||
    isHistoryLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-3">Loading data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Error loading materials: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-2 rounded-md px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-graydark dark:text-gray">
              Purchase Order
            </h1>
            {isViewMode && currentPoStatus === 'COMPLETED' && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                  COMPLETED
                </span>
              </div>
            )}
            {currentPoStatus === 'PARTIAL' && (
              <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                DRAFT
              </span>
            )}
            {!currentPoStatus && (
              <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                NEW
              </span>
            )}
          </div>
          <ExternalPoHistoryButtons
            setShowHistoryModal={setShowHistoryModal}
            id={id}
          />
        </div>
      </div>

      <ExternalPoHistoryTable
        groupedItems={groupedItems}
        expandedCategories={expandedCategories}
        expandedBreakdowns={expandedBreakdowns}
        categoryConfigs={categoryConfigs}
        currentPoStatus={currentPoStatus}
        isViewMode={isViewMode}
        hasPartialData={hasPartialData}
        getVendorOptions={getVendorOptions}
        getVendorNameById={getVendorNameById}
        getBreakdownItems={getBreakdownItems}
        updateLineItem={updateLineItem}
        updateCategoryConfig={updateCategoryConfig}
        applyCategoryConfig={applyCategoryConfig}
        addBreakdownRow={addBreakdownRow}
        removeBreakdownRow={removeBreakdownRow}
        toggleCategory={toggleCategory}
        toggleBreakdown={toggleBreakdown}
      />

      {/* Action Buttons Section */}
      <div className="mt-6 flex justify-end gap-4">
        {/* Show Save Draft when: 
            - NOT in COMPLETED view mode 
            - OR when in edit mode for COMPLETED PO */}
        {(!isViewMode || (isViewMode && currentPoStatus === 'PARTIAL')) && (
          <button
            onClick={() => handleSubmitOrder(true)}
            disabled={isSubmitting || isSavingDraft}
            className="mx-1 rounded bg-orange-500 px-6 py-1 text-white transition duration-300 ease-in-out"
          >
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </button>
        )}
        {/* Show Generate PO when: 
            - NOT in COMPLETED view mode 
            - OR when in edit mode for COMPLETED PO */}
        {(!isViewMode || (isViewMode && currentPoStatus === 'PARTIAL')) && (
          <button
            onClick={() => handleSubmitOrder(false)}
            disabled={isSubmitting || isSavingDraft}
            className="mx-1 rounded bg-green-600 px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 rounded-full border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>Generate PO</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExternalPoHistoryPage;
