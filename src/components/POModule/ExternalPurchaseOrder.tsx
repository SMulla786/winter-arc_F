/* eslint-disable */
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiSave,
  FiFileText,
} from 'react-icons/fi';
import {useNavigate} from '@tanstack/react-router';
import {
  useGetExternalRMNew,
  useGetVendorsPo,
  useSubmitExternalventPONew,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetExternalPoById} from '@/lib/react-query/queriesAndMutations/cateror/event';

interface LineItem {
  id: string;
  rawmaterialId: string;
  name: string;
  unit: string;
  category: string;
  categoryId?: string;
  subEvent?: string;
  subEventId?: string;
  quantity: number;
  particular?: string;
  packageType?: string;
  date: string;
  time: string;
  location: string;
  vendorId?: string;
  price?: number;
  isBreakdown?: boolean;
  parentId?: string;
  breakdownQuantity?: number;
  totalAmount?: number;
  error?: string;
  requiredErrors?: string[];
  inventory?: number;
  orderQuantity?: number;
  inventoryQuantity?: number;
  submitMainRow?: boolean;
  rmListId?: string;
}

interface Vendor {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  caterorId: string;
  rawMaterialVendorRoles: {
    id: string;
    rawMaterialVendorId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      languageId: string;
      caterorId: string;
    };
  }[];
}

type Props = {
  listId: string;
};

const formatTimeForAPI = (timeString: string): string => {
  if (!timeString) return new Date().toISOString();
  if (timeString.includes('T')) return timeString;
  if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toISOString();
  }
  return new Date().toISOString();
};

const ExternalPurchaseOrderPage: React.FC<Props> = ({listId}) => {
  console.log('idddd', listId);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [categoryConfigs, setCategoryConfigs] = useState<{
    [category: string]: {
      date: string;
      time: string;
      location: string;
      vendorId?: string;
    };
  }>({});

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    data: externalData,
    isLoading: isMaterialsLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetExternalPoById(listId);

  const {mutate: saveExternalPO, isPending: isSubmitting} =
    useSubmitExternalventPONew(listId!);
  const {data: vendorsResponse, isLoading: isLoadingVendors} =
    useGetVendorsPo();
  const {data: getexternalpodata} = useGetExternalRMNew(listId!);
  console.log('getexternaldata', getexternalpodata);

  const vendors: Vendor[] = useMemo(() => {
    const vendorsData = vendorsResponse?.data || vendorsResponse || [];
    return vendorsData;
  }, [vendorsResponse]);

  const formatQuantityDisplay = (quantity: number): string => {
    if (quantity === undefined || quantity === null) return '';
    return parseFloat(quantity.toFixed(1)).toString();
  };

  const validateOrderQuantity = useCallback((item: LineItem): string | null => {
    const totalQuantity = item.breakdownQuantity || 0;
    const userQuantity = item.quantity || 0;

    if (userQuantity > totalQuantity) {
      return `Quantity (${formatQuantityDisplay(userQuantity)}) cannot exceed available quantity (${formatQuantityDisplay(totalQuantity)})`;
    }

    return null;
  }, []);

  const validateBreakdownAgainstTotal = useCallback(
    (breakdownItem: LineItem, parentItem: LineItem): string | null => {
      const totalQuantity = parentItem.breakdownQuantity || 0;
      const breakdownQuantity = breakdownItem.quantity || 0;

      if (breakdownQuantity > totalQuantity) {
        return `Breakdown quantity (${formatQuantityDisplay(breakdownQuantity)}) cannot exceed available quantity (${formatQuantityDisplay(totalQuantity)})`;
      }

      return null;
    },
    [],
  );

  const validateBreakdownQuantities = useCallback(
    (parentItem: LineItem, breakdownItems: LineItem[]) => {
      const totalBreakdownQty = breakdownItems.reduce(
        (sum, b) => sum + (b.quantity || 0),
        0,
      );
      const parentUserQty = parentItem.quantity || 0;
      const totalAvailableQty = parentItem.breakdownQuantity || 0;
      const combinedTotal = parentUserQty + totalBreakdownQty;

      if (combinedTotal > totalAvailableQty) {
        return `Total quantity (main + breakdowns) (${formatQuantityDisplay(combinedTotal)}) cannot exceed available quantity (${formatQuantityDisplay(totalAvailableQty)})`;
      }

      return null;
    },
    [],
  );

  const validateRequiredFields = useCallback(
    (item: LineItem, isDraft: boolean = false): string[] => {
      const errors: string[] = [];

      if (!isDraft && item.quantity > 0) {
        // For final submission (Generate PO), all fields are required
        if (!item.date || item.date.trim() === '') {
          errors.push('Date is required');
        }

        if (!item.time || item.time.trim() === '') {
          errors.push('Time is required');
        }

        if (!item.location || item.location.trim() === '') {
          errors.push('Location is required');
        }

        if (!item.vendorId || item.vendorId.trim() === '') {
          errors.push('Vendor is required');
        }

        if (
          item.price === undefined ||
          item.price === null ||
          item.price <= 0
        ) {
          errors.push('Price is required');
        }

        if (!item.particular || item.particular.trim() === '') {
          errors.push('Particular is required');
        }

        if (!item.packageType || item.packageType.trim() === '') {
          errors.push('Package Type is required');
        }
      }

      return errors;
    },
    [],
  );

  const extractLastPrices = useCallback(() => {
    const lastPriceMap = new Map();

    if (externalData) {
      if (Array.isArray(externalData)) {
        externalData.forEach((item: any) => {
          const rawMaterialId = item.rawmaterialId || item.id;
          const price = item.lastPrice || item.price || 0;
          if (rawMaterialId) {
            lastPriceMap.set(rawMaterialId, price);
          }
        });
      } else if (externalData.data && Array.isArray(externalData.data)) {
        externalData.data.forEach((item: any) => {
          const rawMaterialId = item.rawmaterialId || item.id;
          const price = item.lastPrice || item.price || 0;
          if (rawMaterialId) {
            lastPriceMap.set(rawMaterialId, price);
          }
        });
      }
    }

    return lastPriceMap;
  }, [externalData]);

  const getVendorOptions = useCallback(
    (category: string, categoryId?: string) => {
      console.log('getVendorOptions called with:', category, categoryId);

      if (!vendors || vendors.length === 0) {
        console.log('No vendors available');
        return [];
      }

      console.log('All vendors:', vendors);

      // First, check if we should filter by category at all
      // If category is empty or undefined, return all vendors
      if (!category || category.trim() === '' || category === 'Uncategorized') {
        console.log('Returning all vendors (no category filter)');
        return vendors.map((vendor) => ({
          id: vendor.id,
          label: vendor.name,
        }));
      }

      const filteredVendors = vendors.filter((vendor) => {
        console.log('Checking vendor:', vendor.name);
        console.log('Vendor roles:', vendor.rawMaterialVendorRoles);

        // If vendor has roles, check if any role matches the category
        if (
          vendor.rawMaterialVendorRoles &&
          vendor.rawMaterialVendorRoles.length > 0
        ) {
          const hasMatchingRole = vendor.rawMaterialVendorRoles.some((role) => {
            console.log('Role category name:', role.category?.name);
            console.log('Looking for category:', category);
            console.log('Category ID match:', role.categoryId === categoryId);

            const match =
              role.category?.name === category ||
              (categoryId && role.categoryId === categoryId);

            console.log('Role matches?', match);
            return match;
          });
          console.log('Vendor has matching role?', hasMatchingRole);
          return hasMatchingRole;
        }
        // If no roles defined, include vendor (for now)
        console.log('Vendor has no roles, including anyway');
        return true;
      });

      console.log('Filtered vendors:', filteredVendors);

      // If no vendors matched the category, return all vendors
      if (filteredVendors.length === 0) {
        console.log('No vendors matched category, returning all vendors');
        return vendors.map((vendor) => ({
          id: vendor.id,
          label: vendor.name,
        }));
      }

      return filteredVendors.map((vendor) => ({
        id: vendor.id,
        label: vendor.name,
      }));
    },
    [vendors],
  );

  useEffect(() => {
    try {
      if (isSuccess && externalData && listId) {
        let rawMaterials: any[] = [];

        if (Array.isArray(externalData)) {
          rawMaterials = externalData;
        } else if (externalData.data && Array.isArray(externalData.data)) {
          rawMaterials = externalData.data;
        } else {
          setLineItems([]);
          return;
        }

        if (rawMaterials.length === 0) {
          setLineItems([]);
          return;
        }

        // Sort materials by category and name
        rawMaterials.sort((a, b) => {
          const categoryA = a.category || 'Uncategorized';
          const categoryB = b.category || 'Uncategorized';
          const categoryCompare = categoryA.localeCompare(categoryB, 'hi', {
            sensitivity: 'base',
          });
          if (categoryCompare !== 0) return categoryCompare;

          const nameA = a.rawmaterialName || a.name || 'Unknown Material';
          const nameB = b.rawmaterialName || b.name || 'Unknown Material';
          return nameA.localeCompare(nameB, 'hi', {sensitivity: 'base'});
        });

        // Group by raw material to combine quantities
        const materialAccumulator = new Map();

        rawMaterials.forEach((item) => {
          const rawMaterialId = item.rawmaterialId || item.id;
          const key = `${rawMaterialId}-${item.categoryId || item.category || 'uncategorized'}`;

          if (materialAccumulator.has(key)) {
            const existing = materialAccumulator.get(key);
            existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
            existing.count = (existing.count || 0) + 1;
          } else {
            materialAccumulator.set(key, {
              ...item,
              count: 1,
              quantity: item.quantity || 0,
            });
          }
        });

        const lastPriceMap = extractLastPrices();

        const initialLineItems = Array.from(materialAccumulator.values()).map(
          (item: any, index): LineItem => {
            const rawMaterialId = item.rawmaterialId || item.id;
            const lastPrice = lastPriceMap.get(rawMaterialId) || 0;
            const totalQuantity = parseFloat((item.quantity || 0).toFixed(1));

            const lineItem: LineItem = {
              id: `${rawMaterialId}-${index}`,
              rawmaterialId: rawMaterialId,
              name: item.rawmaterialName || item.name || 'Unknown Material',
              unit: item.unit || 'GRAM',
              quantity: totalQuantity,
              category: item.category || 'Uncategorized',
              categoryId: item.categoryId,
              subEvent: item.subeventName || item.subEvent,
              subEventId: item.subeventId || item.subEventId,
              particular: '',
              packageType: '',
              date: '',
              time: '',
              location: '',
              vendorId: undefined,
              price: lastPrice,
              isBreakdown: false,
              breakdownQuantity: totalQuantity,
              submitMainRow: true,
              rmListId: listId,
              totalAmount: lastPrice * totalQuantity,
            };

            // Validate initial quantity
            const quantityError = validateOrderQuantity(lineItem);
            if (quantityError) {
              lineItem.error = quantityError;
            }

            return lineItem;
          },
        );

        setLineItems(initialLineItems);

        // Set up expanded categories
        const categories = [
          ...new Set(initialLineItems.map((item) => item.category)),
        ];
        categories.sort((a, b) =>
          a.localeCompare(b, 'hi', {sensitivity: 'base'}),
        );

        const initialExpanded: {[key: string]: boolean} = {};
        categories.forEach((category) => {
          initialExpanded[category] = true;
        });
        setExpandedCategories(initialExpanded);
      } else if (listId && !isMaterialsLoading && !externalData) {
        setLineItems([]);
      }
    } catch (error) {
      console.error('Error processing external data:', error);
      setLineItems([]);
    }
  }, [externalData, isSuccess, listId, isMaterialsLoading, extractLastPrices]);

  const updateLineItem = useCallback(
    (lineId: string, updates: Partial<LineItem>) => {
      setLineItems((prev) =>
        prev.map((li) => {
          if (li.id === lineId) {
            const updatedItem = {
              ...li,
              ...updates,
              error: undefined,
              requiredErrors: undefined,
            };

            // Special handling for price to ensure it's always a number or undefined
            if (updates.price !== undefined) {
              updatedItem.price =
                updates.price === '' ? undefined : Number(updates.price);
            }

            if (updates.quantity !== undefined || updates.price !== undefined) {
              const quantity =
                updates.quantity !== undefined ? updates.quantity : li.quantity;
              const price =
                updatedItem.price !== undefined ? updatedItem.price : li.price;
              updatedItem.totalAmount = (price || 0) * (quantity || 0);
            }

            // Validate order quantity for main items
            if (!updatedItem.isBreakdown) {
              const quantityError = validateOrderQuantity(updatedItem);
              if (quantityError) {
                updatedItem.error = quantityError;
              }
            }

            // Validate breakdown against parent total
            if (updatedItem.isBreakdown && updatedItem.parentId) {
              const parentItem = prev.find(
                (item) => item.id === updatedItem.parentId,
              );
              if (parentItem) {
                const breakdownTotalError = validateBreakdownAgainstTotal(
                  updatedItem,
                  parentItem,
                );
                if (breakdownTotalError) {
                  updatedItem.error = breakdownTotalError;
                }
              }
            }

            return updatedItem;
          }
          return li;
        }),
      );

      // After updating, validate breakdown quantities for the parent
      setTimeout(() => {
        setLineItems((current) => {
          const item = current.find((i) => i.id === lineId);
          if (!item) return current;

          let parent: LineItem | undefined;
          if (item.isBreakdown && item.parentId) {
            parent = current.find((i) => i.id === item.parentId);
          } else if (!item.isBreakdown) {
            parent = current.find((i) => i.id === lineId);
          }

          if (parent) {
            const breakdownItems = current.filter(
              (i) => i.parentId === parent!.id && i.isBreakdown,
            );
            const breakdownError = validateBreakdownQuantities(
              parent,
              breakdownItems,
            );

            if (breakdownError) {
              return current.map((i) =>
                (i.parentId === parent!.id && i.isBreakdown) ||
                i.id === parent!.id
                  ? {...i, error: breakdownError}
                  : i,
              );
            } else {
              return current.map((i) =>
                (i.parentId === parent!.id && i.isBreakdown) ||
                i.id === parent!.id
                  ? {...i, error: undefined}
                  : i,
              );
            }
          }

          return current;
        });
      }, 0);
    },
    [
      validateOrderQuantity,
      validateBreakdownQuantities,
      validateBreakdownAgainstTotal,
    ],
  );

  const applyCategoryConfig = useCallback(
    (category: string) => {
      const config = categoryConfigs[category];
      if (!config) return;

      setLineItems((prev) =>
        prev.map((item) => {
          if (item.category === category && !item.isBreakdown) {
            return {
              ...item,
              date: config.date,
              time: config.time,
              location: config.location,
              vendorId: config.vendorId,
            };
          }

          if (item.isBreakdown && item.parentId) {
            const parentItem = prev.find(
              (parent) => parent.id === item.parentId,
            );
            if (parentItem && parentItem.category === category) {
              return {
                ...item,
                date: config.date,
                time: config.time,
                location: config.location,
                vendorId: config.vendorId,
              };
            }
          }

          return item;
        }),
      );
    },
    [categoryConfigs],
  );

  const updateCategoryConfig = useCallback(
    (category: string, field: string, value: string) => {
      setCategoryConfigs((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    },
    [],
  );

  const addBreakdownRow = useCallback(
    (parentItem: LineItem) => {
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
        particular: '', // Empty string
        packageType: parentItem.packageType || '',
        date: parentItem.date || '',
        time: formattedTime,
        location: parentItem.location || '',
        vendorId: parentItem.vendorId,
        price: parentItem.price,
        isBreakdown: true,
        parentId: parentItem.id,
        breakdownQuantity: 0,
        rmListId: listId,
        totalAmount: 0,
      };

      setLineItems((prev) => [...prev, newBreakdown]);
      setExpandedBreakdowns((prev) => ({
        ...prev,
        [parentItem.id]: true,
      }));
    },
    [listId],
  );

  const removeBreakdownRow = useCallback(
    (breakdownId: string) => {
      setLineItems((prev) => {
        const itemToRemove = prev.find((item) => item.id === breakdownId);
        const parentId = itemToRemove?.parentId;
        const updated = prev.filter((item) => item.id !== breakdownId);

        if (parentId) {
          const parentItem = updated.find((item) => item.id === parentId);
          if (parentItem) {
            const breakdownItems = updated.filter(
              (item) => item.parentId === parentId && item.isBreakdown,
            );
            const breakdownError = validateBreakdownQuantities(
              parentItem,
              breakdownItems,
            );

            if (!breakdownError) {
              return updated.map((item) =>
                (item.parentId === parentId && item.isBreakdown) ||
                item.id === parentId
                  ? {...item, error: undefined}
                  : item,
              );
            }
          }
        }

        return updated;
      });
    },
    [validateBreakdownQuantities],
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
    const grouped: {[category: string]: LineItem[]} = {};
    const materialMap = new Map();
    const sortedLineItems = [...lineItems].sort((a, b) => {
      if (!a.isBreakdown && !b.isBreakdown) {
        const categoryCompare = a.category.localeCompare(b.category, 'hi', {
          sensitivity: 'base',
        });
        if (categoryCompare !== 0) return categoryCompare;
        return a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'});
      }
      return 0;
    });

    sortedLineItems.forEach((item) => {
      if (!item.isBreakdown) {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }

        const materialKey = `${item.category}-${item.rawmaterialId}-${item.name}-${item.unit}`;
        const existingIndex = grouped[item.category].findIndex(
          (existingItem) =>
            existingItem.rawmaterialId === item.rawmaterialId &&
            existingItem.name === item.name &&
            existingItem.unit === item.unit,
        );

        if (existingIndex === -1) {
          grouped[item.category].push(item);
          materialMap.set(materialKey, item);
        } else {
          const existingItem = grouped[item.category][existingIndex];
          const existingBreakdownQty = existingItem.breakdownQuantity || 0;
          const currentBreakdownQty = item.breakdownQuantity || 0;
          existingItem.breakdownQuantity =
            existingBreakdownQty + currentBreakdownQty;

          if (!existingItem.categoryId && item.categoryId) {
            existingItem.categoryId = item.categoryId;
          }
          if (!existingItem.subEvent && item.subEvent) {
            existingItem.subEvent = item.subEvent;
          }
          if (!existingItem.subEventId && item.subEventId) {
            existingItem.subEventId = item.subEventId;
          }
        }
      }
    });

    const sortedGrouped: {[category: string]: LineItem[]} = {};
    Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, 'hi', {sensitivity: 'base'}))
      .forEach((category) => {
        const sortedItems = grouped[category].sort((a, b) =>
          a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'}),
        );
        sortedGrouped[category] = sortedItems;
      });

    return sortedGrouped;
  }, [lineItems]);

  const handleSubmitOrder = (isDraft: boolean = true) => {
    // Set loading state
    if (isDraft) {
      setIsSavingDraft(true);
    }

    if (lineItems.length === 0) {
      toast.error('No data to submit');
      if (isDraft) setIsSavingDraft(false);
      return;
    }
    const hasQuantityErrors = lineItems.some((item) => item.error);

    if (hasQuantityErrors) {
      toast.error('Please fix quantity errors before submitting');
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    if (!isDraft) {
      // For final submission (Generate PO), validate all required fields
      const itemsWithErrors: LineItem[] = [];

      lineItems.forEach((item) => {
        if (item.quantity > 0) {
          const requiredErrors = validateRequiredFields(item, false);
          if (requiredErrors.length > 0) {
            itemsWithErrors.push({...item, requiredErrors});
          }
        }
      });

      if (itemsWithErrors.length > 0) {
        setLineItems((prev) =>
          prev.map((item) => {
            const errorItem = itemsWithErrors.find((e) => e.id === item.id);
            if (errorItem) {
              return {...item, requiredErrors: errorItem.requiredErrors};
            }
            return item;
          }),
        );

        toast.error(
          'Please fill all required fields (Date, Time, Location, Vendor, Price, Particular, Package) before generating PO',
        );
        if (isDraft) setIsSavingDraft(false);
        return;
      }

      const quantityErrors = lineItems.some(
        (item) =>
          !item.isBreakdown && item.quantity > (item.breakdownQuantity || 0),
      );

      if (quantityErrors) {
        toast.error(
          'Some quantities exceed available limits. Please check the quantity fields.',
        );
        if (isDraft) setIsSavingDraft(false);
        return;
      }
    }
    const itemsToSubmit: LineItem[] = lineItems.filter((item) => {
      if (isDraft) {
        return true; // Include all items for draft
      } else {
        return item.quantity > 0; // Only include items with quantity > 0 for final PO
      }
    });

    if (!isDraft && itemsToSubmit.length === 0) {
      toast.error('No items with quantity > 0 to generate PO');
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    // Prepare payload for external PO
    const orderData = {
      RMListId: listId,
      status: isDraft ? 'PARTIAL' : 'COMPLETED',
      materials: itemsToSubmit.map((item) => {
        const selectedVendor = vendors.find((v) => v.id === item.vendorId);

        // Only include vendor information if vendorId exists and is not empty
        const vendorIdToSend =
          item.vendorId && item.vendorId.trim() !== ''
            ? item.vendorId
            : undefined;
        const vendorNameToSend = selectedVendor?.name || undefined;

        // For final submission (Generate PO), vendor must be selected
        if (!isDraft && !vendorIdToSend) {
          // This validation should have been caught earlier, but just in case
          console.warn(
            `Vendor is required for final PO for item: ${item.name}`,
          );
        }

        const priceValue = item.price !== undefined ? Number(item.price) : 0;

        return {
          materialId: item.rawmaterialId,
          materialName: item.name,
          vendorId: vendorIdToSend,
          vendorName: vendorNameToSend,
          unit: item.unit,
          quantity: item.quantity,
          particular: item.particular || '',
          packageType: item.packageType || '',
          category: item.category,
          subeventId: item.subEventId || 'default-subevent-id',
          subeventName: item.subEvent || 'Main Event',
          date: formatTimeForAPI(item.time),
          time: formatTimeForAPI(item.time),
          venue: item.location,
          price: priceValue,
          totalAmount: priceValue * item.quantity,
          isBreakdown: item.isBreakdown || false,
          parentId: item.parentId || null,
          rmListId: listId,
        };
      }),
    };

    console.log('Submitting External PO:', {
      isDraft,
      RMListId: listId,
      itemCount: itemsToSubmit.length,
      data: orderData,
    });

    saveExternalPO(orderData, {
      onSuccess: (response) => {
        console.log('Submission successful:', response);

        if (isDraft) {
          toast.success('External Order saved as draft successfully!');
        } else {
          toast.success('External Purchase Order generated successfully!');

          // For final submission, clear only submitted items
          setTimeout(() => {
            setLineItems((prev) =>
              prev.map((item) => {
                // Check if this item was submitted in final PO
                const wasSubmitted = itemsToSubmit.some(
                  (submittedItem) => submittedItem.id === item.id,
                );

                if (wasSubmitted && item.quantity > 0) {
                  if (!item.isBreakdown) {
                    // Reset main item to original breakdown quantity
                    return {
                      ...item,
                      quantity: item.breakdownQuantity || 0,
                      date: '',
                      time: '',
                      location: '',
                      vendorId: undefined,
                      price: 0,
                      totalAmount: 0,
                    };
                  }
                  // Reset breakdown item
                  return {
                    ...item,
                    quantity: 0,
                    date: '',
                    time: '',
                    location: '',
                    vendorId: undefined,
                    price: 0,
                    totalAmount: 0,
                  };
                }
                return item; // Keep items that weren't submitted unchanged
              }),
            );
          }, 1000);
        }

        // Refetch external data to update the list
        refetch();
        if (isDraft) setIsSavingDraft(false);
      },
      onError: (error: any) => {
        console.error('Submission error:', error);

        const errorMessage =
          error?.response?.data?.message || error.message || 'Unknown error';
        toast.error(
          `Failed to ${isDraft ? 'save draft' : 'generate PO'}: ${errorMessage}`,
        );
        if (isDraft) setIsSavingDraft(false);
      },
    });
  };

  if (isMaterialsLoading || isLoadingVendors) {
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
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            External Purchase Order
          </h1>
        </div>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
          <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
            <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
              Raw Materials List
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    R.M.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Particular
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Package Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Total Amt
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                {Object.keys(groupedItems).map((category, categoryIndex) => (
                  <React.Fragment key={category}>
                    <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                      <td colSpan={12} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => toggleCategory(category)}
                          >
                            {expandedCategories[category] ? (
                              <FiChevronDown className="h-4 w-4" />
                            ) : (
                              <FiChevronRight className="h-4 w-4" />
                            )}
                            <span className="text-gray-800 font-semibold dark:text-white">
                              {category}
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 text-sm">
                              ({groupedItems[category].length} items)
                            </span>
                          </div>

                          {expandedCategories[category] && (
                            <div
                              className="flex items-center gap-2 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs">
                                  Date:
                                </span>
                                <input
                                  type="date"
                                  value={categoryConfigs[category]?.date || ''}
                                  onChange={(e) =>
                                    updateCategoryConfig(
                                      category,
                                      'date',
                                      e.target.value,
                                    )
                                  }
                                  className="border-gray-300 rounded border px-2 py-1 text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs">
                                  Time:
                                </span>
                                <input
                                  type="time"
                                  value={categoryConfigs[category]?.time || ''}
                                  onChange={(e) =>
                                    updateCategoryConfig(
                                      category,
                                      'time',
                                      e.target.value,
                                    )
                                  }
                                  className="border-gray-300 w-30 rounded border px-2 py-1 text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs">
                                  Location:
                                </span>
                                <select
                                  value={
                                    categoryConfigs[category]?.location || ''
                                  }
                                  onChange={(e) =>
                                    updateCategoryConfig(
                                      category,
                                      'location',
                                      e.target.value,
                                    )
                                  }
                                  className="border-gray-300 rounded border px-2 py-1 text-xs"
                                >
                                  <option value="">Select location</option>
                                  <option value="event location">
                                    Event Location
                                  </option>
                                  <option value="central kitchen">
                                    Central Kitchen
                                  </option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs">
                                  Vendor:
                                </span>
                                <select
                                  value={
                                    categoryConfigs[category]?.vendorId || ''
                                  }
                                  onChange={(e) =>
                                    updateCategoryConfig(
                                      category,
                                      'vendorId',
                                      e.target.value,
                                    )
                                  }
                                  className="border-gray-300 rounded border px-2 py-1 text-xs"
                                >
                                  <option value="">Select vendor</option>
                                  {getVendorOptions(category).map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                      {vendor.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyCategoryConfig(category);
                                }}
                                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                              >
                                Apply to All
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedCategories[category] &&
                      groupedItems[category].map((item, itemIndex) => {
                        const vendorOptions = getVendorOptions(
                          item.category,
                          item.categoryId,
                        );
                        const breakdownItems = getBreakdownItems(item.id);
                        const isBreakdownExpanded = expandedBreakdowns[item.id];
                        const hasBreakdowns = breakdownItems.length > 0;
                        const mainRowBg =
                          itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';

                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${mainRowBg} ${
                                item.error || item.requiredErrors
                                  ? 'border-l-4 border-red-500'
                                  : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="text-gray-800 text-sm font-medium dark:text-white">
                                  {item.name}
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium">
                                  {formatQuantityDisplay(
                                    item.breakdownQuantity || 0,
                                  )}{' '}
                                  {item.unit}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div>
                                  <input
                                    type="number"
                                    step="any"
                                    value={formatQuantityDisplay(item.quantity)}
                                    onChange={(e) => {
                                      const newQuantity =
                                        e.target.value === ''
                                          ? 0
                                          : Number(e.target.value);
                                      updateLineItem(item.id, {
                                        quantity: newQuantity,
                                      });
                                    }}
                                    className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                      item.error ||
                                      (item.requiredErrors &&
                                        item.requiredErrors.some(
                                          (err) =>
                                            err.includes('Quantity') ||
                                            err.includes('quantity'),
                                        ))
                                        ? 'border-red-300 bg-red-50'
                                        : ''
                                    }`}
                                    placeholder="0.0"
                                  />
                                  {item.error && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                      <FiAlertCircle className="h-3 w-3" />
                                      {item.error}
                                    </div>
                                  )}
                                  {item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Quantity'),
                                    ) && (
                                      <div className="mt-1 text-xs text-red-500">
                                        Quantity is required for final PO
                                      </div>
                                    )}
                                </div>
                              </td>

                              {/* Particular Field */}
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={item.particular || ''}
                                  onChange={(e) =>
                                    updateLineItem(item.id, {
                                      particular: e.target.value,
                                    })
                                  }
                                  className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Particular'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                  placeholder="Enter particular"
                                />
                              </td>

                              {/* Package Type Field */}
                              <td className="px-4 py-3">
                                <select
                                  value={item.packageType || ''}
                                  onChange={(e) =>
                                    updateLineItem(item.id, {
                                      packageType: e.target.value,
                                    })
                                  }
                                  className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Package Type'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                >
                                  <option value="">Select package type</option>
                                  <option value="LOOSE">Loose</option>
                                  <option value="PACKET">Packet</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="date"
                                  value={item.date || ''}
                                  onChange={(e) =>
                                    updateLineItem(item.id, {
                                      date: e.target.value,
                                    })
                                  }
                                  className={`border-gray-300 w-30 rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Date'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                />
                                {item.requiredErrors &&
                                  item.requiredErrors.some((err) =>
                                    err.includes('Date'),
                                  ) && (
                                    <div className="mt-1 text-xs text-red-500">
                                      Date is required for final PO
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="time"
                                  value={item.time || ''}
                                  onChange={(e) =>
                                    updateLineItem(item.id, {
                                      time: e.target.value,
                                    })
                                  }
                                  className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Time'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                />
                                {item.requiredErrors &&
                                  item.requiredErrors.some((err) =>
                                    err.includes('Time'),
                                  ) && (
                                    <div className="mt-1 text-xs text-red-500">
                                      Time is required for final PO
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={item.location || ''}
                                  onChange={(e) =>
                                    updateLineItem(item.id, {
                                      location: e.target.value,
                                    })
                                  }
                                  className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Location'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                >
                                  <option value="">Select location</option>
                                  <option value="event location">
                                    Event Location
                                  </option>
                                  <option value="central kitchen">
                                    Central Kitchen
                                  </option>
                                </select>
                                {item.requiredErrors &&
                                  item.requiredErrors.some((err) =>
                                    err.includes('Location'),
                                  ) && (
                                    <div className="mt-1 text-xs text-red-500">
                                      Location is required for final PO
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={item.vendorId || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateLineItem(item.id, {vendorId: value});
                                  }}
                                  className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Vendor'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                >
                                  <option value="" disabled>
                                    Select vendor
                                  </option>
                                  {vendorOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.label}
                                    </option>
                                  ))}
                                  {vendorOptions.length === 0 && (
                                    <option value="" disabled>
                                      No vendors available
                                    </option>
                                  )}
                                </select>
                                {item.requiredErrors &&
                                  item.requiredErrors.some((err) =>
                                    err.includes('Vendor'),
                                  ) && (
                                    <div className="mt-1 text-xs text-red-500">
                                      Vendor is required for final PO
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.price || ''}
                                  onChange={(e) => {
                                    const newPrice =
                                      e.target.value === ''
                                        ? undefined
                                        : Number(e.target.value);
                                    updateLineItem(item.id, {price: newPrice});
                                    breakdownItems.forEach((breakdown) => {
                                      updateLineItem(breakdown.id, {
                                        price: newPrice,
                                      });
                                    });
                                  }}
                                  className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                    item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Price'),
                                    )
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                  placeholder="0.00"
                                />
                                {item.requiredErrors &&
                                  item.requiredErrors.some((err) =>
                                    err.includes('Price'),
                                  ) && (
                                    <div className="mt-1 text-xs text-red-500">
                                      Price is required for final PO
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium">
                                  ₹
                                  {(
                                    (item.price || 0) * (item.quantity || 0)
                                  ).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => addBreakdownRow(item)}
                                    className="text-green-600 hover:text-green-800"
                                    title="Add breakdown"
                                  >
                                    <FiPlus className="h-4 w-4" />
                                  </button>
                                  {hasBreakdowns && (
                                    <button
                                      onClick={() => toggleBreakdown(item.id)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title={
                                        isBreakdownExpanded
                                          ? 'Collapse breakdown'
                                          : 'Expand breakdown'
                                      }
                                    >
                                      {isBreakdownExpanded ? (
                                        <FiChevronDown className="h-4 w-4" />
                                      ) : (
                                        <FiChevronRight className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {isBreakdownExpanded &&
                              breakdownItems.map(
                                (breakdown, breakdownIndex) => {
                                  const breakdownBg =
                                    breakdownIndex % 2 === 0
                                      ? 'bg-white'
                                      : 'bg-gray-50/30';
                                  const breakdownTotalAmount =
                                    (breakdown.price || 0) *
                                    (breakdown.quantity || 0);

                                  return (
                                    <tr
                                      key={breakdown.id}
                                      className={`hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-blue-300 ${breakdownBg} ${
                                        breakdown.error ||
                                        breakdown.requiredErrors
                                          ? 'border-l-red-500'
                                          : ''
                                      }`}
                                    >
                                      <td className="px-4 py-3"></td>
                                      <td className="px-4 py-3"></td>

                                      <td className="px-4 py-3">
                                        <div>
                                          <input
                                            type="number"
                                            step="any"
                                            value={formatQuantityDisplay(
                                              breakdown.quantity,
                                            )}
                                            onChange={(e) => {
                                              const newQuantity =
                                                e.target.value === ''
                                                  ? 0
                                                  : Number(e.target.value);
                                              updateLineItem(breakdown.id, {
                                                quantity: newQuantity,
                                              });
                                            }}
                                            className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                              breakdown.error
                                                ? 'border-red-300 bg-red-50'
                                                : ''
                                            }`}
                                            placeholder="0.0"
                                          />
                                          {breakdown.error && (
                                            <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                              <FiAlertCircle className="h-3 w-3" />
                                              {breakdown.error}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      {/* Breakdown Particular Field */}
                                      <td className="px-4 py-3">
                                        <input
                                          type="text"
                                          value={breakdown.particular || ''}
                                          onChange={(e) =>
                                            updateLineItem(breakdown.id, {
                                              particular: e.target.value,
                                            })
                                          }
                                          className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) =>
                                                err.includes('Particular'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                          placeholder="Enter particular"
                                        />
                                      </td>

                                      {/* Breakdown Package Type Field */}
                                      <td className="px-4 py-3">
                                        <select
                                          value={breakdown.packageType || ''}
                                          onChange={(e) =>
                                            updateLineItem(breakdown.id, {
                                              packageType: e.target.value,
                                            })
                                          }
                                          className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) =>
                                                err.includes('Package Type'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                        >
                                          <option value="">
                                            Select package type
                                          </option>
                                          <option value="LOOSE">Loose</option>
                                          <option value="PACKET">Packet</option>
                                        </select>
                                      </td>

                                      <td className="px-4 py-3">
                                        <input
                                          type="date"
                                          value={breakdown.date || ''}
                                          onChange={(e) =>
                                            updateLineItem(breakdown.id, {
                                              date: e.target.value,
                                            })
                                          }
                                          className={`border-gray-300 w-30 rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Date'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                        />
                                        {breakdown.requiredErrors &&
                                          breakdown.requiredErrors.some((err) =>
                                            err.includes('Date'),
                                          ) && (
                                            <div className="mt-1 text-xs text-red-500">
                                              Date is required for final PO
                                            </div>
                                          )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <input
                                          type="time"
                                          value={breakdown.time || ''}
                                          onChange={(e) =>
                                            updateLineItem(breakdown.id, {
                                              time: e.target.value,
                                            })
                                          }
                                          className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Time'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                        />
                                        {breakdown.requiredErrors &&
                                          breakdown.requiredErrors.some((err) =>
                                            err.includes('Time'),
                                          ) && (
                                            <div className="mt-1 text-xs text-red-500">
                                              Time is required for final PO
                                            </div>
                                          )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <select
                                          value={breakdown.location || ''}
                                          onChange={(e) =>
                                            updateLineItem(breakdown.id, {
                                              location: e.target.value,
                                            })
                                          }
                                          className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Location'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                        >
                                          <option value="">
                                            Select location
                                          </option>
                                          <option value="event location">
                                            Event Location
                                          </option>
                                          <option value="central kitchen">
                                            Central Kitchen
                                          </option>
                                          <option value="warehouse">
                                            Warehouse
                                          </option>
                                        </select>
                                        {breakdown.requiredErrors &&
                                          breakdown.requiredErrors.some((err) =>
                                            err.includes('Location'),
                                          ) && (
                                            <div className="mt-1 text-xs text-red-500">
                                              Location is required for final PO
                                            </div>
                                          )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <select
                                          value={breakdown.vendorId || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            updateLineItem(breakdown.id, {
                                              vendorId: value,
                                            });
                                          }}
                                          className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Vendor'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                        >
                                          <option value="" disabled>
                                            Select vendor
                                          </option>
                                          {vendorOptions.map((o) => (
                                            <option key={o.id} value={o.id}>
                                              {o.label}
                                            </option>
                                          ))}
                                        </select>
                                        {breakdown.requiredErrors &&
                                          breakdown.requiredErrors.some((err) =>
                                            err.includes('Vendor'),
                                          ) && (
                                            <div className="mt-1 text-xs text-red-500">
                                              Vendor is required for final PO
                                            </div>
                                          )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={breakdown.price || ''}
                                          onChange={(e) => {
                                            const newPrice =
                                              e.target.value === ''
                                                ? undefined
                                                : Number(e.target.value);
                                            updateLineItem(breakdown.id, {
                                              price: newPrice,
                                            });
                                          }}
                                          className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                            breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Price'),
                                            )
                                              ? 'border-red-300 bg-red-50'
                                              : ''
                                          }`}
                                          placeholder="0.00"
                                        />
                                        {breakdown.requiredErrors &&
                                          breakdown.requiredErrors.some((err) =>
                                            err.includes('Price'),
                                          ) && (
                                            <div className="mt-1 text-xs text-red-500">
                                              Price is required for final PO
                                            </div>
                                          )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-sm font-medium">
                                          ₹{breakdownTotalAmount.toFixed(2)}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() =>
                                            removeBreakdownRow(breakdown.id)
                                          }
                                          className="text-red-600 hover:text-red-800"
                                          title="Remove breakdown"
                                        >
                                          <FiMinus className="h-4 w-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => handleSubmitOrder(true)}
            disabled={isSavingDraft || isSubmitting}
            className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingDraft ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>Save as Draft</>
            )}
          </button>

          <button
            onClick={() => handleSubmitOrder(false)}
            disabled={isSubmitting || isSavingDraft}
            className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>Generate PO</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalPurchaseOrderPage;
