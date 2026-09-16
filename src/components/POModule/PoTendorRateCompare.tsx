/*eslint-disable*/
import {useGetPostRawMaterialVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import {useParams, useNavigate} from '@tanstack/react-router';
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  FaFilter,
  FaAngleDown,
  FaShare,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
} from 'react-icons/fa';
import {BiArrowBack} from 'react-icons/bi';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {useGetRawListHistoryById} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';
import {format} from 'date-fns';

interface Vendor {
  id: string;
  name: string;
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

interface UniqueItem {
  category: string;
  name: string;
  quantity: number;
  unit: string;
  prices: Map<string, {price: number; vendorName: string}>;
}

interface CategoryGroup {
  category: string;
  items: UniqueItem[];
  isExpanded: boolean;
}

type Props = {
  eventid: string;
};
interface CategoryOption {
  id: string;
  name: string;
}

const PoTendorRateCompare: React.FC<Props> = ({eventid}) => {
  const {user} = useAuthContext();
  const navigate = useNavigate();
  const {data: rawListData} = useGetRawListHistoryById(eventid);
  console.log('list id in compareee....', rawListData);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const {data: postRawMaterials, isLoading: loadingVendors} =
    useGetPostRawMaterialVendor(eventid);

  const {data: eventData, isLoading: loadingEvent} = useGetSubevent(eventid);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: true,
    lowPriceOnly: false,
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);

  const generateVendorLink = () => {
    const baseUrl = `http://localhost:5173/allexternalvendor/${user?.fullname.replace(/\s/g, '_')}/${eventid}`;
    // const baseUrl = `https://siddhraj.menubook.cc/allexternalvendor/${user?.fullname.replace(/\s/g, '_')}/${eventid}`;
    if (selectedCategoryIds && selectedCategoryIds.length > 0) {
      const url = new URL(baseUrl);
      url.searchParams.set('categories', selectedCategoryIds.join(','));
      return url.toString();
    }
    return `${baseUrl}`;
  };

  const registrationLink = generateVendorLink();

  useEffect(() => {
    if (rawListData?.data?.sendToVendors) {
      const categories = rawListData.data.sendToVendors.map((each: any) => ({
        id: each?.rawmaterial?.category?.id,
        name: each?.rawmaterial?.category?.name,
      }));

      const uniqueCategories = Array.from(
        new Map(categories.map((item) => [item.id, item])).values(),
      );

      setCategoryOptions(uniqueCategories);
    }
  }, [rawListData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterDropdownRef, filterButtonRef]);

  useEffect(() => {
    const handleCategoryClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleCategoryClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleCategoryClickOutside);
  }, []);

  const formatEventInfo = () => {
    if (!eventData?.data) return null;
    const {name, startDate, endDate, subEvents} = eventData.data;
    const subEvent = subEvents?.[0];
    if (!subEvent) return {name, address: '', time: ''};

    const date = new Date(subEvent.date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    const formatTime = (d: Date) =>
      d
        .toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        .replace(':00', '');

    return {
      name,
      address: subEvent.address || 'N/A',
      time: `${formatDate(date)}, ${formatTime(start)} – ${formatTime(end)}`,
    };
  };

  const eventInfo = formatEventInfo();
  const toggleCategorySelection = (categoryId: string) => {
    console.log('cattt id', categoryId);
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const clearAllCategories = () => {
    setSelectedCategoryIds([]);
  };
  const handleshare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Raw Material Order',
          text: 'Join us using this registration link.',
          url: registrationLink,
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          navigator.clipboard
            .writeText(registrationLink)
            .then(() => {
              toast.success('Link copied to clipboard');
            })
            .catch((err) => {
              console.error('Failed to copy:', err);
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
          console.error('Failed to copy:', err);
          const textArea = document.createElement('textarea');
          textArea.value = registrationLink;
          textArea.style.position = 'fixed';
          textArea.style.top = '0';
          textArea.style.left = '0';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              toast.success('Link copied to clipboard');
            } else {
              toast.error('Failed to copy link');
            }
          } catch (err) {
            toast.error('Failed to copy link');
          }
          document.body.removeChild(textArea);
        });
    }
  };

  const processedData = useMemo(() => {
    if (!postRawMaterials || postRawMaterials.length === 0)
      return {items: [], vendorList: [], categories: []};

    const uniqueItems = new Map<string, UniqueItem>();
    const vendorList: Vendor[] = postRawMaterials;
    const categoriesSet = new Set<string>();

    vendorList.forEach((vendor) => {
      vendor.categories.forEach((cat) => {
        categoriesSet.add(cat.category);
        cat.rawMaterials.forEach((rm) => {
          const key = `${cat.category}-${rm.name}`;
          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, {
              category: cat.category,
              name: rm.name,
              quantity: rm.quantity,
              unit: rm.unit,
              prices: new Map(),
            });
          }
          const item = uniqueItems.get(key)!;
          item.prices.set(vendor.id, {
            price: rm.price,
            vendorName: vendor.name,
          });
        });
      });
    });

    const items: UniqueItem[] = Array.from(uniqueItems.values());
    const categories = Array.from(categoriesSet);

    return {items, vendorList, categories};
  }, [postRawMaterials]);

  const {items, vendorList, categories} = processedData;

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (filters.lowPriceOnly) {
      filtered = filtered.filter((item) => {
        const prices = Array.from(item.prices.values()).map((p) => p.price);
        if (prices.length === 0) return false;

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const priceDifference = ((maxPrice - minPrice) / minPrice) * 100;
        return priceDifference >= 10;
      });
    }

    return filtered;
  }, [items, selectedCategory, filters.lowPriceOnly]);

  const categoryGroups = useMemo(() => {
    const groups: CategoryGroup[] = [];
    const groupedItems = new Map<string, UniqueItem[]>();

    // Group items by category
    filteredItems.forEach((item) => {
      if (!groupedItems.has(item.category)) {
        groupedItems.set(item.category, []);
      }
      groupedItems.get(item.category)!.push(item);
    });

    // Create category groups
    groupedItems.forEach((items, category) => {
      groups.push({
        category,
        items,
        isExpanded:
          expandedCategories.has(category) || selectedCategory === category,
      });
    });

    // Sort groups by category name
    return groups.sort((a, b) => a.category.localeCompare(b.category));
  }, [filteredItems, expandedCategories, selectedCategory]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleAllCategories = () => {
    if (expandedCategories.size === categoryGroups.length) {
      // Collapse all
      setExpandedCategories(new Set());
    } else {
      // Expand all
      setExpandedCategories(new Set(categoryGroups.map((g) => g.category)));
    }
  };

  const handleCancel = () => {
    navigate({to: '/events/$id', params: {id: eventid}});
  };

  const handleDownloadPDF = () => {
    // Create compact report layout
    const reportContainer = document.createElement('div');
    reportContainer.style.width = '1100px';
    reportContainer.style.maxWidth = '100%';
    reportContainer.style.margin = '0 auto';
    reportContainer.style.padding = '10px';
    reportContainer.style.background = 'white';
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.fontSize = '10px';
    reportContainer.style.color = 'black';
    reportContainer.style.boxSizing = 'border-box';

    // Title section
    const titleWrapper = document.createElement('div');
    titleWrapper.style.marginBottom = '10px';
    titleWrapper.style.textAlign = 'center';
    titleWrapper.style.padding = '4px 0';
    titleWrapper.innerHTML = `
    <h2 style="font-size: 18px; font-weight: bold; margin:0; color:#0D47A1; text-decoration: underline;">
      Raw Material Rate Comparison Report
    </h2>
    <div style="margin-top: 4px; color:black; font-size:9px;">
      <span style="margin: 0 6px;"><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
      <span style="margin: 0 6px;"><strong>Items:</strong> ${filteredItems.length} of ${items.length}</span>
      ${selectedCategory !== 'all' ? `<span style="margin: 0 6px;"><strong>Category:</strong> ${selectedCategory}</span>` : ''}
      ${filters.lowPriceOnly ? `<span style="margin: 0 6px;"><strong>Filter:</strong> Low Price Only</span>` : ''}
    </div>
  `;
    reportContainer.appendChild(titleWrapper);

    // Group items by category for PDF
    const itemsByCategory = new Map<string, UniqueItem[]>();

    filteredItems.forEach((item) => {
      if (!itemsByCategory.has(item.category)) {
        itemsByCategory.set(item.category, []);
      }
      itemsByCategory.get(item.category)!.push(item);
    });

    // Sort categories alphabetically
    const sortedCategories = Array.from(itemsByCategory.keys()).sort();

    // Create table for each category
    sortedCategories.forEach((category) => {
      const categoryItems = itemsByCategory.get(category)!;

      // Category header
      const categoryHeader = document.createElement('div');
      categoryHeader.style.cssText = `
      background: #1E3A8A;
      color: white;
      padding: 6px 10px;
      margin: 10px 0 5px 0;
      font-weight: bold;
      font-size: 12px;
      border-radius: 3px;
    `;
      categoryHeader.innerText = `${category} (${categoryItems.length} items)`;
      reportContainer.appendChild(categoryHeader);

      // Create table for this category
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '9px';
      table.style.marginBottom = '15px';

      // Table headers
      const headers = ['Raw Material', 'Quantity'];
      vendorList.forEach((v) => headers.push(v.name));

      const headerRow = table.insertRow();
      headers.forEach((text, i) => {
        const th = document.createElement('th');
        th.innerText = text.length > 12 ? text.substring(0, 12) + '...' : text;
        th.style.cssText = `
        border: 1px solid #ccc;
        padding: 5px 3px;
        background-color: ${i < 2 ? '#0D47A1' : '#1976D2'};
        color: white;
        text-align: ${i < 2 ? 'left' : 'center'};
        font-weight: bold;
        font-size: 9px;
        white-space: nowrap;
      `;
        headerRow.appendChild(th);
      });

      // Add rows for each item in this category
      categoryItems.forEach((item, idx) => {
        // Calculate min and max prices for this item across all vendors
        const prices = vendorList
          .map((v) => {
            const p = item.prices.get(v.id);
            return p && p.price !== 0 ? p.price : null;
          })
          .filter((p): p is number => p !== null);

        const minPrice = prices.length > 0 ? Math.min(...prices) : null;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

        const row = table.insertRow();
        row.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';

        // Raw Material Name
        const nameCell = row.insertCell();
        nameCell.innerText = item.name;
        nameCell.style.cssText =
          'border:1px solid #ddd; padding:4px 3px; text-align:left; font-size:9px';

        // Quantity
        const qtyCell = row.insertCell();
        qtyCell.innerHTML = `<strong>${item.quantity}</strong> <span style="color:#666; font-size:8px;">${item.unit.toUpperCase()}</span>`;
        qtyCell.style.cssText =
          'border:1px solid #ddd; padding:4px 3px; text-align:center; font-size:9px';

        // Vendor Prices with highlighting
        vendorList.forEach((vendor) => {
          const cell = row.insertCell();
          const priceData = item.prices.get(vendor.id);

          if (!priceData || priceData.price === 0) {
            cell.innerText = '—';
            cell.style.color = '#999';
            cell.style.fontStyle = 'italic';
          } else {
            const isBest = priceData.price === minPrice;
            const isWorst = priceData.price === maxPrice;

            cell.innerText = `${priceData.price.toLocaleString()} Rs`;

            // Apply highlighting based on price comparison
            if (isBest && isWorst) {
              // Only one vendor or all same price
              cell.style.color = '#000000';
              cell.style.fontWeight = 'normal';
            } else if (isBest) {
              cell.style.color = '#059669'; // Green for lowest
              cell.style.fontWeight = 'bold';
            } else if (isWorst) {
              cell.style.color = '#dc2626'; // Red for highest
              cell.style.fontWeight = 'bold';
            } else {
              cell.style.color = '#000000';
              cell.style.fontWeight = 'normal';
            }
          }
          cell.style.cssText +=
            'border:1px solid #ddd; padding:4px 3px; text-align:center; font-size:9px';
        });
      });

      reportContainer.appendChild(table);
    });

    // Legend section
    const legendWrapper = document.createElement('div');
    legendWrapper.style.cssText =
      'margin-top: 15px; padding: 8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; font-size:9px';
    legendWrapper.innerHTML = `
    <div style="font-weight:bold; margin-bottom:4px; color:#1E3A8A;">Price Legend</div>
    <div style="display:flex; gap:15px; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:4px;">
        <div style="width:12px;height:12px;background:#059669;border-radius:2px;"></div>
        <span><strong>Lowest Price</strong> (Best Offer)</span>
      </div>
      <div style="display:flex; align-items:center; gap:4px;">
        <div style="width:12px;height:12px;background:#dc2626;border-radius:2px;"></div>
        <span><strong>Highest Price</strong></span>
      </div>
      <div style="display:flex; align-items:center; gap:4px;">
        <div style="width:12px;height:12px;background:#000000;border-radius:2px;"></div>
        <span>Regular Price</span>
      </div>
    </div>
  `;
    reportContainer.appendChild(legendWrapper);

    // Summary section
    const summaryWrapper = document.createElement('div');
    summaryWrapper.style.cssText =
      'margin-top: 10px; padding: 8px; background:#eff6ff; border:1px solid #dbeafe; border-radius:4px; font-size:9px';
    summaryWrapper.innerHTML = `
    <div style="font-weight:bold; margin-bottom:4px; color:#1E3A8A;">Report Summary</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 4px; line-height:1.5;">
      <div>• Total Items: <strong>${items.length}</strong></div>
      <div>• Filtered Items: <strong>${filteredItems.length}</strong></div>
      <div>• Vendors Compared: <strong>${vendorList.length}</strong></div>
      <div>• Categories in Report: <strong>${sortedCategories.length}</strong></div>
      <div>• Generated: <strong>${new Date().toLocaleString()}</strong></div>
      ${selectedCategory !== 'all' ? `<div>• Selected Category: <strong>${selectedCategory}</strong></div>` : ''}
      ${filters.lowPriceOnly ? `<div>• Filter Applied: <strong>Low Price Only</strong></div>` : ''}
    </div>
  `;
    reportContainer.appendChild(summaryWrapper);

    // Open Print Preview
    const printWin = window.open('', '_blank', 'width=1200,height=900');
    if (!printWin) {
      toast.error('Please allow popups to view print preview');
      return;
    }

    printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rate Comparison Report - Print</title>
        <style>
          body { 
            margin: 0; 
            padding: 10px; 
            background: white; 
            font-family: Arial, sans-serif; 
            color: black; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 9px; 
          }
          th, td { 
            border: 1px solid #ccc; 
            padding: 4px 3px; 
            text-align: center; 
            vertical-align: middle;
          }
          th { 
            background: #0D47A1; 
            color: white; 
            font-weight: bold; 
            padding: 5px 3px;
          }
          .category-header {
            background: #1E3A8A;
            color: white;
            padding: 6px 10px;
            margin: 10px 0 5px 0;
            font-weight: bold;
            font-size: 12px;
            border-radius: 3px;
          }
          tr:nth-child(even) { 
            background: #f8f9fa; 
          }
          @media print {
            body { 
              padding: 5px; 
            }
            @page { 
              margin: 5mm; 
              size: A4 landscape; 
            }
            * { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
          }
        </style>
      </head>
      <body>
        ${reportContainer.innerHTML}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
            window.onafterprint = () => setTimeout(() => window.close(), 300);
          }
        </script>
      </body>
    </html>
  `);

    printWin.document.close();
    toast.success('Print Preview Opened! Auto-printing...');
  };
  return (
    <div>
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Raw Material Rate Compare </h1>
            <div className="flex flex-col">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                <span className="font-medium">Date & Time:</span>{' '}
                {rawListData?.data?.from
                  ? format(new Date(rawListData.data.from), 'd MMM yyyy')
                  : ''}{' '}
                to{' '}
                {rawListData?.data?.to
                  ? format(new Date(rawListData.data.to), 'd MMM yyyy')
                  : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative" ref={filterDropdownRef}>
              <button
                ref={filterButtonRef}
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
              >
                <FaFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter Options</span>
                <span className="sm:hidden">Filter</span>
                <FaAngleDown
                  className={`transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isFilterDropdownOpen && (
                <div
                  className="border-gray-200 dark:border-gray-700 absolute top-full z-50 mt-1 w-80 rounded-md border bg-white p-4 shadow-lg dark:bg-meta-4 sm:w-80"
                  style={{
                    left: '0',
                    right: 'auto',
                    // On mobile, if dropdown goes off screen, adjust
                    ...(window.innerWidth < 640 && {
                      left: '50%',
                      right: 'auto',
                      position: 'fixed',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '90vw',
                      maxWidth: '400px',
                      maxHeight: '80vh',
                      overflowY: 'auto',
                    }),
                  }}
                >
                  <h4 className="text-gray-800 mb-3 text-sm font-semibold dark:text-white">
                    Filter Options
                  </h4>
                  <div className="space-y-3">
                    {/* Group by Category */}
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
                        <div className="bg-gray-200 dark:border-gray-600 dark:bg-gray-700 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>

                    {/* Low Price Only Filter */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Show Low Price Items Only
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={filters.lowPriceOnly}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              lowPriceOnly: !prev.lowPriceOnly,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:border-gray-600 dark:bg-gray-700 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800"></div>
                      </label>
                    </div>

                    {/* Category Filter */}
                    {filters.category && (
                      <div className="border-gray-200 dark:border-gray-700 border-t pt-3">
                        <h5 className="text-gray-700 dark:text-gray-300 mb-2 text-xs font-medium">
                          Filter by Category
                        </h5>
                        <div className="space-y-1">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="cat"
                              value="all"
                              checked={selectedCategory === 'all'}
                              onChange={(e) =>
                                setSelectedCategory(e.target.value)
                              }
                              className="h-3.5 w-3.5 text-blue-600"
                            />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              All Categories
                            </span>
                          </label>
                          {categories.map((cat) => (
                            <label
                              key={cat}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name="cat"
                                value={cat}
                                checked={selectedCategory === cat}
                                onChange={(e) =>
                                  setSelectedCategory(e.target.value)
                                }
                                className="h-3.5 w-3.5 text-blue-600"
                              />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {cat}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleDownloadPDF}
              className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
            >
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 flex flex-col gap-4 rounded-md p-4 dark:bg-meta-4 md:flex-row md:items-center md:justify-end md:py-4">
        {/* Category Filter and Share Buttons Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Category Filter Section */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative w-full sm:w-auto">
              <button
                ref={categoryButtonRef}
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 flex w-full items-center justify-between gap-2 rounded-md border bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-meta-4 dark:text-white sm:px-3 sm:py-2"
              >
                <span className="truncate">
                  {selectedCategoryIds.length > 0
                    ? `${selectedCategoryIds.length} category(ies) selected`
                    : 'All Categories'}
                </span>
                <FaAngleDown
                  className={`ml-2 flex-shrink-0 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isCategoryDropdownOpen && (
                <>
                  {/* Mobile overlay backdrop */}
                  <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />

                  {/* Category dropdown content */}
                  <div className="md:border-gray-200 dark:md:border-gray-700 fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-meta-4 md:absolute md:inset-auto md:bottom-full md:left-0 md:mb-2 md:w-64 md:rounded-md md:border md:p-2 md:shadow-lg">
                    {/* Mobile header */}
                    <div className="mb-6 flex items-center justify-between border-b pb-4 md:hidden">
                      <h4 className="text-gray-800 text-lg font-semibold dark:text-white">
                        Select Categories
                      </h4>
                      <button
                        onClick={() => setIsCategoryDropdownOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="md:p-2">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                          Select Categories
                        </span>
                        {selectedCategoryIds.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearAllCategories();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div
                        className="overflow-y-auto"
                        style={{maxHeight: 'calc(80vh - 120px)'}}
                      >
                        {categoryOptions.map((category) => (
                          <label
                            key={category.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center rounded px-2 py-3 md:py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(
                                category.id,
                              )}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleCategorySelection(category.id);
                              }}
                              className="border-gray-300 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 md:h-4 md:w-4"
                            />
                            <span className="text-gray-700 dark:text-gray-300 ml-3 text-sm">
                              {category.name}
                            </span>
                          </label>
                        ))}
                        {categoryOptions.length === 0 && (
                          <div className="text-gray-500 dark:text-gray-400 px-2 py-2 text-center text-sm">
                            No categories available
                          </div>
                        )}
                      </div>

                      {/* Mobile apply button */}
                      <div className="border-t pt-4 md:hidden">
                        <button
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Selected categories pills */}
            {selectedCategoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategoryIds.map((id) => {
                  const category = categoryOptions.find((c) => c.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {category?.name || 'Unknown Category'}
                      <button
                        onClick={() => toggleCategorySelection(id)}
                        className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleshare();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-800 dark:from-blue-700 dark:to-indigo-800 sm:w-auto sm:px-4 sm:py-2"
            >
              <FaShare className="h-4 w-4" />
              <span className="hidden sm:inline">Share To Tendor</span>
              <span className="sm:hidden">Share To Tendor</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard
                  .writeText(registrationLink)
                  .then(() => toast.success('Link copied'))
                  .catch(() => toast.error('Failed to copy'));
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-3 font-medium text-blue-600 shadow transition-all hover:bg-blue-50 dark:border-blue-500 dark:bg-boxdark dark:text-blue-400 dark:hover:bg-blue-900/20 sm:hidden"
            >
              <FaShare className="h-4 w-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div className="max-w-full overflow-x-auto">
          <div
            className="min-w-[800px]"
            style={{
              minWidth: `max(800px, ${160 + 100 + vendorList.length * 120}px)`,
            }}
          >
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-800 text-left dark:bg-meta-4">
                  <th
                    className="sticky left-0 z-20 min-w-[160px] bg-blue-900 px-3 py-2.5 font-medium text-white dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 20,
                    }}
                  >
                    Raw Material
                  </th>
                  <th
                    className="sticky left-[160px] z-20 min-w-[100px] bg-blue-900 px-3 py-2.5 font-medium text-white dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    style={{
                      position: 'sticky',
                      left: 160,
                      zIndex: 20,
                    }}
                  >
                    Quantity
                  </th>
                  {vendorList.map((vendor, index) => (
                    <th
                      key={vendor.id}
                      className="min-w-[120px] bg-blue-900 px-3 py-2.5 text-center font-medium text-white dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <div className="truncate text-xs">{vendor.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryGroups.map((group) => {
                  const isExpanded = group.isExpanded;
                  const itemCount = group.items.length;

                  return (
                    <React.Fragment key={group.category}>
                      {/* Category Header Row */}
                      <tr
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer bg-neutral-50 dark:bg-meta-4"
                        onClick={() => toggleCategory(group.category)}
                      >
                        <td
                          colSpan={2 + vendorList.length}
                          className="px-3 py-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-black dark:text-white">
                                {isExpanded ? (
                                  <FaChevronDown className="h-4 w-4 transition-transform" />
                                ) : (
                                  <FaChevronRight className="h-4 w-4 transition-transform" />
                                )}
                              </span>
                              <div>
                                <span className="font-semibold text-black dark:text-white">
                                  {group.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Items Rows (only show if expanded) */}
                      {isExpanded &&
                        group.items.map((item) => {
                          const prices = vendorList.map((v) => {
                            const p = item.prices.get(v.id);
                            return p ? p.price : null;
                          });

                          const validPrices = prices.filter(
                            (p): p is number => p !== null && p !== 0,
                          );

                          const minPrice =
                            validPrices.length > 0
                              ? Math.min(...validPrices)
                              : null;
                          const maxPrice =
                            validPrices.length > 0
                              ? Math.max(...validPrices)
                              : null;

                          return (
                            <tr key={`${item.category}-${item.name}`}>
                              <td
                                className="border-b border-[#eee] bg-white px-3 py-2.5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                style={{
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 10,
                                  minWidth: '160px',
                                  background: 'inherit',
                                }}
                              >
                                {item.name}
                              </td>
                              <td
                                className="border-b border-[#eee] bg-white px-3 py-2.5 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                style={{
                                  position: 'sticky',
                                  left: 160,
                                  zIndex: 10,
                                  minWidth: '100px',
                                  background: 'inherit',
                                }}
                              >
                                <span className="font-semibold">
                                  {item.quantity}
                                </span>{' '}
                                <span className="text-gray-500 text-xs uppercase">
                                  {item.unit}
                                </span>
                              </td>

                              {vendorList.map((vendor) => {
                                const priceData = item.prices.get(vendor.id);
                                if (!priceData) {
                                  return (
                                    <td
                                      key={vendor.id}
                                      className="text-gray-400 min-w-[120px] border-b border-[#eee] px-3 py-2.5 text-center dark:border-strokedark"
                                    >
                                      —
                                    </td>
                                  );
                                }

                                const isBest = priceData.price === minPrice;
                                const isWorst = priceData.price === maxPrice;

                                return (
                                  <td
                                    key={vendor.id}
                                    className={`min-w-[120px] border-b border-[#eee] px-3 py-2.5 text-center font-medium ${
                                      isBest
                                        ? 'text-green-600'
                                        : isWorst
                                          ? 'text-red-600'
                                          : 'text-black dark:text-white'
                                    } dark:border-strokedark`}
                                  >
                                    {priceData.price === 0
                                      ? '-'
                                      : `${priceData.price.toLocaleString()} Rs`}
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
      </div>

      {/* Legend + Count */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium">Price Legend</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-600"></div>
            <span>Lowest (Best)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-600"></div>
            <span>Highest</span>
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Showing {filteredItems.length} of {items.length} items
          {filters.lowPriceOnly && (
            <span className="ml-2 text-green-600">
              (Low Price Filter Active)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoTendorRateCompare;
