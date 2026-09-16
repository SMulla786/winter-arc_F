/* eslint-disable */
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {
  useGetEventRawMaterialsPO,
  useGetVendorsPo,
  useSubmitEventPO,
  useSubmitExternalventPO,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetExternalPoById} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  customPurchaseOrderSchema,
  useGetCustomPo,
  useSubmitCutomPo,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/custompo';
import {useAuth} from './AuthProvider';

interface LineItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  categoryId?: string;
  subEvent?: string;
  subEventId?: string;
  quantity: number;
  date: string;
  time: string;
  location: string;
  vendorId?: string;
  price?: number;
  isBreakdown?: boolean;
  parentId?: string | null;
  breakdownQuantity?: number;
  totalAmount?: number;
  error?: string;
  requiredErrors?: string[];
  inventory?: number;
  orderQuantity?: number;
  inventoryQuantity?: number;
  submitMainRow?: boolean;
  rawmaterialId: string;
  particular?: string;
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
  listId?: string;
};

// In your CustomPo component
const formatTimeForAPI = (timeString: string): string => {
  if (!timeString || timeString.trim() === '') {
    // Return current time
    const now = new Date();
    return now.toISOString();
  }

  // If already ISO string
  if (timeString.includes('T')) {
    return timeString;
  }

  // If HH:MM format
  if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toISOString();
  }

  // Try to parse as Date
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.warn('Could not parse time:', timeString, error);
  }

  // Fallback
  return new Date().toISOString();
};

const formatDateForAPI = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {
    // Return current date as YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  try {
    // If already YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // If DD/MM/YYYY
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // If in another format, try to parse
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return dateString;
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return new Date().toISOString().split('T')[0];
  }
};

const formatQuantityDisplay = (quantity: number | undefined): string => {
  if (quantity === undefined || quantity === null) return '';
  const num = parseFloat(quantity.toFixed(1));
  return num === 0 ? '' : num.toString();
};

const CustomPo: React.FC<Props> = ({listId}) => {
  // Get data from AuthContext
  const {customRawMaterialData, loadRawMaterialData} = useAuth();

  // Determine which data source to use
  const hasAuthContextData = !listId && customRawMaterialData;
  const effectiveListId = listId || customRawMaterialData?.id;

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

  const {mutate: saveEventPO, isPending: isSubmitting} = useSubmitCutomPo(
    effectiveListId || '',
  );
  const {data: vendorsResponse, isLoading: isLoadingVendors} =
    useGetVendorsPo();

  // Only call API if we have a listId (not using AuthContext data)
  const {
    data: rawMaterialOrderData,
    isLoading: isLoadingRawMaterialOrder,
    isSuccess,
    refetch: refetchCustomPo,
  } = useGetCustomPo(effectiveListId || '');

  console.log('getsubmitpocustommmm', rawMaterialOrderData);

  const vendors: Vendor[] = useMemo(() => {
    const vendorsData = vendorsResponse?.data || vendorsResponse || [];
    return vendorsData;
  }, [vendorsResponse]);

  const validateOrderQuantity = useCallback((item: LineItem): string | null => {
    const totalQuantity = item.breakdownQuantity || 0;
    const userQuantity = item.quantity || 0;

    if (userQuantity > totalQuantity) {
      return `This quantity (${formatQuantityDisplay(userQuantity)}) is greater than total available quantity (${formatQuantityDisplay(totalQuantity)})`;
    }

    return null;
  }, []);

  const validateBreakdownAgainstTotal = useCallback(
    (breakdownItem: LineItem, parentItem: LineItem): string | null => {
      const totalQuantity = parentItem.breakdownQuantity || 0;
      const breakdownQuantity = breakdownItem.quantity || 0;

      if (breakdownQuantity > totalQuantity) {
        return `Breakdown quantity (${formatQuantityDisplay(breakdownQuantity)}) exceeds total available quantity (${formatQuantityDisplay(totalQuantity)})`;
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
        return `Combined quantity (${formatQuantityDisplay(combinedTotal)}) exceeds total available quantity (${formatQuantityDisplay(totalAvailableQty)})`;
      }

      return null;
    },
    [],
  );

  const validateRequiredFields = useCallback((item: LineItem): string[] => {
    const errors: string[] = [];

    if (item.quantity > 0) {
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
        item.price === '' ||
        item.price === 0
      ) {
        errors.push('Price is required');
      }

      // Add particular validation
      if (!item.particular || item.particular.trim() === '') {
        errors.push('Particular is required');
      }
    }

    return errors;
  }, []);

  const transformAuthContextData = useCallback((data: any): LineItem[] => {
    if (!data?.sendToVendors || !Array.isArray(data.sendToVendors)) {
      console.log('No sendToVendors data in AuthContext');
      return [];
    }

    console.log(
      'Transforming AuthContext data with',
      data.sendToVendors.length,
      'items',
    );

    const lineItems: LineItem[] = [];

    data.sendToVendors.forEach((item: any, index: number) => {
      // Extract category name from rawmaterial or use default
      const categoryName = item.rawmaterial?.category?.name || 'Uncategorized';

      // Get the actual quantity from the item
      const actualQuantity = item.quantity || 0;

      console.log('Item details:', {
        name: item.rawmaterial?.name || item.name,
        quantity: item.quantity,
        unit: item.unit,
      });

      const lineItem: LineItem = {
        id: `${item.materialId}-${index}-auth`,
        rawmaterialId: item.materialId,
        name: item.rawmaterial?.name || item.name || 'Unknown Material',
        unit: item.unit || 'GRAM',
        category: categoryName,
        subEvent: 'Custom Raw Materials',
        subEventId: 'custom-raw-material',
        quantity: actualQuantity,
        date: '',
        time: '',
        location: '',
        vendorId: undefined,
        price: item.rawmaterial?.amount || 0,
        isBreakdown: false,
        breakdownQuantity: actualQuantity,
        orderQuantity: actualQuantity,
        submitMainRow: true,
        totalAmount: (item.rawmaterial?.amount || 0) * actualQuantity,
        particular: '', // Initialize particular as empty string
      };

      lineItems.push(lineItem);
    });

    console.log('Transformed', lineItems.length, 'line items from AuthContext');
    console.log('First item quantity:', lineItems[0]?.breakdownQuantity);
    return lineItems;
  }, []);

  const processApiData = useCallback((apiData: any): LineItem[] => {
    let rawMaterials: any[] = [];

    // Extract raw materials array from API response
    if (Array.isArray(apiData)) {
      rawMaterials = apiData;
    } else if (apiData?.data && Array.isArray(apiData.data)) {
      rawMaterials = apiData.data;
    } else if (apiData?.sendToVendors && Array.isArray(apiData.sendToVendors)) {
      rawMaterials = apiData.sendToVendors;
    } else {
      console.log('No valid data structure found in API response');
      return [];
    }

    console.log('Processing', rawMaterials.length, 'items from API');

    const lineItems: LineItem[] = [];
    rawMaterials.forEach((item: any, index: number) => {
      // Get raw material ID from various possible fields
      const rawMaterialId = item.rawmaterialId || item.materialId || item.id;

      if (!rawMaterialId) {
        console.warn('No rawmaterialId found for item:', item);
        return;
      }

      // Get the available quantity
      const availableQuantity = item.quantity || 0;

      const lineItem: LineItem = {
        id: `${rawMaterialId}-${index}-api`,
        rawmaterialId: rawMaterialId,
        name: item.rawmaterial?.name || item.name || 'Unknown Material',
        unit: item.unit || 'GRAM',
        category:
          item.category || item.rawmaterial?.category?.name || 'Uncategorized',
        subEvent: item.subeventName || 'Event Materials',
        subEventId: item.subeventId || 'event',
        quantity: availableQuantity,
        date: '',
        time: '',
        location: '',
        vendorId: undefined,
        price: item.rawmaterial?.amount || item.price || 0,
        isBreakdown: false,
        breakdownQuantity: availableQuantity,
        orderQuantity: availableQuantity,
        submitMainRow: true,
        totalAmount:
          (item.rawmaterial?.amount || item.price || 0) * availableQuantity,
        particular: item.particular || '', // Include particular from API if available
      };

      lineItems.push(lineItem);
    });

    return lineItems;
  }, []);

  // Initialize line items from either AuthContext or API
  useEffect(() => {
    const initializeLineItems = () => {
      try {
        let newLineItems: LineItem[] = [];

        if (hasAuthContextData) {
          // Debug the raw data
          console.log('Raw AuthContext data:', customRawMaterialData);
          console.log('sendToVendors:', customRawMaterialData?.sendToVendors);

          // Use AuthContext data
          console.log('Initializing from AuthContext data');
          newLineItems = transformAuthContextData(customRawMaterialData);
        } else if (isSuccess && rawMaterialOrderData && effectiveListId) {
          // Use API data
          console.log('Initializing from API data');
          newLineItems = processApiData(rawMaterialOrderData);
        } else if (
          !isLoadingRawMaterialOrder &&
          !rawMaterialOrderData &&
          !hasAuthContextData
        ) {
          console.log('No data available from any source');
          setLineItems([]);
          return;
        }

        // Debug the calculated line items
        console.log('Calculated line items:', newLineItems);
        newLineItems.forEach((item, idx) => {
          console.log(
            `LineItem ${idx}: ${item.name} - Quantity: ${item.breakdownQuantity} ${item.unit} - Price: ${item.price}`,
          );
        });

        // Set line items
        setLineItems(newLineItems);
        console.log('Initialized', newLineItems.length, 'line items');

        // Set up expanded categories
        const categories = [
          ...new Set(newLineItems.map((item) => item.category)),
        ];
        const initialExpanded: {[key: string]: boolean} = {};
        categories.forEach((category) => {
          initialExpanded[category] = true;
        });
        setExpandedCategories(initialExpanded);

        console.log('Expanded categories for:', Object.keys(initialExpanded));
      } catch (error) {
        console.error('Error initializing line items:', error);
        setLineItems([]);
      }
    };

    initializeLineItems();
  }, [
    rawMaterialOrderData,
    isSuccess,
    effectiveListId,
    isLoadingRawMaterialOrder,
    customRawMaterialData,
    hasAuthContextData,
    transformAuthContextData,
    processApiData,
  ]);

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

            if (updates.quantity !== undefined || updates.price !== undefined) {
              const quantity =
                updates.quantity !== undefined ? updates.quantity : li.quantity;
              const price =
                updates.price !== undefined ? updates.price : li.price;
              updatedItem.totalAmount = (price || 0) * (quantity || 0);
            }

            const requiredErrors = validateRequiredFields(updatedItem);
            if (requiredErrors.length > 0) {
              updatedItem.requiredErrors = requiredErrors;
            } else {
              updatedItem.requiredErrors = undefined;
            }

            if (!li.isBreakdown) {
              const quantityError = validateOrderQuantity(updatedItem);
              if (quantityError) {
                updatedItem.error = quantityError;
              }
            }

            if (li.isBreakdown && li.parentId) {
              const parentItem = prev.find((item) => item.id === li.parentId);
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

            // Rest of the code remains the same...
            setTimeout(() => {
              setLineItems((current) => {
                let parent: LineItem | undefined;
                if (li.isBreakdown && li.parentId) {
                  parent = current.find((item) => item.id === li.parentId);
                } else if (!li.isBreakdown) {
                  parent = current.find((item) => item.id === lineId);
                }

                if (parent) {
                  const breakdownItems = current.filter(
                    (item) => item.parentId === parent!.id && item.isBreakdown,
                  );
                  const breakdownError = validateBreakdownQuantities(
                    parent,
                    breakdownItems,
                  );

                  if (breakdownError) {
                    return current.map((item) =>
                      (item.parentId === parent!.id && item.isBreakdown) ||
                      item.id === parent!.id
                        ? {...item, error: breakdownError}
                        : item,
                    );
                  } else {
                    return current.map((item) =>
                      (item.parentId === parent!.id && item.isBreakdown) ||
                      item.id === parent!.id
                        ? {...item, error: undefined}
                        : item,
                    );
                  }
                }

                return current;
              });
            }, 0);

            return updatedItem;
          }
          return li;
        }),
      );
    },
    [
      validateOrderQuantity,
      validateBreakdownQuantities,
      validateBreakdownAgainstTotal,
      validateRequiredFields,
    ],
  );

  const applyCategoryConfig = useCallback(
    (category: string) => {
      const config = categoryConfigs[category];
      if (!config) return;

      setLineItems((prev) =>
        prev.map((item) => {
          if (item.category === category && !item.isBreakdown) {
            const updatedItem = {
              ...item,
              date: config.date,
              time: config.time,
              location: config.location,
              vendorId: config.vendorId,
            };

            const error = validateOrderQuantity(updatedItem);
            if (error) {
              updatedItem.error = error;
            }

            return updatedItem;
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
    [categoryConfigs, validateOrderQuantity],
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

  const addBreakdownRow = useCallback((parentItem: LineItem) => {
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
      price: parentItem.price,
      isBreakdown: true,
      parentId: parentItem.id,
      totalAmount: 0,
      particular: parentItem.particular || '',
    };

    setLineItems((prev) => [...prev, newBreakdown]);
    setExpandedBreakdowns((prev) => ({
      ...prev,
      [parentItem.id]: true,
    }));
  }, []);

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

  const groupedItems = useMemo(() => {
    console.log('Grouping line items:', lineItems.length);

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
          console.log('Adding item to group:', {
            name: item.name,
            category: item.category,
            breakdownQuantity: item.breakdownQuantity,
            unit: item.unit,
          });

          // Use breakdownQuantity directly
          const newItem = {
            ...item,
            breakdownQuantity: item.breakdownQuantity || 0,
          };

          grouped[item.category].push(newItem);
          materialMap.set(materialKey, newItem);
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

    console.log('Grouped items result:', sortedGrouped);
    return sortedGrouped;
  }, [lineItems]);

  const handleSubmitOrder = () => {
    if (lineItems.length === 0) {
      toast.error('No data to submit');
      return;
    }

    const itemsWithErrors: LineItem[] = [];

    lineItems.forEach((item) => {
      if (item.quantity > 0) {
        const requiredErrors = validateRequiredFields(item);
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

      toast.error('Please fill all required fields before submitting');
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
      return;
    }

    const itemsToSubmit: LineItem[] = [];

    lineItems.forEach((item) => {
      if (item.quantity <= 0) {
        return;
      }

      if (!item.isBreakdown && item.submitMainRow !== false) {
        if (item.vendorId && item.price !== undefined && item.price > 0) {
          itemsToSubmit.push(item);
        }
      }

      if (item.isBreakdown) {
        if (item.vendorId && item.price !== undefined && item.price > 0) {
          itemsToSubmit.push(item);
        }
      }
    });

    if (itemsToSubmit.length === 0) {
      toast.error('No valid items to submit. Please check required fields.');
      return;
    }

    const eventId = effectiveListId;
    const eventName = hasAuthContextData
      ? 'Custom Raw Materials Order'
      : 'External Event';

    if (!eventId) {
      toast.error('No valid order ID found. Please save your order first.');
      return;
    }

    const frontendData = {
      eventId: eventId,
      eventName: eventName,
      materials: itemsToSubmit.map((item) => {
        const selectedVendor = vendors.find((v) => v.id === item.vendorId);

        if (!selectedVendor) {
          console.error(`Vendor not found for ID: ${item.vendorId}`);
          toast.error(`Vendor not found for ID: ${item.vendorId}`);
          throw new Error(`Vendor not found for ID: ${item.vendorId}`);
        }

        const subeventId =
          item.subEventId ||
          (hasAuthContextData ? 'custom-raw-material' : 'event');
        const subeventName =
          item.subEvent ||
          (hasAuthContextData ? 'Custom Raw Materials' : 'Event Materials');

        // Format date and time
        const formattedDate = formatDateForAPI(item.date);
        const formattedTime = formatTimeForAPI(item.time);

        console.log('Item conversion:', {
          name: item.name,
          date: item.date,
          formattedDate,
          time: item.time,
          formattedTime,
          particular: item.particular, // Log to verify
        });

        return {
          materialId: item.rawmaterialId,
          materialName: item.name,
          vendorId: item.vendorId!,
          vendorName: selectedVendor.name || '',
          unit: item.unit,
          quantity: item.quantity,
          category: item.category,
          subeventId: subeventId,
          subeventName: subeventName,
          date: formattedDate,
          time: formattedTime,
          venue: item.location,
          price: item.price || 0,
          totalAmount: (item.price || 0) * item.quantity,
          isBreakdown: item.isBreakdown || false,
          parentId: item.parentId || null,
          particular: item.particular || '', // Add particular field here
        };
      }),
    };

    // Log the complete payload before validation
    console.log(
      'Complete payload with particular:',
      JSON.stringify(frontendData, null, 2),
    );

    // Validate frontend data first
    try {
      const validatedFrontendData =
        customPurchaseOrderSchema.parse(frontendData);
      console.log('Frontend validation successful');

      // Submit the data
      saveEventPO(validatedFrontendData, {
        onSuccess: (response) => {
          toast.success('Order submitted successfully!');

          // Reset form
          setTimeout(() => {
            setLineItems((prev) =>
              prev.map((item) => {
                if (!item.isBreakdown) {
                  return {
                    ...item,
                    quantity: 0,
                    date: '',
                    time: '',
                    location: '',
                    vendorId: undefined,
                    price: 0,
                    totalAmount: 0,
                    particular: '', // Reset particular as well
                  };
                }
                return {
                  ...item,
                  quantity: 0,
                  date: '',
                  time: '',
                  location: '',
                  vendorId: undefined,
                  price: 0,
                  totalAmount: 0,
                  particular: '', // Reset particular for breakdowns
                };
              }),
            );
          }, 1000);
        },
        onError: (error) => {
          if (error.message?.includes('Foreign key constraint')) {
            toast.error(
              'Invalid reference in data. Please check vendor, subevent, or event IDs.',
            );
          } else if (error.message?.includes('validation failed')) {
            toast.error(`Validation error: ${error.message}`);
          } else {
            toast.error(
              `Failed to submit order: ${error.message || 'Unknown error'}`,
            );
          }
        },
      });
    } catch (validationError: any) {
      console.error('Frontend validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        toast.error(
          `Frontend validation failed: ${validationError.errors.map((e) => e.message).join(', ')}`,
        );
      } else {
        toast.error('Failed to validate data before submission');
      }
    }
  };

  if (isLoadingVendors || (listId && isLoadingRawMaterialOrder)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-3">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!effectiveListId && !hasAuthContextData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="rounded-md bg-yellow-50 p-6">
            <h3 className="text-lg font-medium text-yellow-800">
              No Data Available
            </h3>
            <p className="mt-2 text-yellow-700">
              {listId
                ? 'Loading event data...'
                : 'Please create a custom purchase order first or provide an event ID.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Custom Purchase Order</h1>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
          <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
            <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
              Purchase Order List (
              {Object.keys(groupedItems).reduce(
                (total, category) => total + groupedItems[category].length,
                0,
              )}
              items)
            </h3>
          </div>

          {lineItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No materials available. Please check your data source.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      R.M.
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Particular
                    </th>{' '}
                    {/* New column */}
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Total Amt
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                  {Object.keys(groupedItems).map((category, categoryIndex) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                        <td colSpan={10} className="px-4 py-3">
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
                                    value={
                                      categoryConfigs[category]?.date || ''
                                    }
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
                                    value={
                                      categoryConfigs[category]?.time || ''
                                    }
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
                                    {getVendorOptions(category).map(
                                      (vendor) => (
                                        <option
                                          key={vendor.id}
                                          value={vendor.id}
                                        >
                                          {vendor.label}
                                        </option>
                                      ),
                                    )}
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
                          const isBreakdownExpanded =
                            expandedBreakdowns[item.id];
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
                                      value={formatQuantityDisplay(
                                        item.quantity,
                                      )}
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
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={item.particular || ''}
                                    onChange={(e) =>
                                      updateLineItem(item.id, {
                                        particular: e.target.value,
                                      })
                                    }
                                    className={`border-gray-300 w-40 rounded border px-2 py-1 text-sm ${
                                      item.requiredErrors &&
                                      item.requiredErrors.some((err) =>
                                        err.includes('Particular'),
                                      )
                                        ? 'border-red-300 bg-red-50'
                                        : ''
                                    }`}
                                    placeholder="Enter particular details"
                                  />
                                  {item.requiredErrors &&
                                    item.requiredErrors.some((err) =>
                                      err.includes('Particular'),
                                    ) && (
                                      <div className="mt-1 text-xs text-red-500">
                                        Particular is required
                                      </div>
                                    )}
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
                                        Date is required
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
                                        Time is required
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
                                        Location is required
                                      </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={item.vendorId || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      updateLineItem(item.id, {
                                        vendorId: value,
                                      });
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
                                    <option value="">Select vendor</option>
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
                                        Vendor is required
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
                                      updateLineItem(item.id, {
                                        price: newPrice,
                                      });

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
                                        Price is required
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
                                        <td className="px-4 py-3">
                                          <input
                                            type="text"
                                            value={breakdown.particular || ''}
                                            onChange={(e) =>
                                              updateLineItem(breakdown.id, {
                                                particular: e.target.value,
                                              })
                                            }
                                            className={`border-gray-300 w-40 rounded border px-2 py-1 text-sm ${
                                              breakdown.requiredErrors &&
                                              breakdown.requiredErrors.some(
                                                (err) =>
                                                  err.includes('Particular'),
                                              )
                                                ? 'border-red-300 bg-red-50'
                                                : ''
                                            }`}
                                            placeholder="Enter particular details"
                                          />
                                          {breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) =>
                                                err.includes('Particular'),
                                            ) && (
                                              <div className="mt-1 text-xs text-red-500">
                                                Particular is required
                                              </div>
                                            )}
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
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Date'),
                                            ) && (
                                              <div className="mt-1 text-xs text-red-500">
                                                Date is required
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
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Time'),
                                            ) && (
                                              <div className="mt-1 text-xs text-red-500">
                                                Time is required
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
                                                (err) =>
                                                  err.includes('Location'),
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
                                          </select>
                                          {breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Location'),
                                            ) && (
                                              <div className="mt-1 text-xs text-red-500">
                                                Location is required
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
                                            <option value="">
                                              Select vendor
                                            </option>
                                            {vendorOptions.map((o) => (
                                              <option key={o.id} value={o.id}>
                                                {o.label}
                                              </option>
                                            ))}
                                          </select>
                                          {breakdown.requiredErrors &&
                                            breakdown.requiredErrors.some(
                                              (err) => err.includes('Vendor'),
                                            ) && (
                                              <div className="mt-1 text-xs text-red-500">
                                                Vendor is required
                                              </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                          <span className="text-gray-600 text-sm">
                                            {breakdown.price
                                              ? `₹${breakdown.price.toFixed(2)}`
                                              : 'Inherited'}
                                          </span>
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
          )}

          {lineItems.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 border-t border-stroke px-4 py-4 dark:border-strokedark">
              <div className="flex items-center justify-between">
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Total {lineItems.filter((item) => !item.isBreakdown).length}{' '}
                  materials
                </div>
                <div className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
                  Total Items: {lineItems.length}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmitOrder}
            disabled={lineItems.length === 0 || isSubmitting}
            className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPo;
