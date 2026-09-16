import {useGetPostRawMaterialVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import {useParams, useNavigate} from '@tanstack/react-router';
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {FaFilter, FaAngleDown} from 'react-icons/fa';
import {BiArrowBack} from 'react-icons/bi';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {useGetVendorManpowerRole} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {useAuthContext} from '@/context/AuthContext';

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

const RawMaterialRateCompare = () => {
  const params = useParams({from: '/_app/rmrate/$id'});
  const eventid = params.id;
  const navigate = useNavigate();

  const {data: postRawMaterials, isLoading: loadingVendors} =
    useGetPostRawMaterialVendor(eventid);
  const {data: eventData, isLoading: loadingEvent} = useGetSubevent(eventid);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: true,
    lowPriceOnly: false, // New filter for low price only
  });

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close dropdown
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

  // Format Event Info
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

  // Process Vendor Data
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

  // Filter items based on category and low price filter
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Apply low price only filter
    if (filters.lowPriceOnly) {
      filtered = filtered.filter((item) => {
        const prices = Array.from(item.prices.values()).map((p) => p.price);
        if (prices.length === 0) return false;

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Only show items where there's a significant price difference
        // (at least 10% difference between min and max price)
        const priceDifference = ((maxPrice - minPrice) / minPrice) * 100;
        return priceDifference >= 10; // Show items with at least 10% price variation
      });
    }

    return filtered;
  }, [items, selectedCategory, filters.lowPriceOnly]);

  const handleCancel = () => {
    navigate({to: '/events/$id', params: {id: eventid}});
  };

  // PDF Export with Event Header
  const handleDownloadPDF = () => {
    if (!tableRef.current || !eventInfo) return;

    const reportContainer = document.createElement('div');
    reportContainer.style.width = '1000px';
    reportContainer.style.padding = '20px';
    reportContainer.style.background = 'white';
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.fontSize = '12px';
    reportContainer.style.color = 'black';

    // 🔹 Header
    const headerWrapper = document.createElement('div');
    headerWrapper.style.padding = '6px';
    headerWrapper.style.border = '1px solid #0D47A1';
    headerWrapper.style.textAlign = 'center';
    headerWrapper.style.color = 'black';
    headerWrapper.style.marginBottom = '15px';

    const centerInfo = document.createElement('div');
    centerInfo.innerHTML = `
    <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
      ${eventInfo.name || 'Event Name'}
    </h1>
    <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
    <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
      ${eventInfo.address || 'N/A'}<br/>
      ${eventInfo.time || 'Date not available'}
    </p>
  `;
    headerWrapper.appendChild(centerInfo);
    reportContainer.appendChild(headerWrapper);

    // 🔹 Report Title
    const titleWrapper = document.createElement('div');
    titleWrapper.style.marginBottom = '15px';
    titleWrapper.style.textAlign = 'center';
    titleWrapper.innerHTML = `
    <h2 style="font-size: 22px; font-weight: bold; margin:0; color:black; text-decoration: underline;">
      Raw Material Rate Comparison Report
    </h2>
    <div style="margin-top: 8px; color:black;">
      <span style="display: inline-block; margin: 0 8px; color:black;">
        <strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </span>
      <span style="display: inline-block; margin: 0 8px; color:black;">
        <strong>Items:</strong> ${filteredItems.length} of ${items.length}
      </span>
      ${
        selectedCategory !== 'all'
          ? `
        <span style="display: inline-block; margin: 0 8px; color:black;">
          <strong>Category:</strong> ${selectedCategory}
        </span>
      `
          : ''
      }
      ${
        filters.lowPriceOnly
          ? `
        <span style="display: inline-block; margin: 0 8px; color:black;">
          <strong>Filter:</strong> Low Price Items Only
        </span>
      `
          : ''
      }
    </div>
  `;
    reportContainer.appendChild(titleWrapper);

    // 🔹 Create comparison table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '11px';
    table.style.backgroundColor = 'white';
    table.style.marginBottom = '20px';

    // Table headers
    const headers = ['Category', 'Raw Material', 'Quantity'];
    vendorList.forEach((vendor) => {
      headers.push(vendor.name);
    });

    const headerRow = table.insertRow();
    headers.forEach((text, index) => {
      const th = document.createElement('th');
      th.innerText = text.length > 15 ? text.substring(0, 15) + '...' : text;
      th.style.border = '1px solid #ccc';
      th.style.padding = '8px 6px';
      th.style.backgroundColor = index < 3 ? '#1E3A8A' : '#0D47A1';
      th.style.color = 'white';
      th.style.textAlign = 'center';
      th.style.verticalAlign = 'middle';
      th.style.fontWeight = 'bold';
      th.style.fontSize = '10px';
      headerRow.appendChild(th);
    });

    // Table data rows
    filteredItems.forEach((item, rowIndex) => {
      const prices = vendorList.map((v) => {
        const p = item.prices.get(v.id);
        return p ? p.price : null;
      });
      const validPrices = prices.filter((p): p is number => p !== null);
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
      const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;

      const row = table.insertRow();
      row.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8f8f8';
      row.style.verticalAlign = 'middle';

      // Category cell
      const categoryCell = row.insertCell();
      categoryCell.innerText = item.category;
      categoryCell.style.border = '1px solid #ddd';
      categoryCell.style.padding = '6px 4px';
      categoryCell.style.textAlign = 'left';
      categoryCell.style.fontWeight = 'bold';
      categoryCell.style.color = 'black';
      categoryCell.style.fontSize = '11px';

      // Raw Material cell
      const materialCell = row.insertCell();
      materialCell.innerText = item.name;
      materialCell.style.border = '1px solid #ddd';
      materialCell.style.padding = '6px 4px';
      materialCell.style.textAlign = 'left';
      materialCell.style.color = 'black';
      materialCell.style.fontSize = '11px';

      // Quantity cell
      const quantityCell = row.insertCell();
      quantityCell.innerHTML = `
      <span style="font-weight: bold;">${item.quantity}</span>
      <span style="color: #666; font-size: 9px; text-transform: uppercase;"> ${item.unit}</span>
    `;
      quantityCell.style.border = '1px solid #ddd';
      quantityCell.style.padding = '6px 4px';
      quantityCell.style.textAlign = 'center';
      quantityCell.style.color = 'black';
      quantityCell.style.fontSize = '11px';

      // Vendor price cells
      vendorList.forEach((vendor) => {
        const priceCell = row.insertCell();
        const priceData = item.prices.get(vendor.id);

        if (!priceData) {
          priceCell.innerText = '—';
          priceCell.style.color = '#999';
        } else {
          const isBest = priceData.price === minPrice;
          const isWorst = priceData.price === maxPrice;

          // Only show the price with color, no icons or text
          priceCell.innerText = `${priceData.price.toLocaleString()} Rs`;
          priceCell.style.color = isBest
            ? '#059669'
            : isWorst
              ? '#dc2626'
              : 'black';
          priceCell.style.fontWeight = 'bold';
        }

        priceCell.style.border = '1px solid #ddd';
        priceCell.style.padding = '6px 4px';
        priceCell.style.textAlign = 'center';
        priceCell.style.fontSize = '11px';
        priceCell.style.verticalAlign = 'middle';
      });
    });

    reportContainer.appendChild(table);

    // 🔹 Legend (simplified without icons)
    const legendWrapper = document.createElement('div');
    legendWrapper.style.marginTop = '15px';
    legendWrapper.style.padding = '10px';
    legendWrapper.style.backgroundColor = '#f8fafc';
    legendWrapper.style.border = '1px solid #e2e8f0';
    legendWrapper.style.borderRadius = '4px';
    legendWrapper.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; color: black; font-size: 12px;">
      Price Legend
    </div>
    <div style="display: flex; gap: 20px; font-size: 10px; color: black;">
      <div style="display: flex; align-items: center; gap: 4px;">
        <div style="width: 12px; height: 12px; background-color: #059669; border-radius: 2px;"></div>
        <span>Lowest Price</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <div style="width: 12px; height: 12px; background-color: #dc2626; border-radius: 2px;"></div>
        <span>Highest Price</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <div style="width: 12px; height: 12px; background-color: #000000; border-radius: 2px;"></div>
        <span>Regular Price</span>
      </div>
    </div>
  `;
    reportContainer.appendChild(legendWrapper);

    // 🔹 Summary
    const summaryWrapper = document.createElement('div');
    summaryWrapper.style.marginTop = '15px';
    summaryWrapper.style.padding = '10px';
    summaryWrapper.style.backgroundColor = '#eff6ff';
    summaryWrapper.style.border = '1px solid #dbeafe';
    summaryWrapper.style.borderRadius = '4px';
    summaryWrapper.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 6px; color: black; font-size: 12px;">
      Summary
    </div>
    <div style="font-size: 10px; color: black; line-height: 1.4;">
      • Total Items: <strong>${items.length}</strong><br/>
      • Filtered Items: <strong>${filteredItems.length}</strong><br/>
      • Vendors Compared: <strong>${vendorList.length}</strong><br/>
      • Categories: <strong>${categories.length}</strong><br/>
      ${filters.lowPriceOnly ? '• Showing: <strong>Low Price Items Only</strong><br/>' : ''}
      • Generated on: <strong>${new Date().toLocaleString()}</strong>
    </div>
  `;
    reportContainer.appendChild(summaryWrapper);

    // 🔹 Generate PDF
    document.body.appendChild(reportContainer);

    html2canvas(reportContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
      .then((canvas) => {
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth() - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const bottomMargin = 10;
        const topMargin = 10;

        let heightLeft = imgHeight;
        let position = topMargin;
        const pageNumber = 1;

        // First page
        pdf.addImage(
          canvas,
          'PNG',
          10,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST',
        );
        heightLeft -= pageHeight - topMargin - bottomMargin;

        // Add additional pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(
            canvas,
            'PNG',
            10,
            position,
            imgWidth,
            imgHeight,
            undefined,
            'FAST',
          );
          heightLeft -= pageHeight - bottomMargin;
        }

        // Add page numbers to all pages
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 10,
          );
        }

        pdf.save(
          `Raw-Material-Rate-Compare-${eventInfo.name.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
        );
      })
      .catch((error) => {
        console.error('PDF generation error:', error);
        alert('Failed to generate PDF. Please try again.');
      })
      .finally(() => {
        document.body.removeChild(reportContainer);
      });
  };

  if (loadingVendors || loadingEvent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-black dark:text-white">
          Loading...
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="py-8 text-center">
        <h1 className="mb-3 text-xl font-semibold text-black dark:text-white">
          Raw Material Rate Compare
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No data available.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Gradient Header */}
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Raw Material Rate Compare</h1>
            {filters.lowPriceOnly && (
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium">
                  Low Price Mode
                </span>
                <span className="text-sm text-green-200">
                  Showing items with significant price differences
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {/* Filter Options */}
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
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
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
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800"></div>
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

            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
            >
              <span>PDF</span>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Event Info */}
      {eventInfo && (
        <div className="bg-gray-50 rounded-md p-4 dark:bg-meta-4">
          <h1 className="text-lg font-bold text-black dark:text-white">
            {eventInfo.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
            <span className="font-medium">Address:</span> {eventInfo.address}
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            <span className="font-medium">Date & Time:</span> {eventInfo.time}
          </p>
        </div>
      )}

      {/* Table */}
      <div
        ref={tableRef}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="sticky left-0 z-10 min-w-[140px] border-r border-[#eee] bg-gray-2 px-3 py-2.5 font-medium text-black dark:border-strokedark dark:bg-meta-4 dark:text-white">
                  Category
                </th>
                <th className="sticky left-[140px] z-10 min-w-[160px] border-r border-[#eee] bg-gray-2 px-3 py-2.5 font-medium text-black dark:border-strokedark dark:bg-meta-4 dark:text-white">
                  Raw Material
                </th>
                <th className="sticky left-[300px] z-10 min-w-[100px] border-r border-[#eee] bg-gray-2 px-3 py-2.5 font-medium text-black dark:border-strokedark dark:bg-meta-4 dark:text-white">
                  Quantity
                </th>
                {vendorList.map((vendor) => (
                  <th
                    key={vendor.id}
                    className="min-w-[120px] border-r border-[#eee] bg-gray-2 px-3 py-2.5 text-center font-medium text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  >
                    <div className="truncate text-xs">{vendor.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const prices = vendorList.map((v) => {
                  const p = item.prices.get(v.id);
                  return p ? p.price : null;
                });
                const validPrices = prices.filter(
                  (p): p is number => p !== null,
                );
                const minPrice =
                  validPrices.length > 0 ? Math.min(...validPrices) : null;
                const maxPrice =
                  validPrices.length > 0 ? Math.max(...validPrices) : null;

                return (
                  <tr key={`${item.category}-${item.name}`}>
                    <td className="sticky left-0 z-10 min-w-[140px] border-b border-r border-[#eee] bg-white px-3 py-2.5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white">
                      {item.category}
                    </td>
                    <td className="sticky left-[140px] z-10 min-w-[160px] border-b border-r border-[#eee] bg-white px-3 py-2.5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white">
                      {item.name}
                    </td>
                    <td className="sticky left-[300px] z-10 min-w-[100px] border-b border-r border-[#eee] bg-white px-3 py-2.5 text-black dark:border-strokedark dark:bg-boxdark dark:text-white">
                      <span className="font-semibold">{item.quantity}</span>{' '}
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
                            className="text-gray-400 min-w-[120px] border-b border-r border-[#eee] px-3 py-2.5 text-center dark:border-strokedark"
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
                          className={`min-w-[120px] border-b border-r border-[#eee] px-3 py-2.5 text-center font-medium ${
                            isBest
                              ? 'text-green-600'
                              : isWorst
                                ? 'text-red-600'
                                : 'text-black dark:text-white'
                          } dark:border-strokedark`}
                        >
                          {priceData.price.toLocaleString()} Rs
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      {/* Back Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleCancel}
          className="flex gap-1 rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-200"
        >
          <BiArrowBack className="h-4 w-4" />
          Back to Event
        </button>
      </div>
    </div>
  );
};

export default RawMaterialRateCompare;
