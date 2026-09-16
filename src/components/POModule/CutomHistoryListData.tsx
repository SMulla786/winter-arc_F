/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiPackage,
  FiFileText,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiAlertCircle,
  FiShare,
} from 'react-icons/fi';
import {useGetRawMaterialCustom} from '@/lib/react-query/queriesAndMutations/cateror/PO/custompo';
import {useGetPostRawMaterialVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import toast from 'react-hot-toast';
import {useAuthContext} from '@/context/AuthContext';
import CustomPoHistory from './CustomPoHistory';

interface CustomHistoryDetailProps {
  historyId: string;
  onBack: () => void;
  activeTab: 'materials' | 'tenders' | 'purchases';
  onTabChange: (tab: 'materials' | 'tenders' | 'purchases') => void;
  hideTabs?: boolean;
}

interface HistoryDetail {
  id: string;
  listNo: number;
  from: string;
  to: string;
  createdAt: string;
  updatedAt: string;
  sendToVendors: any[];
  vendorRawMaterials: any[];
  purchases: any[];
}

interface VendorTenderItem {
  category: string;
  name: string;
  quantity: number;
  unit: string;
  prices: Map<string, {price: number; vendorName: string}>;
}

interface PurchaseOrderItem {
  id: string;
  purchaseOrderNo?: string;
  createdAt: string;
  vendorName: string;
  items: any[];
  totalAmount: number;
}

interface TenderVendor {
  id: string;
  name: string;
  phone: string;
  address: string;
  categories: {
    category: string;
    rawMaterials: {
      price: number;
      unit: string;
      quantity: number;
      name: string;
    }[];
  }[];
}

const CustomHistoryListData: React.FC<CustomHistoryDetailProps> = ({
  historyId,
  onBack,
  activeTab,
  onTabChange,
  hideTabs = false,
}) => {
  const {user} = useAuthContext();

  const {
    data: historyData,
    isLoading,
    refetch,
  } = useGetRawMaterialCustom(historyId);
  const {
    data: vendorTenderData,
    isLoading: loadingTenders,
    refetch: refetchTenders,
  } = useGetPostRawMaterialVendor(historyId || '');

  // State for UI expansions
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedTenderCategories, setExpandedTenderCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedPurchaseOrders, setExpandedPurchaseOrders] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [purchaseViewMode, setPurchaseViewMode] = useState<
    'existing' | 'create'
  >('existing');

  // Refetch data when tab changes to ensure fresh data
  useEffect(() => {
    if (activeTab === 'tenders') {
      refetchTenders();
    }
    if (activeTab === 'purchases') {
      refetch();
    }
  }, [activeTab, refetch, refetchTenders]);

  const historyDetail: HistoryDetail | null = useMemo(() => {
    if (!historyData) return null;

    let rawData = historyData;

    // Handle different response structures
    if (historyData.data) {
      rawData = historyData.data;
    } else if (historyData.response?.data) {
      rawData = historyData.response.data;
    }

    // Try to get purchases from different possible locations
    let purchases = [];
    if (rawData?.purchases && Array.isArray(rawData.purchases)) {
      purchases = rawData.purchases;
    } else if (
      rawData?.PurchaseMaterial &&
      Array.isArray(rawData.PurchaseMaterial)
    ) {
      purchases = rawData.PurchaseMaterial;
    } else if (
      rawData?.data?.purchases &&
      Array.isArray(rawData.data.purchases)
    ) {
      purchases = rawData.data.purchases;
    }

    return {
      id: rawData?.id || historyId,
      listNo: rawData?.listNo || 0,
      from: rawData?.from || '',
      to: rawData?.to || '',
      createdAt: rawData?.createdAt || '',
      updatedAt: rawData?.updatedAt || '',
      sendToVendors: rawData?.sendToVendors || [],
      vendorRawMaterials: rawData?.vendorRawMaterials || [],
      purchases: purchases,
    };
  }, [historyData, historyId]);

  // Update purchase view mode when purchases data changes
  useEffect(() => {
    if (historyDetail?.purchases && historyDetail.purchases.length > 0) {
      setPurchaseViewMode('existing');
    } else {
      setPurchaseViewMode('create');
    }
  }, [historyDetail?.purchases]);

  // Generate vendor link for sharing
  const generateVendorLink = useCallback(() => {
    if (!user) return '';

    const baseUrl = `http://localhost:5173/customvendor_tender/${user?.fullname?.replace(/\s/g, '_')}/${historyDetail?.id}`;

    if (selectedCategoryIds.length > 0) {
      const url = new URL(baseUrl);
      url.searchParams.set('categories', selectedCategoryIds.join(','));
      return url.toString();
    }
    return baseUrl;
  }, [user, historyDetail?.id, selectedCategoryIds]);

  // Group materials by category
  const groupedMaterials = useMemo(() => {
    if (
      !historyDetail?.sendToVendors ||
      !Array.isArray(historyDetail.sendToVendors)
    ) {
      return {};
    }

    const grouped: {[category: string]: any[]} = {};

    historyDetail.sendToVendors.forEach((item: any) => {
      const categoryName = item.rawmaterial?.category?.name || 'Uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });

    return grouped;
  }, [historyDetail]);

  // Process tender data from vendor API
  const tenderData = useMemo(() => {
    const postRawMaterials = vendorTenderData?.data || vendorTenderData || [];

    if (
      !postRawMaterials ||
      !Array.isArray(postRawMaterials) ||
      postRawMaterials.length === 0
    ) {
      if (
        !historyDetail?.vendorRawMaterials ||
        !Array.isArray(historyDetail.vendorRawMaterials) ||
        historyDetail.vendorRawMaterials.length === 0
      ) {
        return {
          items: [],
          vendorList: [],
          categories: [],
          vendorTenders: [],
        };
      }

      const uniqueItems = new Map<string, VendorTenderItem>();
      const vendorMap = new Map<string, {id: string; name: string}>();
      const categoriesSet = new Set<string>();

      historyDetail.vendorRawMaterials.forEach((item: any) => {
        if (item.vendor) {
          vendorMap.set(item.vendor.id, {
            id: item.vendor.id,
            name: item.vendor.name || 'Unknown Vendor',
          });
        }
      });

      historyDetail.vendorRawMaterials.forEach((item: any) => {
        if (item.rawmaterial) {
          const categoryName =
            item.rawmaterial?.category?.name || 'Uncategorized';
          const materialName = item.rawmaterial.name || 'Unknown Material';
          const key = `${categoryName}-${materialName}`;

          categoriesSet.add(categoryName);

          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, {
              category: categoryName,
              name: materialName,
              quantity: item.quantity || 0,
              unit: item.unit || 'GRAM',
              prices: new Map(),
            });
          }

          const tenderItem = uniqueItems.get(key)!;
          if (item.vendor) {
            tenderItem.prices.set(item.vendor.id, {
              price: item.price || 0,
              vendorName: item.vendor.name || 'Unknown Vendor',
            });
          }
        }
      });

      const items = Array.from(uniqueItems.values());
      const vendorList = Array.from(vendorMap.values());
      const categories = Array.from(categoriesSet);

      return {items, vendorList, categories, vendorTenders: []};
    }

    const uniqueItems = new Map<string, VendorTenderItem>();
    const vendorList: TenderVendor[] = postRawMaterials;
    const categoriesSet = new Set<string>();

    vendorList.forEach((vendor) => {
      if (vendor.categories && Array.isArray(vendor.categories)) {
        vendor.categories.forEach((cat) => {
          if (cat && cat.category) {
            categoriesSet.add(cat.category);

            if (cat.rawMaterials && Array.isArray(cat.rawMaterials)) {
              cat.rawMaterials.forEach((rm) => {
                if (rm && rm.name) {
                  const key = `${cat.category}-${rm.name}`;

                  if (!uniqueItems.has(key)) {
                    uniqueItems.set(key, {
                      category: cat.category,
                      name: rm.name,
                      quantity: rm.quantity || 0,
                      unit: rm.unit || 'GRAM',
                      prices: new Map(),
                    });
                  }

                  const item = uniqueItems.get(key)!;
                  item.prices.set(vendor.id, {
                    price: rm.price || 0,
                    vendorName: vendor.name || 'Unknown Vendor',
                  });
                }
              });
            }
          }
        });
      }
    });

    const items: VendorTenderItem[] = Array.from(uniqueItems.values());
    const categories = Array.from(categoriesSet);

    return {items, vendorList, categories, vendorTenders: postRawMaterials};
  }, [vendorTenderData, historyDetail]);

  const purchaseOrders = useMemo(() => {
    if (
      !historyDetail?.purchases ||
      !Array.isArray(historyDetail.purchases) ||
      historyDetail.purchases.length === 0
    ) {
      return [];
    }

    const pos: PurchaseOrderItem[] = [];

    historyDetail.purchases.forEach((po: any) => {
      const items: any[] = [];

      // Handle different possible structures
      if (po.PurchaseMaterial && Array.isArray(po.PurchaseMaterial)) {
        po.PurchaseMaterial.forEach((group: any) => {
          if (group.materials && Array.isArray(group.materials)) {
            group.materials.forEach((mat: any) => {
              items.push({
                rawmaterial: {
                  name: mat.name || mat.rawmaterial?.name || 'Unknown Material',
                },
                quantity: mat.quantity || 0,
                unit: mat.unit || 'KG',
                price: mat.price || 0,
                date: mat.date,
                time: mat.time,
                location: mat.location || 'N/A',
                vendorName: mat.vendorName || group.vendorName || po.vendorName,
              });
            });
          }
        });
      } else if (po.materials && Array.isArray(po.materials)) {
        po.materials.forEach((mat: any) => {
          items.push({
            rawmaterial: {name: mat.name || 'Unknown Material'},
            quantity: mat.quantity || 0,
            unit: mat.unit || 'KG',
            price: mat.price || 0,
            date: mat.date,
            time: mat.time,
            location: mat.location || 'N/A',
            vendorName: po.vendorName,
          });
        });
      } else if (po.rawmaterial) {
        items.push({
          rawmaterial: {name: po.rawmaterial.name || 'Unknown Material'},
          quantity: po.quantity || 0,
          unit: po.unit || 'KG',
          price: po.price || 0,
          date: po.date,
          time: po.time,
          location: po.location || 'N/A',
          vendorName: po.vendorName,
        });
      }

      // Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0,
      );

      if (items.length > 0) {
        pos.push({
          id: po.id || `po-${Date.now()}`,
          purchaseOrderNo:
            po.purchaseOrderNo ||
            po.PONumber ||
            `PO-${(po.id || '').substring(0, 8)}`,
          createdAt: po.createdAt || po.date || new Date().toISOString(),
          vendorName: items[0]?.vendorName || po.vendorName || 'Unknown Vendor',
          items,
          totalAmount,
        });
      }
    });

    return pos;
  }, [historyDetail]);

  // Get category options for filtering
  const categoryOptions = useMemo(() => {
    const categories: Array<{id: string; name: string}> = [];
    const seen = new Set();

    if (
      historyDetail?.sendToVendors &&
      Array.isArray(historyDetail.sendToVendors)
    ) {
      historyDetail.sendToVendors.forEach((item: any) => {
        const categoryName =
          item.rawmaterial?.category?.name || 'Uncategorized';
        const categoryId = item.rawmaterial?.category?.id || categoryName;

        if (!seen.has(categoryId)) {
          seen.add(categoryId);
          categories.push({
            id: categoryId,
            name: categoryName,
          });
        }
      });
    }

    return categories;
  }, [historyDetail]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleTenderCategory = (category: string) => {
    setExpandedTenderCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const togglePurchaseOrder = (purchaseOrderId: string) => {
    setExpandedPurchaseOrders((prev) => ({
      ...prev,
      [purchaseOrderId]: !prev[purchaseOrderId],
    }));
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleShareTender = useCallback(() => {
    const registrationLink = generateVendorLink();

    if (!registrationLink) {
      toast.error('No link to share');
      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: 'Custom Raw Material Tender',
          text: 'Join us using this registration link.',
          url: registrationLink,
        })
        .catch((error) => {
          navigator.clipboard
            .writeText(registrationLink)
            .then(() => {
              toast.success('Link copied to clipboard');
            })
            .catch((err) => {
              toast.error('Failed to share link');
            });
        });
    } else {
      navigator.clipboard
        .writeText(registrationLink)
        .then(() => {
          toast.success('Link copied to clipboard');
        })
        .catch((err) => {
          toast.error('Failed to share link');
        });
    }
  }, [generateVendorLink]);

  // Initialize expanded categories when data loads
  useEffect(() => {
    if (activeTab === 'materials' && Object.keys(groupedMaterials).length > 0) {
      const initialExpanded: {[key: string]: boolean} = {};
      Object.keys(groupedMaterials).forEach((category) => {
        if (expandedCategories[category] === undefined) {
          initialExpanded[category] = true;
        }
      });

      if (Object.keys(initialExpanded).length > 0) {
        setExpandedCategories((prev) => ({
          ...prev,
          ...initialExpanded,
        }));
      }
    }
  }, [activeTab, groupedMaterials]);

  useEffect(() => {
    if (activeTab === 'tenders' && tenderData.categories.length > 0) {
      const initialExpanded: {[key: string]: boolean} = {};
      tenderData.categories.forEach((category) => {
        if (expandedTenderCategories[category] === undefined) {
          initialExpanded[category] = true;
        }
      });

      if (Object.keys(initialExpanded).length > 0) {
        setExpandedTenderCategories((prev) => ({
          ...prev,
          ...initialExpanded,
        }));
      }
    }
  }, [activeTab, tenderData.categories]);

  const renderMaterialsTab = () => {
    const categories = Object.keys(groupedMaterials);

    if (categories.length === 0) {
      return (
        <div className="py-12 text-center">
          <FiPackage className="text-gray-400 dark:text-gray-600 mx-auto mb-3 h-12 w-12" />
          <h3 className="text-gray-700 dark:text-gray-300 mb-2 text-lg font-medium">
            No Materials Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No raw materials have been added to this list.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                <tr>
                  <th className="w-1/4 px-4 py-3 text-left text-sm font-semibold">
                    Category & Material
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-meta-4">
                {categories.map((category) => {
                  const items = groupedMaterials[category];
                  const isExpanded = expandedCategories[category] !== false;

                  return (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-2 font-bold text-black dark:bg-meta-4 dark:text-white">
                        <td colSpan={3} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex cursor-pointer items-center gap-2"
                              onClick={() => toggleCategory(category)}
                            >
                              {isExpanded ? (
                                <FiChevronDown className="h-4 w-4" />
                              ) : (
                                <FiChevronRight className="h-4 w-4" />
                              )}
                              <span className="text-gray-800 dark:text-white">
                                {category}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300 text-sm">
                                ({items.length} items)
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {isExpanded &&
                        items.map((item: any) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-4 py-3">
                              <div className="text-gray-800 text-sm font-medium dark:text-white">
                                {item.rawmaterial?.name || 'Unknown Material'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-800 font-medium dark:text-white">
                                {item.quantity}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-600 dark:text-gray-400">
                                {item.unit}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTendersTab = () => {
    if (tenderData.categories.length === 0 && !loadingTenders) {
      return (
        <div className="py-12 text-center">
          <FiFileText className="text-gray-400 dark:text-gray-600 mx-auto mb-3 h-12 w-12" />
          <h3 className="text-gray-700 dark:text-gray-300 mb-2 text-lg font-medium">
            No Tender Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Share the tender link with vendors to get their rates.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-800 text-xl font-bold dark:text-white">
              Vendor Tender Comparison
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {selectedCategoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategoryIds.map((id) => {
                  const category = categoryOptions.find((c) => c.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {category?.name || 'Unknown Category'}
                      <button
                        onClick={() => toggleCategorySelection(id)}
                        className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FiMinus className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleShareTender}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-800 dark:from-blue-700 dark:to-indigo-800"
            >
              <FiShare className="h-4 w-4" />
              Share Tender Link
            </button>
          </div>
        </div>

        {loadingTenders && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600 ml-3">Loading vendor data...</span>
          </div>
        )}

        {!loadingTenders && tenderData.categories.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                  <tr>
                    <th className="sticky left-0 z-10 min-w-[160px] bg-blue-900 px-4 py-3 text-left text-sm font-semibold dark:bg-blue-950">
                      Raw Material
                    </th>
                    <th className="sticky left-[300px] z-10 min-w-[100px] bg-blue-900 px-4 py-3 text-left text-sm font-semibold dark:bg-blue-950">
                      Quantity
                    </th>
                    {tenderData.vendorList.map((vendor: any) => (
                      <th
                        key={vendor.id}
                        className="min-w-[120px] bg-blue-900 px-4 py-3 text-center text-sm font-semibold dark:bg-blue-950"
                      >
                        <div className="truncate text-xs">{vendor.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-meta-4">
                  {tenderData.categories.map((category) => {
                    const categoryItems = tenderData.items.filter(
                      (item) => item.category === category,
                    );
                    const isExpanded =
                      expandedTenderCategories[category] !== false;

                    return (
                      <React.Fragment key={category}>
                        <tr className="bg-gray-2 font-bold text-black dark:bg-meta-4 dark:text-white">
                          <td
                            colSpan={3 + tenderData.vendorList.length}
                            className="px-4 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => toggleTenderCategory(category)}
                              >
                                {isExpanded ? (
                                  <FiChevronDown className="h-4 w-4" />
                                ) : (
                                  <FiChevronRight className="h-4 w-4" />
                                )}
                                <span className="text-gray-800 dark:text-white">
                                  {category}
                                </span>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  ({categoryItems.length} items)
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {isExpanded &&
                          categoryItems.map((item, index) => {
                            const validPrices = Array.from(item.prices.values())
                              .map((p) => p.price)
                              .filter((p): p is number => p !== null && p > 0);

                            const minPrice =
                              validPrices.length > 0
                                ? Math.min(...validPrices)
                                : null;
                            const maxPrice =
                              validPrices.length > 0
                                ? Math.max(...validPrices)
                                : null;

                            return (
                              <tr
                                key={`${item.category}-${item.name}-${index}`}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="sticky left-0 z-10 bg-white px-4 py-3 dark:bg-meta-4">
                                  <div className="text-gray-800 text-sm font-medium dark:text-white">
                                    {item.name}
                                  </div>
                                </td>
                                <td className="sticky left-[300px] z-10 bg-white px-4 py-3 dark:bg-meta-4">
                                  <div className="text-gray-800 font-medium dark:text-white">
                                    {item.quantity}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                                    {item.unit}
                                  </div>
                                </td>
                                {tenderData.vendorList.map((vendor: any) => {
                                  const priceData = item.prices.get(vendor.id);
                                  const price = priceData?.price;
                                  const isBest = price === minPrice;
                                  const isWorst = price === maxPrice;

                                  return (
                                    <td
                                      key={vendor.id}
                                      className={`px-4 py-3 text-center ${
                                        isBest
                                          ? 'bg-green-50 font-medium dark:bg-green-900/20'
                                          : isWorst
                                            ? 'bg-red-50 dark:bg-red-900/20'
                                            : ''
                                      }`}
                                    >
                                      {price ? (
                                        <div className="flex flex-col">
                                          <span
                                            className={`font-medium ${isBest ? 'text-green-600 dark:text-green-400' : isWorst ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}
                                          >
                                            ₹{price.toLocaleString()}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 dark:text-gray-500">
                                          -
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loadingTenders && tenderData.categories.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-800 mb-3 text-lg font-semibold dark:text-white">
              Price Comparison Legend
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Lowest Price (Best)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Highest Price
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPurchasesTab = () => {
    return (
      <div className="space-y-6">
        <div className="mt-6">
          <CustomPoHistory
            listId={historyId}
            rawMaterialsData={historyDetail?.sendToVendors}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            Loading details...
          </div>
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!historyData || Object.keys(historyData).length === 0) {
    return (
      <div className="py-12 text-center">
        <FiAlertCircle className="text-gray-400 dark:text-gray-600 mx-auto mb-4 h-12 w-12" />
        <h2 className="text-gray-800 mb-2 text-xl font-bold dark:text-white">
          No Data Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Could not load the custom raw material list details.
        </p>
      </div>
    );
  }

  if (!historyDetail) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-gray-800 mb-4 text-2xl font-bold dark:text-white">
          List Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The custom raw material list you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 flex items-center gap-2 dark:hover:text-white"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to History
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-gray-200 dark:border-gray-700 mb-6 border-b">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'materials'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => onTabChange('materials')}
          >
            Raw Materials
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'tenders'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => onTabChange('tenders')}
          >
            Tenders
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'purchases'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => onTabChange('purchases')}
          >
            Purchase Orders
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === 'materials' && renderMaterialsTab()}
        {activeTab === 'tenders' && renderTendersTab()}
        {activeTab === 'purchases' && renderPurchasesTab()}
      </div>
    </>
  );
};

export default CustomHistoryListData;
