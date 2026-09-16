/* eslint-disable */
import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiFileText,
  FiPrinter,
  FiCheckCircle,
} from 'react-icons/fi';
import {useNavigate} from '@tanstack/react-router';
import {
  useGetExternalRMNew,
  useGetVendorsPo,
  useSubmitExternalventPONew,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetExternalPoById} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useAuthContext} from '@/context/AuthContext';
import {generatePDFHTML} from '@/utils/pdfGenerator';

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
  vendorName?: string;
  price?: number;
  isBreakdown?: boolean;
  parentId?: string;
  breakdownQuantity?: number; // This is the total available quantity from API
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

interface PurchaseItem {
  id: string;
  quantity: number;
  date: string;
  time: string;
  venue: string;
  price: number;
  particular?: string;
  packageType?: string;
  vendorId: string;
  vendorName: string;
}

interface MaterialData {
  materialId: string;
  name: string;
  unit: string;
  purchase: PurchaseItem[];
}

interface PurchaseMaterialCategory {
  id: string;
  name: string;
  materials: MaterialData[];
}

interface ExternalPoData {
  data?: {
    id: string;
    listNo: number;
    RMlistId: string;
    inwordType: string;
    status: 'PARTIAL' | 'COMPLETED' | 'PENDING';
    caterorId: string;
    isEmergency: boolean;
    eventId: string | null;
    createdAt: string;
    updatedAt: string;
    PurchaseMaterial: PurchaseMaterialCategory[];
    _count: {
      PurchaseMaterial: number;
    };
  };
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

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  try {
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    if (timeString.match(/^\d{1,2}:\d{2}$/)) {
      return timeString;
    }
    return timeString;
  } catch {
    return timeString;
  }
};

const ExternalPoRMPage: React.FC<Props> = ({listId}) => {
  console.log('listId:', listId);
  const {user} = useAuthContext();
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
  const [caterorInfo, setCaterorInfo] = useState({
    name: user?.fullname || 'name',
    address: user?.address || 'address',
    phone: user?.phoneNumber || 'phone',
    email: user?.email || 'email',
  });
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [expandedCategoriesRO, setExpandedCategoriesRO] = useState<{
    [key: string]: boolean;
  }>({});
  const [printContent, setPrintContent] = useState<string>('');
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const {data: getexternalpodata, isLoading: isExternalLoading} =
    useGetExternalRMNew(listId!);

  const {
    data: externalData,
    isLoading: isMaterialsLoading,
    isError,
    error,
    refetch,
  } = useGetExternalPoById(listId);

  const {mutate: saveExternalPO, isPending: isSubmitting} =
    useSubmitExternalventPONew(listId!);
  const {data: vendorsResponse, isLoading: isLoadingVendors} =
    useGetVendorsPo();

  const vendors: Vendor[] = useMemo(() => {
    const vendorsData = vendorsResponse?.data || vendorsResponse || [];
    return Array.isArray(vendorsData) ? vendorsData : [];
  }, [vendorsResponse]);

  const isCompleted = getexternalpodata?.data?.status === 'COMPLETED';
  const isPartial = getexternalpodata?.data?.status === 'PARTIAL';
  const isPending = getexternalpodata?.data?.status === 'PENDING';

  // Process purchase data for completed status
  const purchaseData = useMemo(() => {
    if (!getexternalpodata?.data?.PurchaseMaterial) return [];

    const materials: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      category: string;
      particular?: string;
      packageType?: string;
      date: string;
      time: string;
      location: string;
      vendorId: string;
      vendorName: string;
      price: number;
      totalAmount: number;
    }> = [];

    getexternalpodata.data.PurchaseMaterial.forEach(
      (category: PurchaseMaterialCategory) => {
        category.materials.forEach((material: MaterialData) => {
          if (material.purchase && Array.isArray(material.purchase)) {
            material.purchase.forEach((purchaseItem: PurchaseItem) => {
              materials.push({
                id: purchaseItem.id,
                name: material.name,
                quantity: purchaseItem.quantity,
                unit: material.unit,
                category: category.name,
                particular: purchaseItem.particular,
                packageType: purchaseItem.packageType,
                date: purchaseItem.date,
                time: purchaseItem.time,
                location: purchaseItem.venue,
                vendorId: purchaseItem.vendorId,
                vendorName: purchaseItem.vendorName,
                price: purchaseItem.price,
                totalAmount: purchaseItem.price * purchaseItem.quantity,
              });
            });
          }
        });
      },
    );

    return materials;
  }, [getexternalpodata]);

  const formatQuantityDisplay = (quantity: number): string => {
    if (quantity === undefined || quantity === null) return '';
    return parseFloat(quantity.toFixed(1)).toString();
  };

  // Validation function for quantity
  const validateQuantity = useCallback(
    (quantity: number, availableQuantity: number): string | null => {
      if (quantity > availableQuantity) {
        return `Quantity (${formatQuantityDisplay(quantity)}) cannot exceed available quantity (${formatQuantityDisplay(availableQuantity)})`;
      }
      return null;
    },
    [],
  );

  const validateRequiredFields = useCallback(
    (item: LineItem, isDraft: boolean = false): string[] => {
      const errors: string[] = [];

      if (!isDraft && item.quantity > 0) {
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

        // Removed particular and packageType from required validation
        // They are now optional
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

  // Function to calculate total quantity from raw materials (for PENDING status)
  const calculateTotalQuantitiesFromRawMaterials = useCallback(
    (rawMaterials: any[]) => {
      const quantityMap = new Map<string, number>();

      rawMaterials.forEach((item) => {
        const materialId = item.rawmaterialId || item.id;
        const quantity = item.quantity || 0;

        if (materialId) {
          if (!quantityMap.has(materialId)) {
            quantityMap.set(materialId, 0);
          }
          quantityMap.set(materialId, quantityMap.get(materialId)! + quantity);
        }
      });

      return quantityMap;
    },
    [],
  );

  useEffect(() => {
    try {
      if ((isPartial || isPending) && externalData && listId) {
        console.log(
          'Initializing line items for status:',
          isPartial ? 'PARTIAL' : 'PENDING',
        );

        let rawMaterials: any[] = [];

        // Get raw materials from externalData
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

        // Calculate total quantities for each material
        const totalQuantityMap =
          calculateTotalQuantitiesFromRawMaterials(rawMaterials);
        const lastPriceMap = extractLastPrices();

        const initialLineItems: LineItem[] = [];
        const initialExpandedBreakdowns: {[key: string]: boolean} = {};
        const initialExpandedCategories: {[key: string]: boolean} = {};

        if (isPartial && getexternalpodata?.data?.PurchaseMaterial) {
          console.log('Processing PARTIAL status with saved data');

          // PARTIAL STATUS: Use saved data from getexternalpodata
          getexternalpodata.data.PurchaseMaterial.forEach(
            (category: PurchaseMaterialCategory) => {
              const categoryName = category.name;
              initialExpandedCategories[categoryName] = true;

              category.materials.forEach((material: MaterialData) => {
                const materialId = material.materialId;
                const materialName = material.name;
                const unit = material.unit || 'GRAM';

                // Check if material has purchase data
                if (material.purchase && Array.isArray(material.purchase)) {
                  // If there's only one purchase item, show it as a regular row (not breakdown)
                  if (material.purchase.length === 1) {
                    const purchase = material.purchase[0];

                    // Format date
                    let formattedDate = '';
                    if (purchase?.date) {
                      try {
                        const date = new Date(purchase.date);
                        if (!isNaN(date.getTime())) {
                          formattedDate = date.toISOString().split('T')[0];
                        }
                      } catch (e) {
                        formattedDate = '';
                      }
                    }

                    // Format time
                    let formattedTime = '';
                    if (purchase?.time) {
                      try {
                        if (purchase.time.includes('T')) {
                          const timeDate = new Date(purchase.time);
                          const hours = String(timeDate.getHours()).padStart(
                            2,
                            '0',
                          );
                          const minutes = String(
                            timeDate.getMinutes(),
                          ).padStart(2, '0');
                          formattedTime = `${hours}:${minutes}`;
                        } else if (purchase.time.match(/^\d{1,2}:\d{2}/)) {
                          formattedTime = purchase.time.substring(0, 5);
                        } else {
                          formattedTime = purchase.time;
                        }
                      } catch (e) {
                        formattedTime = '';
                      }
                    }

                    // Get available quantity from the saved purchase data
                    const availableQuantity = purchase.quantity || 0;

                    // Create a single row (not breakdown) with the purchase data
                    initialLineItems.push({
                      id: purchase.id || `single-${materialId}`,
                      rawmaterialId: materialId,
                      name: materialName,
                      unit: unit,
                      quantity: purchase.quantity || 0,
                      category: categoryName,
                      categoryId: undefined,
                      particular: purchase.particular || '',
                      packageType: purchase.packageType || 'LOOSE',
                      date: formattedDate,
                      time: formattedTime,
                      location: purchase.venue || '',
                      vendorId: purchase.vendorId,
                      vendorName: purchase.vendorName || '',
                      price:
                        purchase.price || lastPriceMap.get(materialId) || 0,
                      isBreakdown: false,
                      parentId: undefined,
                      breakdownQuantity: availableQuantity, // Set available quantity from API
                      submitMainRow: true,
                      rmListId: listId,
                      totalAmount:
                        (purchase.price || 0) * (purchase.quantity || 0),
                    });
                  } else {
                    // Multiple purchase items - create breakdown structure
                    // Calculate total from all purchases (available quantity)
                    let totalAvailableQuantity = 0;
                    material.purchase.forEach((purchase) => {
                      totalAvailableQuantity += purchase.quantity || 0;
                    });

                    // Create main row with quantity 0 (user will input what they want)
                    const mainRowId = `${materialId}-main`;
                    initialLineItems.push({
                      id: mainRowId,
                      rawmaterialId: materialId,
                      name: materialName,
                      unit: unit,
                      quantity: 0, // Start with 0, user will input
                      category: categoryName,
                      categoryId: undefined,
                      particular: '',
                      packageType: 'LOOSE',
                      date: '',
                      time: '',
                      location: '',
                      vendorId: undefined,
                      vendorName: '',
                      price: lastPriceMap.get(materialId) || 0,
                      isBreakdown: false,
                      parentId: undefined,
                      breakdownQuantity: totalAvailableQuantity, // Set total available from API
                      submitMainRow: true,
                      rmListId: listId,
                      totalAmount: 0,
                    });

                    // Create breakdown rows for each purchase item
                    material.purchase.forEach(
                      (purchase: PurchaseItem, index: number) => {
                        // Format date
                        let formattedDate = '';
                        if (purchase?.date) {
                          try {
                            const date = new Date(purchase.date);
                            if (!isNaN(date.getTime())) {
                              formattedDate = date.toISOString().split('T')[0];
                            }
                          } catch (e) {
                            formattedDate = '';
                          }
                        }

                        // Format time
                        let formattedTime = '';
                        if (purchase?.time) {
                          try {
                            if (purchase.time.includes('T')) {
                              const timeDate = new Date(purchase.time);
                              const hours = String(
                                timeDate.getHours(),
                              ).padStart(2, '0');
                              const minutes = String(
                                timeDate.getMinutes(),
                              ).padStart(2, '0');
                              formattedTime = `${hours}:${minutes}`;
                            } else if (purchase.time.match(/^\d{1,2}:\d{2}/)) {
                              formattedTime = purchase.time.substring(0, 5);
                            } else {
                              formattedTime = purchase.time;
                            }
                          } catch (e) {
                            formattedTime = '';
                          }
                        }

                        initialLineItems.push({
                          id: purchase.id || `breakdown-${materialId}-${index}`,
                          rawmaterialId: materialId,
                          name: materialName,
                          unit: unit,
                          quantity: purchase.quantity || 0,
                          category: categoryName,
                          categoryId: undefined,
                          particular: purchase.particular || '',
                          packageType: purchase.packageType || 'LOOSE',
                          date: formattedDate,
                          time: formattedTime,
                          location: purchase.venue || '',
                          vendorId: purchase.vendorId,
                          vendorName: purchase.vendorName || '',
                          price:
                            purchase.price || lastPriceMap.get(materialId) || 0,
                          isBreakdown: true,
                          parentId: mainRowId,
                          breakdownQuantity: purchase.quantity || 0,
                          rmListId: listId,
                          totalAmount:
                            (purchase.price || 0) * (purchase.quantity || 0),
                        });
                      },
                    );

                    // Expand the main row if there are multiple purchase items
                    if (material.purchase.length > 1) {
                      initialExpandedBreakdowns[mainRowId] = true;
                    }
                  }
                } else {
                  // No purchase data - create a single row with 0 quantity initially
                  const totalAvailable = totalQuantityMap.get(materialId) || 0;
                  initialLineItems.push({
                    id: `${materialId}-single`,
                    rawmaterialId: materialId,
                    name: materialName,
                    unit: unit,
                    quantity: 0, // Start with 0, user will input
                    category: categoryName,
                    categoryId: undefined,
                    particular: '',
                    packageType: 'LOOSE',
                    date: '',
                    time: '',
                    location: '',
                    vendorId: undefined,
                    vendorName: '',
                    price: lastPriceMap.get(materialId) || 0,
                    isBreakdown: false,
                    parentId: undefined,
                    breakdownQuantity: totalAvailable, // Set available quantity from API
                    submitMainRow: true,
                    rmListId: listId,
                    totalAmount: 0,
                  });
                }
              });
            },
          );
        } else if (isPending) {
          console.log('Processing PENDING status');

          // PENDING STATUS: Group raw materials by material and category
          const materialGroups = new Map<string, any[]>();
          const categoryGroups = new Map<string, string[]>();

          rawMaterials.forEach((item) => {
            const materialId = item.rawmaterialId || item.id;
            const category = item.category || 'Uncategorized';

            if (!materialGroups.has(materialId)) {
              materialGroups.set(materialId, []);
            }
            materialGroups.get(materialId)?.push(item);

            if (!categoryGroups.has(category)) {
              categoryGroups.set(category, []);
            }
            if (!categoryGroups.get(category)?.includes(materialId)) {
              categoryGroups.get(category)?.push(materialId);
            }
          });

          // Set expanded categories
          categoryGroups.forEach((_, category) => {
            initialExpandedCategories[category] = true;
          });

          // Create line items
          materialGroups.forEach((items, materialId) => {
            const firstItem = items[0];
            const materialName =
              firstItem.rawmaterialName || firstItem.name || 'Unknown Material';
            const unit = firstItem.unit || 'GRAM';
            const category = firstItem.category || 'Uncategorized';

            // Calculate total available quantity
            const totalAvailable = items.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0,
            );

            // If there's only one occurrence, show it as a regular row
            if (items.length === 1) {
              const item = items[0];

              initialLineItems.push({
                id: `${materialId}-single`,
                rawmaterialId: materialId,
                name: materialName,
                unit: unit,
                quantity: 0, // Start with 0, user will input
                category: category,
                categoryId: firstItem.categoryId,
                subEvent: firstItem.subeventName || firstItem.subEvent,
                subEventId: firstItem.subeventId || firstItem.subEventId,
                particular: '',
                packageType: 'LOOSE',
                date: '',
                time: '',
                location: '',
                vendorId: undefined,
                vendorName: '',
                price: lastPriceMap.get(materialId) || 0,
                isBreakdown: false,
                parentId: undefined,
                breakdownQuantity: totalAvailable, // Set available quantity from API
                submitMainRow: true,
                rmListId: listId,
                totalAmount: 0,
              });
            } else {
              // Multiple occurrences - create breakdown structure
              // Create main row with quantity 0
              const mainRowId = `${materialId}-main`;
              initialLineItems.push({
                id: mainRowId,
                rawmaterialId: materialId,
                name: materialName,
                unit: unit,
                quantity: 0, // Start with 0, user will input
                category: category,
                categoryId: firstItem.categoryId,
                subEvent: firstItem.subeventName || firstItem.subEvent,
                subEventId: firstItem.subeventId || firstItem.subEventId,
                particular: '',
                packageType: 'LOOSE',
                date: '',
                time: '',
                location: '',
                vendorId: undefined,
                vendorName: '',
                price: lastPriceMap.get(materialId) || 0,
                isBreakdown: false,
                parentId: undefined,
                breakdownQuantity: totalAvailable, // Set total available from API
                submitMainRow: true,
                rmListId: listId,
                totalAmount: 0,
              });

              // Create breakdown rows for each occurrence
              items.forEach((item, index) => {
                const quantity = item.quantity || 0;
                initialLineItems.push({
                  id: `breakdown-${materialId}-${index}`,
                  rawmaterialId: materialId,
                  name: materialName,
                  unit: unit,
                  quantity: 0, // Start with 0, user will input
                  category: category,
                  categoryId: item.categoryId || firstItem.categoryId,
                  subEvent: item.subeventName || item.subEvent,
                  subEventId: item.subeventId || item.subEventId,
                  particular: '',
                  packageType: 'LOOSE',
                  date: '',
                  time: '',
                  location: '',
                  vendorId: undefined,
                  vendorName: '',
                  price: lastPriceMap.get(materialId) || 0,
                  isBreakdown: true,
                  parentId: mainRowId,
                  breakdownQuantity: quantity, // Set available quantity for this breakdown
                  rmListId: listId,
                  totalAmount: 0,
                });
              });

              // Expand the main row if there are multiple breakdowns
              if (items.length > 1) {
                initialExpandedBreakdowns[mainRowId] = true;
              }
            }
          });
        }

        console.log('Initial line items:', initialLineItems);
        setLineItems(initialLineItems);
        setExpandedBreakdowns(initialExpandedBreakdowns);
        setExpandedCategories(initialExpandedCategories);
      } else if (listId && !isMaterialsLoading && !externalData) {
        setLineItems([]);
      }
    } catch (error) {
      console.error('Error processing external data:', error);
      toast.error('Error loading materials data');
      setLineItems([]);
    }
  }, [
    externalData,
    listId,
    isMaterialsLoading,
    extractLastPrices,
    isPartial,
    isPending,
    getexternalpodata,
    calculateTotalQuantitiesFromRawMaterials,
  ]);

  const toggleCategoryRO = (category: string) => {
    setExpandedCategoriesRO((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getVendorOptions = useCallback(
    (category: string, categoryId?: string, savedVendorId?: string) => {
      if (!vendors || vendors.length === 0) {
        return [{id: '', label: 'No vendors available'}];
      }

      const options: Array<{id: string; label: string}> = [];

      // For PENDING status (no saved data yet), show all vendors that match the category
      if (isPending && !savedVendorId) {
        const filteredVendors = vendors.filter((vendor) => {
          // If vendor has roles, check if any role matches the category
          if (
            vendor.rawMaterialVendorRoles &&
            vendor.rawMaterialVendorRoles.length > 0
          ) {
            return vendor.rawMaterialVendorRoles.some(
              (role) =>
                role.category?.name === category ||
                (categoryId && role.categoryId === categoryId),
            );
          }
          // If no roles defined, include vendor
          return true;
        });

        filteredVendors.forEach((vendor) => {
          options.push({
            id: vendor.id,
            label: vendor.name,
          });
        });
      }
      // For PARTIAL status (has saved data) or when editing
      else {
        // First, add all vendors that match the category
        const filteredVendors = vendors.filter((vendor) => {
          if (
            vendor.rawMaterialVendorRoles &&
            vendor.rawMaterialVendorRoles.length > 0
          ) {
            return vendor.rawMaterialVendorRoles.some(
              (role) =>
                role.category?.name === category ||
                (categoryId && role.categoryId === categoryId),
            );
          }
          return true;
        });

        filteredVendors.forEach((vendor) => {
          options.push({
            id: vendor.id,
            label: vendor.name,
          });
        });

        // If saved vendor is not in filtered list, add it anyway
        if (savedVendorId) {
          const savedVendor = vendors.find((v) => v.id === savedVendorId);
          if (savedVendor && !options.some((opt) => opt.id === savedVendorId)) {
            options.push({
              id: savedVendor.id,
              label: savedVendor.name,
            });
          }
        }
      }

      // Remove duplicates (in case saved vendor was already in filtered list)
      const uniqueOptions = options.filter(
        (option, index, self) =>
          index === self.findIndex((o) => o.id === option.id),
      );

      return uniqueOptions;
    },
    [vendors, isPending],
  );

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

            if (updates.vendorId !== undefined) {
              // When vendorId changes, update vendorName
              const selectedVendor = vendors.find(
                (v) => v.id === updates.vendorId,
              );
              updatedItem.vendorName = selectedVendor?.name || '';

              // Also update breakdown items if they exist
              const breakdownItems = prev.filter(
                (item) => item.parentId === lineId,
              );
              breakdownItems.forEach((breakdown) => {
                updateLineItem(breakdown.id, {vendorId: updates.vendorId});
              });
            }

            if (updates.price !== undefined) {
              updatedItem.price =
                updates.price === '' ? undefined : Number(updates.price);
            }

            if (updates.quantity !== undefined) {
              const quantity = updates.quantity;
              // Validate quantity against available quantity
              const quantityError = validateQuantity(
                quantity,
                li.breakdownQuantity || 0,
              );
              if (quantityError) {
                updatedItem.error = quantityError;
              } else {
                updatedItem.error = undefined;
              }

              const price =
                updatedItem.price !== undefined ? updatedItem.price : li.price;
              updatedItem.totalAmount = (price || 0) * (quantity || 0);
            } else if (updates.price !== undefined) {
              const quantity = li.quantity;
              const price =
                updatedItem.price !== undefined ? updatedItem.price : li.price;
              updatedItem.totalAmount = (price || 0) * (quantity || 0);
            }

            return updatedItem;
          }
          return li;
        }),
      );
    },
    [vendors, validateQuantity],
  );

  const applyCategoryConfig = useCallback(
    (category: string) => {
      const config = categoryConfigs[category];
      if (!config) return;

      setLineItems((prev) =>
        prev.map((item) => {
          if (item.category === category && !item.isBreakdown) {
            const selectedVendor = vendors.find(
              (v) => v.id === config.vendorId,
            );
            return {
              ...item,
              date: config.date,
              time: config.time,
              location: config.location,
              vendorId: config.vendorId,
              vendorName: selectedVendor?.name || '',
            };
          }

          if (item.isBreakdown && item.parentId) {
            const parentItem = prev.find(
              (parent) => parent.id === item.parentId,
            );
            if (parentItem && parentItem.category === category) {
              const selectedVendor = vendors.find(
                (v) => v.id === config.vendorId,
              );
              return {
                ...item,
                date: config.date,
                time: config.time,
                location: config.location,
                vendorId: config.vendorId,
                vendorName: selectedVendor?.name || '',
              };
            }
          }

          return item;
        }),
      );
    },
    [categoryConfigs, vendors],
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
        particular: parentItem.particular || '',
        packageType: parentItem.packageType || 'LOOSE',
        date: parentItem.date || '',
        time: formattedTime,
        location: parentItem.location || '',
        vendorId: parentItem.vendorId,
        vendorName: parentItem.vendorName,
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

  const removeBreakdownRow = useCallback((breakdownId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== breakdownId));
  }, []);

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

    const mainItems = lineItems.filter((item) => !item.isBreakdown);

    const sortedMainItems = [...mainItems].sort((a, b) => {
      const categoryCompare = a.category.localeCompare(b.category, 'hi', {
        sensitivity: 'base',
      });
      if (categoryCompare !== 0) return categoryCompare;
      return a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'});
    });

    sortedMainItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
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
    if (isDraft) {
      setIsSavingDraft(true);
    }

    if (lineItems.length === 0) {
      toast.error('No data to submit');
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    // Check for quantity validation errors
    const hasQuantityErrors = lineItems.some(
      (item) =>
        item.error && item.error.includes('cannot exceed available quantity'),
    );
    if (hasQuantityErrors) {
      toast.error('Please fix quantity errors before submitting');
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    if (!isDraft) {
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
          'Please fill all required fields (Date, Time, Location, Vendor, Price) before generating PO',
        );
        if (isDraft) setIsSavingDraft(false);
        return;
      }
    }

    const itemsToSubmit: LineItem[] = lineItems.filter((item) => {
      if (isDraft) {
        return true;
      } else {
        return item.quantity > 0;
      }
    });

    if (!isDraft && itemsToSubmit.length === 0) {
      toast.error('No items with quantity > 0 to generate PO');
      if (isDraft) setIsSavingDraft(false);
      return;
    }

    const orderData = {
      RMListId: listId,
      status: isDraft ? 'PARTIAL' : 'COMPLETED',
      materials: itemsToSubmit.map((item) => {
        let vendorName = item.vendorName || '';
        if (!vendorName && item.vendorId) {
          const vendor = vendors.find((v) => v.id === item.vendorId);
          vendorName = vendor?.name || '';
        }

        const priceValue = item.price !== undefined ? Number(item.price) : 0;

        return {
          materialId: item.rawmaterialId,
          materialName: item.name,
          vendorId: item.vendorId || '',
          vendorName: vendorName,
          unit: item.unit,
          quantity: item.quantity,
          particular: item.particular || '', // Optional field
          packageType: item.packageType || 'LOOSE', // Optional field
          category: item.category,
          subeventId: item.subEventId || '',
          subeventName: item.subEvent || '',
          date: item.date
            ? formatTimeForAPI(item.date)
            : new Date().toISOString(),
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

          setTimeout(() => {
            setLineItems((prev) =>
              prev.map((item) => {
                const wasSubmitted = itemsToSubmit.some(
                  (submittedItem) => submittedItem.id === item.id,
                );

                if (wasSubmitted && item.quantity > 0) {
                  return {
                    ...item,
                    quantity: 0,
                    date: '',
                    time: '',
                    location: '',
                    vendorId: undefined,
                    vendorName: undefined,
                    price: 0,
                    totalAmount: 0,
                  };
                }
                return item;
              }),
            );
          }, 1000);
        }

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

  // Build completed view data with same structure as editable view
  const completedGroupedItems = useMemo(() => {
    if (!getexternalpodata?.data?.PurchaseMaterial || !isCompleted) {
      return {};
    }

    const grouped: {[category: string]: LineItem[]} = {};

    getexternalpodata.data.PurchaseMaterial.forEach(
      (category: PurchaseMaterialCategory) => {
        const categoryName = category.name;

        category.materials.forEach((material: MaterialData) => {
          const materialId = material.materialId;
          const materialName = material.name;
          const unit = material.unit || 'GRAM';

          if (material.purchase && Array.isArray(material.purchase)) {
            // If there's only one purchase item
            if (material.purchase.length === 1) {
              const purchase = material.purchase[0];

              if (!grouped[categoryName]) {
                grouped[categoryName] = [];
              }

              grouped[categoryName].push({
                id: purchase.id || `single-${materialId}`,
                rawmaterialId: materialId,
                name: materialName,
                unit: unit,
                quantity: purchase.quantity || 0,
                category: categoryName,
                particular: purchase.particular || '',
                packageType: purchase.packageType || 'LOOSE',
                date: purchase.date || '',
                time: purchase.time || '',
                location: purchase.venue || '',
                vendorId: purchase.vendorId,
                vendorName: purchase.vendorName || '',
                price: purchase.price || 0,
                isBreakdown: false,
                breakdownQuantity: purchase.quantity || 0,
                totalAmount: (purchase.price || 0) * (purchase.quantity || 0),
              });
            } else {
              // Multiple purchase items - create main row
              let totalQuantity = 0;
              material.purchase.forEach((purchase) => {
                totalQuantity += purchase.quantity || 0;
              });

              if (!grouped[categoryName]) {
                grouped[categoryName] = [];
              }

              const mainRowId = `${materialId}-main`;
              grouped[categoryName].push({
                id: mainRowId,
                rawmaterialId: materialId,
                name: materialName,
                unit: unit,
                quantity: totalQuantity,
                category: categoryName,
                particular: '',
                packageType: 'LOOSE',
                date: '',
                time: '',
                location: '',
                vendorId: undefined,
                vendorName: '',
                price: 0, // Main row doesn't have price
                isBreakdown: false,
                breakdownQuantity: totalQuantity,
                totalAmount: material.purchase.reduce(
                  (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
                  0,
                ),
              });
            }
          }
        });
      },
    );

    // Sort categories and items within each category
    const sortedGrouped: {[category: string]: LineItem[]} = {};
    Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, 'hi', {sensitivity: 'base'}))
      .forEach((category) => {
        sortedGrouped[category] = grouped[category].sort((a, b) =>
          a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'}),
        );
      });

    return sortedGrouped;
  }, [getexternalpodata, isCompleted]);

  // Get breakdown items for completed view
  const getCompletedBreakdownItems = useCallback(
    (materialId: string, category: string) => {
      if (!getexternalpodata?.data?.PurchaseMaterial) return [];

      const breakdownItems: LineItem[] = [];

      getexternalpodata.data.PurchaseMaterial.forEach(
        (cat: PurchaseMaterialCategory) => {
          if (cat.name === category) {
            cat.materials.forEach((material: MaterialData) => {
              if (
                material.materialId === materialId &&
                material.purchase &&
                Array.isArray(material.purchase) &&
                material.purchase.length > 1
              ) {
                material.purchase.forEach(
                  (purchase: PurchaseItem, index: number) => {
                    breakdownItems.push({
                      id: purchase.id || `breakdown-${materialId}-${index}`,
                      rawmaterialId: materialId,
                      name: material.name,
                      unit: material.unit || 'GRAM',
                      quantity: purchase.quantity || 0,
                      category: category,
                      particular: purchase.particular || '',
                      packageType: purchase.packageType || 'LOOSE',
                      date: purchase.date || '',
                      time: purchase.time || '',
                      location: purchase.venue || '',
                      vendorId: purchase.vendorId,
                      vendorName: purchase.vendorName || '',
                      price: purchase.price || 0,
                      isBreakdown: true,
                      parentId: `${materialId}-main`,
                      breakdownQuantity: purchase.quantity || 0,
                      totalAmount:
                        (purchase.price || 0) * (purchase.quantity || 0),
                    });
                  },
                );
              }
            });
          }
        },
      );

      return breakdownItems;
    },
    [getexternalpodata],
  );

  const totalAmount = useMemo(() => {
    if (!getexternalpodata?.data?.PurchaseMaterial) return 0;

    let total = 0;
    getexternalpodata.data.PurchaseMaterial.forEach(
      (category: PurchaseMaterialCategory) => {
        category.materials.forEach((material: MaterialData) => {
          if (material.purchase && Array.isArray(material.purchase)) {
            material.purchase.forEach((purchase: PurchaseItem) => {
              total += (purchase.price || 0) * (purchase.quantity || 0);
            });
          }
        });
      },
    );

    return total;
  }, [getexternalpodata]);

  // Group completed purchase data by Category -> Material with header and breakdown items for print view
  const groupedPurchaseDataByMaterial = useMemo(() => {
    const result: {
      [category: string]: {
        [materialId: string]: {
          header: any;
          items: any[];
        };
      };
    } = {};

    if (!getexternalpodata?.data?.PurchaseMaterial || !isCompleted) {
      return result;
    }

    getexternalpodata.data.PurchaseMaterial.forEach(
      (category: PurchaseMaterialCategory) => {
        const categoryName = category.name;
        if (!result[categoryName]) result[categoryName] = {};

        category.materials.forEach((material: MaterialData) => {
          const materialId = material.materialId;
          const unit = material.unit || 'GRAM';

          const purchases = Array.isArray(material.purchase)
            ? material.purchase
            : [];

          const totalAvailable = purchases.reduce(
            (sum, p) => sum + (p.quantity || 0),
            0,
          );
          const totalMaterialAmount = purchases.reduce(
            (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
            0,
          );

          const header = {
            id: `${materialId}-main`,
            materialId: materialId,
            name: material.name,
            unit: unit,
            category: categoryName,
            quantity: totalAvailable,
            particular: '',
            packageType: 'LOOSE',
            date: '',
            time: '',
            location: '',
            vendorId: '',
            vendorName: '',
            price: 0,
            totalAmount: totalMaterialAmount,
            isMaterialHeader: true,
            totalAvailable,
          };

          const items = purchases.map(
            (purchase: PurchaseItem, index: number) => ({
              id: purchase.id || `breakdown-${materialId}-${index}`,
              name: material.name,
              quantity: purchase.quantity || 0,
              unit: unit,
              category: categoryName,
              particular: purchase.particular || '',
              packageType: purchase.packageType || 'LOOSE',
              date: purchase.date || '',
              time: purchase.time || '',
              location: purchase.venue || '',
              vendorId: purchase.vendorId,
              vendorName: purchase.vendorName || '',
              price: purchase.price || 0,
              totalAmount: (purchase.price || 0) * (purchase.quantity || 0),
              isBreakdown: true,
              parentId: `${materialId}-main`,
              materialId: materialId,
            }),
          );

          result[categoryName][materialId] = {header, items};
        });
      },
    );

    return result;
  }, [getexternalpodata, isCompleted]);

  const generatePrintContent = useCallback(() => {
    if (!getexternalpodata?.data?.PurchaseMaterial || !isCompleted) {
      return '';
    }

    const categories = Object.keys(groupedPurchaseDataByMaterial).map(
      (category) => ({
        name: category,
        materials: Object.keys(groupedPurchaseDataByMaterial[category]).map(
          (materialId) => ({
            header: groupedPurchaseDataByMaterial[category][materialId].header,
            items: groupedPurchaseDataByMaterial[category][materialId].items,
          }),
        ),
      }),
    );

    const htmlContent = generatePDFHTML(
      categories,
      totalAmount,
      getexternalpodata?.data?.listNo,
      getexternalpodata?.data?.createdAt,
      caterorInfo,
    );

    return htmlContent;
  }, [
    getexternalpodata,
    isCompleted,
    groupedPurchaseDataByMaterial,
    totalAmount,
    caterorInfo,
  ]);

  const handlePrintPreviewClick = () => {
    try {
      if (!getexternalpodata?.data?.PurchaseMaterial || !isCompleted) return;

      const categories = Object.keys(groupedPurchaseDataByMaterial).map(
        (category) => ({
          name: category,
          materials: Object.keys(groupedPurchaseDataByMaterial[category]).map(
            (materialId) => ({
              header:
                groupedPurchaseDataByMaterial[category][materialId].header,
              items: groupedPurchaseDataByMaterial[category][materialId].items,
            }),
          ),
        }),
      );

      const htmlContent = generatePDFHTML(
        categories,
        totalAmount,
        getexternalpodata?.data?.listNo,
        getexternalpodata?.data?.createdAt,
        caterorInfo,
      );

      // Open print preview in a new window (exactly like utensil report)
      const printWindow = window.open(
        '',
        'printWindow',
        'width=1000,height=800,scrollbars=yes',
      );

      if (!printWindow) {
        alert('Please allow popups for this site to generate PDF');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err) {
      console.error('Failed to generate PDF', err);
      toast.error(
        'An error occurred while generating the PDF. See console for details.',
      );
    }
  };

  // Loading state
  if (isExternalLoading || isMaterialsLoading || isLoadingVendors) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-3">Loading purchase order data...</p>
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

  // READ-ONLY VIEW FOR COMPLETED STATUS - Using same table structure as editable
  if (isCompleted) {
    return (
      <div>
        <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                External Purchase Order
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-blue-100">
                  List No: {getexternalpodata?.data?.listNo || 'N/A'}
                </span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  COMPLETED
                </span>
                <span className="flex items-center gap-1 text-sm text-blue-100">
                  <FiCheckCircle className="h-4 w-4" />
                  Read-Only View
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintPreviewClick}
                className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
              >
                <FiPrinter className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
            <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
              <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                Purchase Order Details (Completed)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This purchase order has been completed and is now in read-only
                mode.
              </p>
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
                      Available Qty
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold"
                    >
                      Order Qty
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
                      Price (₹)
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold"
                    >
                      Total Amt (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                  {Object.keys(completedGroupedItems).length > 0 ? (
                    Object.keys(completedGroupedItems).map(
                      (category, categoryIndex) => (
                        <React.Fragment key={category}>
                          <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                            <td colSpan={11} className="px-4 py-3">
                              <div
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => toggleCategoryRO(category)}
                              >
                                {expandedCategoriesRO[category] ? (
                                  <FiChevronDown className="h-4 w-4" />
                                ) : (
                                  <FiChevronRight className="h-4 w-4" />
                                )}
                                <span className="text-gray-800 font-semibold dark:text-white">
                                  {category}
                                </span>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  ({completedGroupedItems[category].length}{' '}
                                  items)
                                </span>
                              </div>
                            </td>
                          </tr>
                          {expandedCategoriesRO[category] &&
                            completedGroupedItems[category].map(
                              (item, itemIndex) => {
                                const breakdownItems =
                                  getCompletedBreakdownItems(
                                    item.rawmaterialId,
                                    item.category,
                                  );
                                const hasBreakdowns = breakdownItems.length > 0;
                                const mainRowBg =
                                  itemIndex % 2 === 0
                                    ? 'bg-white'
                                    : 'bg-gray-50/30';

                                return (
                                  <React.Fragment key={item.id}>
                                    <tr
                                      className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${mainRowBg}`}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="text-gray-800 text-sm font-medium dark:text-white">
                                          {item.name}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium dark:bg-blue-900 dark:text-blue-100">
                                          {formatQuantityDisplay(
                                            item.breakdownQuantity || 0,
                                          )}{' '}
                                          {item.unit}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium dark:bg-blue-900 dark:text-blue-100">
                                          {formatQuantityDisplay(
                                            item.quantity || 0,
                                          )}{' '}
                                          {item.unit}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {item.particular || '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {item.packageType || '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {item.date
                                            ? formatDate(item.date)
                                            : '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {item.time
                                            ? formatTime(item.time)
                                            : '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {item.location || '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {item.vendorName || '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm font-medium dark:text-white">
                                          {item.price
                                            ? `₹${item.price.toFixed(2)}`
                                            : '-'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm font-medium dark:text-white">
                                          ₹
                                          {item.totalAmount?.toFixed(2) ||
                                            '0.00'}
                                        </span>
                                      </td>
                                    </tr>

                                    {hasBreakdowns &&
                                      breakdownItems.map(
                                        (breakdown, breakdownIndex) => {
                                          const breakdownBg =
                                            breakdownIndex % 2 === 0
                                              ? 'bg-white'
                                              : 'bg-gray-50/30';

                                          return (
                                            <tr
                                              key={breakdown.id}
                                              className={`hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-blue-300 ${breakdownBg}`}
                                            >
                                              <td className="px-4 py-3">
                                                <div className="text-gray-800 pl-4 text-sm font-medium dark:text-white">
                                                  {/* Breakdown rows show indented */}
                                                </div>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                                  {formatQuantityDisplay(
                                                    breakdown.breakdownQuantity ||
                                                      0,
                                                  )}{' '}
                                                  {breakdown.unit}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium dark:bg-blue-900 dark:text-blue-100">
                                                  {formatQuantityDisplay(
                                                    breakdown.quantity || 0,
                                                  )}{' '}
                                                  {breakdown.unit}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm dark:text-white">
                                                  {breakdown.particular || '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm dark:text-white">
                                                  {breakdown.packageType || '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm dark:text-white">
                                                  {breakdown.date
                                                    ? formatDate(breakdown.date)
                                                    : '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm dark:text-white">
                                                  {breakdown.time
                                                    ? formatTime(breakdown.time)
                                                    : '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm dark:text-white">
                                                  {breakdown.location || '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm dark:text-white">
                                                  {breakdown.vendorName || '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-800 text-sm font-medium dark:text-white">
                                                  {breakdown.price
                                                    ? `₹${breakdown.price.toFixed(2)}`
                                                    : '-'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-sm font-medium">
                                                  ₹
                                                  {breakdown.totalAmount?.toFixed(
                                                    2,
                                                  ) || '0.00'}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        },
                                      )}
                                  </React.Fragment>
                                );
                              },
                            )}
                        </React.Fragment>
                      ),
                    )
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center">
                        <div className="py-8 text-center">
                          <FiFileText className="text-gray-400 mx-auto h-12 w-12" />
                          <p className="text-gray-500 dark:text-gray-400 mt-3">
                            No purchase data available.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                {Object.keys(completedGroupedItems).length > 0 && (
                  <tfoot className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Total Amount:
                      </td>
                      <td colSpan={2} className="px-4 py-3">
                        <span className="text-lg font-bold text-green-700 dark:text-green-300">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div className="border-t border-stroke px-4 py-3 dark:border-strokedark">
              <div className="flex items-center justify-between">
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  <p>
                    This purchase order has been finalized and cannot be edited.
                  </p>
                  <p className="mt-1">
                    Created on:{' '}
                    {formatDate(getexternalpodata?.data?.createdAt || '')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">
                    Status:{' '}
                    <span className="font-semibold text-green-600">
                      COMPLETED
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDITABLE VIEW FOR PARTIAL/PENDING STATUS
  return (
    <div>
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              External Purchase Order
            </h1>
            <div className="mt-2 flex items-center gap-4">
              <span className="text-sm text-blue-100">
                List No: {getexternalpodata?.data?.listNo || 'N/A'}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPartial
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isPartial ? 'PARTIAL' : 'PENDING'}
              </span>
              {isPartial && (
                <span className="flex items-center gap-1 text-sm text-blue-100">
                  Ready to Generate PO
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-white">
            <p className="text-sm">
              Created: {formatDate(getexternalpodata?.data?.createdAt || '')}
            </p>
            {getexternalpodata?.data?.updatedAt && (
              <p className="text-sm">
                Updated: {formatDate(getexternalpodata.data.updatedAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
          <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
            <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
              Raw Materials List
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {isPartial
                ? 'Saved data is pre-filled. You can edit and continue.'
                : 'Fill in the details to create a purchase order.'}
            </p>
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
                    Available Qty
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Order Qty
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
                    Price (₹)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Total Amt (₹)
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
                {Object.keys(groupedItems).length > 0 ? (
                  Object.keys(groupedItems).map((category, categoryIndex) => (
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
                          if (item.isBreakdown) return null;

                          const breakdownItems = getBreakdownItems(item.id);
                          const hasBreakdowns = breakdownItems.length > 0;

                          const isBreakdownExpanded =
                            expandedBreakdowns[item.id];
                          const totalAvailable = item.breakdownQuantity || 0;
                          const mainRowBg =
                            itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';

                          return (
                            <React.Fragment key={item.id}>
                              <tr
                                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${mainRowBg}`}
                              >
                                <td className="px-4 py-3">
                                  <div className="text-gray-800 text-sm font-medium dark:text-white">
                                    {item.name}
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium dark:bg-blue-900 dark:text-blue-100">
                                    {formatQuantityDisplay(totalAvailable)}{' '}
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
                                    placeholder="Enter particular (optional)"
                                  />
                                </td>

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
                                    <option value="">
                                      Select package type (optional)
                                    </option>
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
                                    {getVendorOptions(
                                      item.category,
                                      item.categoryId,
                                      item.vendorId,
                                    ).map((o) => (
                                      <option key={o.id} value={o.id}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </select>
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
                                </td>

                                <td className="px-4 py-3">
                                  <span className="text-gray-800 text-sm font-medium dark:text-white">
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
                                    const breakdownAvailable =
                                      breakdown.breakdownQuantity || 0;

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
                                        <td className="px-4 py-3">
                                          <div className="text-gray-800 pl-4 text-sm font-medium dark:text-white">
                                            {/* {breakdown.name} */}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                                            {formatQuantityDisplay(
                                              breakdownAvailable,
                                            )}{' '}
                                            {breakdown.unit}
                                          </span>
                                        </td>

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
                                            className={`border-gray-300 w-full rounded border px-2 py-1 text-sm ${
                                              breakdown.requiredErrors &&
                                              breakdown.requiredErrors.some(
                                                (err) =>
                                                  err.includes('Particular'),
                                              )
                                                ? 'border-red-300 bg-red-50'
                                                : ''
                                            }`}
                                            placeholder="Enter particular (optional)"
                                          />
                                        </td>

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
                                              Select package type (optional)
                                            </option>
                                            <option value="LOOSE">Loose</option>
                                            <option value="PACKET">
                                              Packet
                                            </option>
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
                                            {getVendorOptions(
                                              breakdown.category,
                                              breakdown.categoryId,
                                              breakdown.vendorId,
                                            ).map((o) => (
                                              <option key={o.id} value={o.id}>
                                                {o.label}
                                              </option>
                                            ))}
                                          </select>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center">
                      <div className="py-8 text-center">
                        <FiFileText className="text-gray-400 mx-auto h-12 w-12" />
                        <p className="text-gray-500 dark:text-gray-400 mt-3">
                          No materials found for this purchase order.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-4 p-4">
            {!isPartial && (
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
            )}
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
    </div>
  );
};

export default ExternalPoRMPage;
