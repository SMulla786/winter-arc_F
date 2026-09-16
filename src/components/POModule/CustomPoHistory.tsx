/* eslint-disable */
import React, {useMemo, useEffect, useState, useCallback} from 'react';
import {useGetCustomPo} from '@/lib/react-query/queriesAndMutations/cateror/PO/custompo';
import {useAuth} from './AuthProvider';
import {FiChevronDown, FiChevronRight} from 'react-icons/fi';

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
  vendorName?: string;
  price?: number;
  isBreakdown?: boolean;
  parentId?: string | null;
  breakdownQuantity?: number;
  totalAmount?: number;
  inventory?: number;
  orderQuantity?: number;
  inventoryQuantity?: number;
  submitMainRow?: boolean;
  rawmaterialId: string;
  particular?: string;
  packageType?: string;
}

type Props = {
  listId?: string;
  rawMaterialsData?: any[];
};

const formatQuantityDisplay = (quantity: number | undefined): string => {
  if (quantity === undefined || quantity === null) return '0';
  const num = parseFloat(quantity.toFixed(1));
  return num === 0 ? '0' : num.toString();
};

const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString || timeString.trim() === '') {
    return '-';
  }

  try {
    // Handle ISO string with date
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        // Extract just the time part (HH:MM)
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }

    // Handle simple time format (HH:MM)
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return timeString;
    }

    // Try parsing as date
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return timeString;
  } catch (error) {
    console.warn('Error parsing time:', timeString, error);
    return '-';
  }
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {
    return '-';
  }

  try {
    // Handle ISO string
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // Try parsing as date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return dateString;
  } catch (error) {
    console.warn('Error formatting date for display:', dateString, error);
    return '-';
  }
};

const CustomPoHistory: React.FC<Props> = ({listId, rawMaterialsData}) => {
  const {customRawMaterialData} = useAuth();
  const hasAuthContextData = !listId && customRawMaterialData;
  const effectiveListId = listId || customRawMaterialData?.id;

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  const {
    data: rawMaterialOrderData,
    isLoading: isLoadingRawMaterialOrder,
    isSuccess,
  } = useGetCustomPo(effectiveListId || '');

  const processApiData = useCallback((apiData: any): LineItem[] => {
    try {
      console.log('Processing API data:', apiData);

      let purchaseMaterials = null;

      // Comprehensive data extraction
      if (
        apiData?.data?.PurchaseMaterial &&
        Array.isArray(apiData.data.PurchaseMaterial)
      ) {
        purchaseMaterials = apiData.data.PurchaseMaterial;
      } else if (
        apiData?.PurchaseMaterial &&
        Array.isArray(apiData.PurchaseMaterial)
      ) {
        purchaseMaterials = apiData.PurchaseMaterial;
      } else if (
        apiData?.data?.data?.PurchaseMaterial &&
        Array.isArray(apiData.data.data.PurchaseMaterial)
      ) {
        purchaseMaterials = apiData.data.data.PurchaseMaterial;
      } else if (Array.isArray(apiData) && apiData[0]?.materials) {
        purchaseMaterials = apiData;
      } else if (
        apiData?.statusCode === 200 &&
        apiData?.data?.PurchaseMaterial
      ) {
        purchaseMaterials = apiData.data.PurchaseMaterial;
      } else if (apiData?.data && Array.isArray(apiData.data)) {
        purchaseMaterials = apiData.data;
      }

      if (!purchaseMaterials || !Array.isArray(purchaseMaterials)) {
        console.warn('No PurchaseMaterial data found');
        return [];
      }

      const lineItems: LineItem[] = [];

      purchaseMaterials.forEach((categoryGroup: any) => {
        const categoryName = categoryGroup.name || 'Uncategorized';

        if (categoryGroup.materials && Array.isArray(categoryGroup.materials)) {
          categoryGroup.materials.forEach((material: any) => {
            if (material.purchase && Array.isArray(material.purchase)) {
              material.purchase.forEach((purchase: any) => {
                // Keep the original ISO strings - they will be formatted in render
                const lineItem: LineItem = {
                  id: purchase.id || `purchase-${Date.now()}-${Math.random()}`,
                  rawmaterialId: material.materialId || material.id || '',
                  name: material.name || 'Unknown Material',
                  unit: material.unit || 'GRAM',
                  category: categoryName,
                  subEvent: 'Custom Purchase Order',
                  subEventId: 'custom-po',
                  quantity: purchase.quantity || material.quantity || 0,
                  date: purchase.date || material.date || '',
                  time: purchase.time || material.time || '',
                  location:
                    purchase.location ||
                    purchase.venue ||
                    material.location ||
                    material.venue ||
                    '',
                  vendorId: purchase.vendorId || material.vendorId,
                  vendorName: purchase.vendorName || material.vendorName || '',
                  price: purchase.price || material.price || 0,
                  particular: purchase.particular || material.particular || '',
                  packageType:
                    purchase.packageType || material.packageType || '',
                  isBreakdown: false,
                  breakdownQuantity:
                    purchase.quantity || material.quantity || 0,
                  orderQuantity: purchase.quantity || material.quantity || 0,
                  submitMainRow: true,
                  totalAmount:
                    (purchase.price || material.price || 0) *
                    (purchase.quantity || material.quantity || 0),
                };

                lineItems.push(lineItem);
              });
            } else {
              const lineItem: LineItem = {
                id: material.id || `material-${Date.now()}-${Math.random()}`,
                rawmaterialId: material.materialId || material.id || '',
                name: material.name || 'Unknown Material',
                unit: material.unit || 'GRAM',
                category: categoryName,
                subEvent: 'Custom Purchase Order',
                subEventId: 'custom-po',
                quantity: material.quantity || 0,
                date: material.date || '',
                time: material.time || '',
                location: material.location || material.venue || '',
                vendorId: material.vendorId,
                vendorName: material.vendorName || '',
                price: material.price || 0,
                particular: material.particular || '',
                packageType: material.packageType || '',
                isBreakdown: false,
                breakdownQuantity: material.quantity || 0,
                orderQuantity: material.quantity || 0,
                submitMainRow: true,
                totalAmount: (material.price || 0) * (material.quantity || 0),
              };

              lineItems.push(lineItem);
            }
          });
        }
      });

      return lineItems;
    } catch (error) {
      console.error('Error processing API data:', error);
      return [];
    }
  }, []);

  const transformAuthContextData = useCallback((data: any): LineItem[] => {
    if (!data?.sendToVendors || !Array.isArray(data.sendToVendors)) {
      return [];
    }

    const lineItems: LineItem[] = [];

    data.sendToVendors.forEach((item: any, index: number) => {
      const categoryName = item.rawmaterial?.category?.name || 'Uncategorized';
      const actualQuantity = item.quantity || 0;

      const lineItem: LineItem = {
        id: `${item.materialId}-${index}-${Date.now()}`,
        rawmaterialId: item.materialId || '',
        name: item.rawmaterial?.name || item.name || 'Unknown Material',
        unit: item.unit || item.rawmaterial?.unit || 'GRAM',
        category: categoryName,
        subEvent: 'Custom Raw Materials',
        subEventId: 'custom-raw-material',
        quantity: actualQuantity,
        date: item.date || '',
        time: item.time || '',
        location: item.location || item.venue || '',
        vendorId: item.vendorId,
        vendorName: item.vendorName || '',
        price: item.rawmaterial?.amount || item.price || 0,
        particular: item.particular || '',
        packageType: item.packageType || '',
        isBreakdown: false,
        breakdownQuantity: actualQuantity,
        orderQuantity: actualQuantity,
        submitMainRow: true,
        totalAmount:
          (item.rawmaterial?.amount || item.price || 0) * actualQuantity,
      };

      lineItems.push(lineItem);
    });

    return lineItems;
  }, []);

  const transformRawMaterialsData = useCallback((data: any[]): LineItem[] => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const lineItems: LineItem[] = [];

    data.forEach((item: any, index: number) => {
      const rawMaterial = item.rawmaterial || item;
      const rawMaterialId =
        rawMaterial?.id || item.materialId || `item-${index}`;
      const categoryName =
        rawMaterial?.category?.name || item.category?.name || 'Uncategorized';
      const materialName = rawMaterial?.name || item.name || 'Unknown Material';
      const unit = item.unit || rawMaterial?.unit || 'GRAM';
      const quantity = item.quantity || 0;
      const price = rawMaterial?.price || item.price || 0;

      const lineItem: LineItem = {
        id: `${rawMaterialId}-${index}-${Date.now()}`,
        rawmaterialId: rawMaterialId,
        name: materialName,
        unit: unit,
        category: categoryName,
        subEvent: 'Custom Raw Materials',
        subEventId: 'custom-raw-material',
        quantity: quantity,
        date: item.date || '',
        time: item.time || '',
        location: item.location || item.venue || '',
        vendorId: item.vendorId,
        vendorName: item.vendorName || '',
        price: price,
        particular: item.particular || '',
        packageType: item.packageType || '',
        isBreakdown: false,
        breakdownQuantity: quantity,
        orderQuantity: quantity,
        submitMainRow: true,
        totalAmount: price * quantity,
      };

      lineItems.push(lineItem);
    });

    return lineItems;
  }, []);

  // Main initialization effect
  useEffect(() => {
    const initializeLineItems = () => {
      try {
        let newLineItems: LineItem[] = [];

        if (
          rawMaterialsData &&
          Array.isArray(rawMaterialsData) &&
          rawMaterialsData.length > 0
        ) {
          newLineItems = transformRawMaterialsData(rawMaterialsData);
        } else if (hasAuthContextData && customRawMaterialData) {
          newLineItems = transformAuthContextData(customRawMaterialData);
        } else if (rawMaterialOrderData && !isLoadingRawMaterialOrder) {
          newLineItems = processApiData(rawMaterialOrderData);

          if (newLineItems.length === 0 && rawMaterialOrderData?.data) {
            newLineItems = processApiData({
              PurchaseMaterial: rawMaterialOrderData.data,
            });
          }
        }

        if (newLineItems.length > 0) {
          setLineItems(newLineItems);

          const categories = [
            ...new Set(newLineItems.map((item) => item.category)),
          ];
          const initialExpanded: {[key: string]: boolean} = {};
          categories.forEach((category) => {
            initialExpanded[category] = true;
          });
          setExpandedCategories(initialExpanded);
          setIsDataInitialized(true);
        } else if (!isLoadingRawMaterialOrder) {
          setLineItems([]);
        }
      } catch (error) {
        console.error('Error initializing line items:', error);
        setLineItems([]);
      }
    };

    initializeLineItems();
  }, [
    rawMaterialsData,
    rawMaterialOrderData,
    isLoadingRawMaterialOrder,
    customRawMaterialData,
    hasAuthContextData,
    transformAuthContextData,
    transformRawMaterialsData,
    processApiData,
  ]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const groupedItems = useMemo(() => {
    const grouped: {[category: string]: LineItem[]} = {};

    lineItems.forEach((item) => {
      if (!item.isBreakdown) {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      }
    });

    return grouped;
  }, [lineItems]);

  if (isLoadingRawMaterialOrder) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Loading data...
          </p>
        </div>
      </div>
    );
  }

  if (!effectiveListId && !hasAuthContextData && lineItems.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="rounded-md bg-yellow-50 p-6 dark:bg-yellow-900/30">
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
              No Data Available
            </h3>
            <p className="mt-2 text-yellow-700 dark:text-yellow-300">
              No purchase order data found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-3">
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
          <div className="bg-blue-50 px-4 py-3 dark:bg-meta-4">
            <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
              Purchase Order History (
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
                No purchase order data available.
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
                      Total Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Ordered Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Particular
                    </th>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-meta-4">
                  {Object.keys(groupedItems).map((category) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-2 font-bold text-black dark:bg-meta-4 dark:text-white">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
                              onClick={() => toggleCategory(category)}
                            >
                              {expandedCategories[category] ? (
                                <FiChevronDown className="text-gray-800 h-4 w-4 dark:text-white" />
                              ) : (
                                <FiChevronRight className="text-gray-800 h-4 w-4 dark:text-white" />
                              )}
                              <span className="text-gray-800 font-semibold dark:text-white">
                                {category} ({groupedItems[category].length}{' '}
                                items)
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {expandedCategories[category] &&
                        groupedItems[category].map((item, itemIndex) => {
                          const mainRowBg =
                            itemIndex % 2 === 0
                              ? 'bg-white dark:bg-meta-4'
                              : 'bg-gray-50/30 dark:bg-gray-800/50';

                          // Format date and time for display
                          const formattedDate = formatDateForDisplay(item.date);
                          const formattedTime = formatTimeForDisplay(item.time);

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${mainRowBg}`}
                            >
                              <td className="px-4 py-3">
                                <div className="text-gray-800 text-sm font-medium dark:text-white">
                                  {item.name || '-'}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                  {item.unit || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-800 rounded bg-blue-50 px-2 py-1 text-sm font-medium dark:bg-blue-900/30 dark:text-white">
                                  {formatQuantityDisplay(
                                    item.breakdownQuantity || item.quantity,
                                  )}{' '}
                                  {item.unit}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-800 text-sm font-medium dark:text-white">
                                  {formatQuantityDisplay(
                                    item.orderQuantity || item.quantity,
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {item.particular && item.particular !== ''
                                    ? item.particular
                                    : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {formattedDate}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {formattedTime}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {item.location && item.location !== ''
                                    ? item.location
                                    : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  {item.vendorName && item.vendorName !== ''
                                    ? item.vendorName
                                    : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-800 text-sm font-medium dark:text-white">
                                  {item.price !== undefined &&
                                  item.price !== null &&
                                  item.price > 0
                                    ? `₹${item.price.toFixed(2)}`
                                    : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-800 text-sm font-medium dark:text-white">
                                  {item.price !== undefined &&
                                  item.price !== null &&
                                  item.quantity !== undefined
                                    ? `₹${(item.price * item.quantity).toFixed(2)}`
                                    : '-'}
                                </span>
                              </td>
                            </tr>
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
      </div>
    </div>
  );
};

export default CustomPoHistory;
