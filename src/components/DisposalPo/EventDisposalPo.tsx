/* eslint-disable */
import {
  useGetEventRawMaterialsPO,
  useGetHistoryeventPoById,
  useSubmitEventPO,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetEventRawMaterial} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import {useNavigate} from '@tanstack/react-router';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import toast from 'react-hot-toast';

import {
  extractLastPrices,
  formatDateForAPI,
  formatDateForInput,
  formatQuantityDisplay,
  formatTimeForAPI,
  formatTimeForInput,
  LineItem,
  PurchaseMaterialData,
  useGetEventPO,
  validateRequiredFields,
  Vendor,
} from './Disposlaeventhelper';
import EventPoTable from '../Event/subEvent/PO/EventPoTable';
import {useGetDisposalVendorsPo} from '@/lib/react-query/DisposalPo/disposalpo';
import EventDisposalPoTable from './EventDisposalPoTable';
import {
  useGetDisposalPurchase,
  useSubmitEventDisposalPO,
} from '@/lib/react-query/queriesAndMutations/DispsoalPo/disposalpo';

const EventDisposalPo: React.FC = () => {
  const {id} = Route.useParams();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const materialLookupMap = React.useRef<
    Map<string, {category: string; unit: string}>
  >(new Map());
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
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

  const {data: eventPO, refetch: refetchEventPO} = useGetEventPO(id);
  const {mutate: saveEventPO, isPending: isSubmitting} =
    useSubmitEventDisposalPO(id);

  const {
    data: poHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetHistoryeventPoById(id);

  const {data: vendorsResponse, isLoading: isLoadingVendors} =
    useGetDisposalVendorsPo();

  const {
    data: rawMaterialOrderData,
    isLoading: isLoadingRawMaterialOrder,
    refetch: refetchRawMaterialOrder,
  } = useGetEventRawMaterial(id);

  const {data: disposalpurchase, isLoading: isLoadingDisposalpurchase} =
    useGetDisposalPurchase();
  console.log('disposalpooooooo', disposalpurchase);

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
    if (rawMaterialOrderData?.data?.formatedRawMaterials) {
      rawMaterialOrderData.data.formatedRawMaterials.forEach((item: any) => {
        materialLookupMap.current.set(item.id, {
          category: item.category || 'Uncategorized',
          unit: item.unit || 'GRAM',
        });
      });
    } else if (vendorData && isSuccess) {
      let rawMaterials: any[] = [];
      if (Array.isArray(vendorData)) rawMaterials = vendorData;
      else if (vendorData.data && Array.isArray(vendorData.data))
        rawMaterials = vendorData.data;

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

  const processPartialData = useCallback((purchaseHistory: any) => {
    try {
      if (
        !purchaseHistory?.formatted ||
        !Array.isArray(purchaseHistory.formatted)
      ) {
        return [];
      }
      const partialPOs = purchaseHistory.formatted.filter(
        (po: any) => po.status === 'PARTIAL',
      );
      if (partialPOs.length === 0) {
        return [];
      }
      const latestPartialPO = partialPOs[partialPOs.length - 1];
      const purchaseMaterials = latestPartialPO.PurchaseMaterial;
      if (!purchaseMaterials || !Array.isArray(purchaseMaterials)) {
        return [];
      }
      const processedItems: LineItem[] = [];
      // Track unique materials to avoid duplicates
      const uniqueMaterialMap = new Map<string, any>();
      // First, collect all unique materials across all categories
      purchaseMaterials.forEach((category: PurchaseMaterialData) => {
        const categoryName = category.name;
        category.materials.forEach((material) => {
          // Create a unique key using category + material name + specific attributes
          const uniqueKey = `${categoryName}-${material.name}-${material.particular || ''}-${material.packageType || ''}-${material.date}-${material.time}-${material.venue}`;
          if (!uniqueMaterialMap.has(uniqueKey)) {
            uniqueMaterialMap.set(uniqueKey, {
              ...material,
              category: categoryName,
              categoryId: category.id,
            });
          } else {
            // If we find a duplicate with the same key, we should merge quantities
            const existing = uniqueMaterialMap.get(uniqueKey);
            if (
              existing.quantity !== undefined &&
              material.quantity !== undefined
            ) {
              existing.quantity += material.quantity;
            }
          }
        });
      });
      // Now group the unique materials by category and material name
      const categoryMaterialMap = new Map<string, Map<string, any[]>>();
      uniqueMaterialMap.forEach((material) => {
        const categoryName = material.category;
        const materialName = material.name;
        if (!categoryMaterialMap.has(categoryName)) {
          categoryMaterialMap.set(categoryName, new Map());
        }
        const materialMap = categoryMaterialMap.get(categoryName)!;
        if (!materialMap.has(materialName)) {
          materialMap.set(materialName, []);
        }
        materialMap.get(materialName)!.push(material);
      });
      // Now create line items from grouped data
      categoryMaterialMap.forEach((materialMap, categoryName) => {
        materialMap.forEach((materials, materialName) => {
          const baseId = `${categoryName}-${materialName}-${Date.now()}`;
          if (materials.length === 1) {
            // Single item - no breakdown needed
            const material = materials[0];
            processedItems.push({
              id: material.id || `${baseId}-single`,
              rawmaterialId: material.materialId || material.id || baseId,
              name: materialName,
              unit: material.unit || 'GRAM',
              quantity: material.quantity || 0,
              category: categoryName,
              particular: material.particular || '',
              packageType: material.packageType || '',
              date: formatDateForInput(material.date || ''),
              time: formatTimeForInput(material.time || ''),
              location: material.venue || '',
              vendorId: material.vendorId,
              vendorName: material.vendorName,
              price: material.price || 0,
              isBreakdown: false,
              breakdownQuantity: material.quantity || 0,
              totalAmount: (material.price || 0) * (material.quantity || 0),
              submitMainRow: true,
            });
          } else {
            // Multiple items - create main row and breakdowns
            let totalQuantity = 0;
            materials.forEach((material) => {
              totalQuantity += material.quantity || 0;
            });
            // Create main row
            const mainRowId = `${baseId}-main`;
            processedItems.push({
              id: mainRowId,
              rawmaterialId: materials[0].materialId || baseId,
              name: materialName,
              unit: materials[0].unit || 'GRAM',
              quantity: totalQuantity,
              category: categoryName,
              particular: '',
              packageType: '',
              date: '',
              time: '',
              location: '',
              vendorId: undefined,
              vendorName: undefined,
              price: materials[0].price || 0,
              isBreakdown: false,
              breakdownQuantity: totalQuantity,
              totalAmount: materials.reduce(
                (sum, m) => sum + (m.price || 0) * (m.quantity || 0),
                0,
              ),
              submitMainRow: true,
            });
            // Create breakdown rows
            materials.forEach((material, index) => {
              processedItems.push({
                id: material.id || `${baseId}-breakdown-${index}`,
                rawmaterialId: material.materialId || baseId,
                name: materialName,
                unit: material.unit || 'GRAM',
                quantity: material.quantity || 0,
                category: categoryName,
                particular: material.particular || '',
                packageType: material.packageType || '',
                date: formatDateForInput(material.date || ''),
                time: formatTimeForInput(material.time || ''),
                location: material.venue || '',
                vendorId: material.vendorId,
                vendorName: material.vendorName,
                price: material.price || 0,
                isBreakdown: true,
                parentId: mainRowId,
                breakdownQuantity: material.quantity || 0,
                totalAmount: (material.price || 0) * (material.quantity || 0),
                submitMainRow: false,
              });
            });
          }
        });
      });
      return processedItems;
    } catch (error) {
      console.error('Error processing partial data:', error);
      return [];
    }
  }, []);

  const processCompletedData = useCallback((purchaseHistory: any) => {
    try {
      if (
        !purchaseHistory?.formatted ||
        !Array.isArray(purchaseHistory.formatted)
      ) {
        return [];
      }
      const completedPOs = purchaseHistory.formatted.filter(
        (po: any) => po.status === 'COMPLETED',
      );
      if (completedPOs.length === 0) {
        return [];
      }
      const latestCompletedPO = completedPOs[completedPOs.length - 1];
      const purchaseMaterials = latestCompletedPO.PurchaseMaterial;
      if (!purchaseMaterials || !Array.isArray(purchaseMaterials)) {
        return [];
      }
      const processedItems: LineItem[] = [];
      purchaseMaterials.forEach((category: PurchaseMaterialData) => {
        const categoryName = category.name;
        category.materials.forEach((material) => {
          processedItems.push({
            id: material.id || `completed-${Date.now()}-${Math.random()}`,
            rawmaterialId: material.materialId || material.id,
            name: material.name,
            unit: material.unit || 'GRAM',
            quantity: material.quantity || 0,
            category: categoryName,
            particular: material.particular || '',
            packageType: material.packageType || '',
            date: formatDateForInput(material.date || ''),
            time: formatTimeForInput(material.time || ''),
            location: material.venue || '',
            vendorId: material.vendorId,
            vendorName: material.vendorName,
            price: material.price || 0,
            isBreakdown: false,
            breakdownQuantity: material.quantity || 0,
            totalAmount: (material.price || 0) * (material.quantity || 0),
            submitMainRow: true,
          });
        });
      });
      return processedItems;
    } catch (error) {
      console.error('Error processing completed data:', error);
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
        const rawMaterialId = item.id;
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
          name: firstItem.name || 'Unknown Material',
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

  // Process vendor data (already merges in the provided code)
  const processVendorData = useCallback(
    (rawMaterials: any[]): LineItem[] => {
      const lastPriceMap = extractLastPrices(rawMaterials);
      // Group by material and category
      const materialAccumulator = new Map();
      rawMaterials.forEach((item) => {
        const rawMaterialId =
          item.rawmaterialId || item.rawMaterialId || item.id;
        const key = `${rawMaterialId}-${item.categoryId || item.category || 'uncategorized'}`;
        if (materialAccumulator.has(key)) {
          const existing = materialAccumulator.get(key);
          const hasOrderQuantity = item.orderQuantity && item.orderQuantity > 0;
          if (!hasOrderQuantity) {
            existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
          } else {
            existing.orderQuantity = item.orderQuantity;
          }
          existing.count = (existing.count || 0) + 1;
        } else {
          materialAccumulator.set(key, {
            ...item,
            count: 1,
            quantity: item.quantity || 0,
            orderQuantity: item.orderQuantity || 0,
          });
        }
      });
      const processedData = Array.from(materialAccumulator.values()).map(
        (item: any, index) => {
          const rawMaterialId =
            item.rawmaterialId || item.rawMaterialId || item.id;
          const lastPrice = lastPriceMap.get(rawMaterialId) || 0;
          let totalAvailableQuantity = 0;
          if (item.orderQuantity && item.orderQuantity > 0) {
            totalAvailableQuantity = parseFloat(item.orderQuantity.toFixed(1));
          } else {
            totalAvailableQuantity = parseFloat(
              (item.quantity || 0).toFixed(1),
            );
          }
          return {
            id: `${rawMaterialId}-${item.subeventId || 'main'}-${index}`,
            rawmaterialId: rawMaterialId,
            name: item.rawmaterialName || item.name || 'Unknown Material',
            unit: item.unit || 'GRAM',
            quantity: totalAvailableQuantity,
            category: item.category || 'Uncategorized',
            categoryId: item.categoryId,
            subEvent: item.subeventName || item.subEvent,
            subEventId: item.subeventId || item.subEventId,
            isBreakdown: false,
            breakdownQuantity: totalAvailableQuantity,
            submitMainRow: true,
            lastPrice: lastPrice,
            totalAmount: (lastPrice || 0) * totalAvailableQuantity,
          };
        },
      );
      return processedData.map((material, index) => {
        const lastPrice = lastPriceMap.get(material.rawmaterialId) || 0;
        return {
          id: material.id,
          rawmaterialId: material.rawmaterialId,
          name: material.name,
          category: material.category,
          categoryId: material.categoryId,
          subEvent: material.subEvent,
          subEventId: material.subEventId,
          unit: material.unit,
          quantity: material.breakdownQuantity || 0,
          date: '',
          time: '',
          location: '',
          vendorId: undefined,
          vendorName: undefined,
          price: lastPrice,
          isBreakdown: false,
          breakdownQuantity: material.breakdownQuantity,
          submitMainRow: true,
          totalAmount: (lastPrice || 0) * (material.breakdownQuantity || 0),
        };
      });
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

    // === QUANTITY OVER-ALLOCATION CHECK (always enforce) ===
    const hasQuantityErrors = lineItems.some((li) => {
      const rawId = li.rawmaterialId;
      const original = originalTotals.get(rawId) || 0;
      const currentSum = lineItems
        .filter((i) => i.rawmaterialId === rawId)
        .reduce((s, i) => s + (i.quantity || 0), 0);
      return currentSum > original;
    });

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

  useEffect(() => {
    const loadData = async () => {
      try {
        // Priority 1: eventPO (PARTIAL or COMPLETED)
        if (eventPO?.formatted) {
          const status = eventPO.formatted.status;
          if (status === 'COMPLETED' || status === 'PARTIAL') {
            let processedItems = processPurchaseMaterials(
              eventPO.formatted.PurchaseMaterial || [],
              status,
            );
            // Adjust with original totals for breakdownQuantity
            const originalMap = new Map<string, number>();
            let rawMats: any[] = [];
            if (rawMaterialOrderData?.data?.formatedRawMaterials) {
              rawMats = rawMaterialOrderData.data.formatedRawMaterials;
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

        // Priority 2: History fallback
        if (poHistory?.formatted) {
          let completedItems = processCompletedData(poHistory);
          if (completedItems.length > 0) {
            // Adjust with original
            const originalMap = new Map<string, number>();
            let rawMats: any[] = [];
            if (rawMaterialOrderData?.data?.formatedRawMaterials) {
              rawMats = rawMaterialOrderData.data.formatedRawMaterials;
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
            completedItems = completedItems.map((item) => {
              const originalQty =
                originalMap.get(item.rawmaterialId) ||
                item.breakdownQuantity ||
                0;
              item.breakdownQuantity = originalQty;
              if (item.quantity > originalQty) {
                item.quantity = originalQty;
                item.totalAmount = (item.price || 0) * originalQty;
              }
              return item;
            });
            setLineItems(completedItems);
            setIsViewMode(true);
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

          let partialItems = processPartialData(poHistory);
          if (partialItems.length > 0) {
            // Adjust with original
            const originalMap = new Map<string, number>();
            let rawMats: any[] = [];
            if (rawMaterialOrderData?.data?.formatedRawMaterials) {
              rawMats = rawMaterialOrderData.data.formatedRawMaterials;
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
            partialItems = partialItems.map((item) => {
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
            setLineItems(partialItems);
            setIsViewMode(false);
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

        // Priority 3: New PO from rawMaterialOrderData
        if (rawMaterialOrderData?.data?.formatedRawMaterials) {
          const rawMaterials = rawMaterialOrderData.data.formatedRawMaterials;
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

        // Priority 4: Fallback vendorData
        if (vendorData && isSuccess) {
          let rawMaterials: any[] = [];
          if (Array.isArray(vendorData)) rawMaterials = vendorData;
          else if (vendorData.data && Array.isArray(vendorData.data))
            rawMaterials = vendorData.data;

          if (rawMaterials.length > 0) {
            const processedItems = processVendorData(rawMaterials);
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
    processPurchaseMaterials,
    processPartialData,
    processCompletedData,
    processRawMaterialOrderData,
    processVendorData,
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Title + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-graydark dark:text-gray">
              Disposal PO
            </h1>

            {isViewMode && currentPoStatus === 'COMPLETED' && (
              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                COMPLETED
              </span>
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
        </div>
      </div>

      <EventDisposalPoTable
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
        // toggleBreakdown={toggleBreakdown}
      />

      {/* Action Buttons Section */}
      <div className="mt-6 flex justify-end gap-4">
        {/* Show Save Draft only when NOT completed */}
        {currentPoStatus !== 'COMPLETED' && (
          <button
            onClick={() => handleSubmitOrder(true)}
            disabled={isSubmitting || isSavingDraft}
            className="mx-1 rounded bg-orange-500 px-6 py-1 text-white transition duration-300 ease-in-out"
          >
            Save Draft
          </button>
        )}
        {/* Show Generate PO only when NOT completed */}
        {currentPoStatus !== 'COMPLETED' && (
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

export default EventDisposalPo;
