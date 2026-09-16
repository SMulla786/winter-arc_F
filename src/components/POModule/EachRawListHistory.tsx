/*eslint-disable*/
import {
  rawExtraHistory,
  rawRegularHistory,
} from '@/lib/react-query/queriesAndMutations/admin/totaldishcountandrawmaterial';
import {
  useGetRawListHistoryById,
  useUpdateRawMaterialHistory,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';

import React, {useRef, useState, useEffect} from 'react';
import {FaAngleRight, FaAngleDown, FaFilter} from 'react-icons/fa';
import ExtraRawMaterialForPo from './ExtraRawMaterialForPo';
import {
  useDeleteExtraRawPo,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {FiDownload} from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
type Props = {
  listId: string;
};
const EachRawListHistory: React.FC<Props> = ({listId}) => {
  const {data: rawMaterialsData} = useGetRawMaterialsCateror();
  const {data: rawListData} = useGetRawListHistoryById(listId);
  console.log('rawlist data/////////', rawListData);
  const {mutateAsync: updateHistory} = useUpdateRawMaterialHistory();
  const [updatedList, setUpdatedList] = React.useState<any[]>([]);
  const {mutateAsync: deleteExtra} = useDeleteExtraRawPo();
  const [openCategories, setOpenCategories] = React.useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const [selectedColumns, setSelectedColumns] = useState({
    inventory: true,
    totalQuantity: true,
    orderQuantity: true,
    requiredQuantity: true,
    extraQuantity: true,
    inventoryValue: true,
  });

  // Add effect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFilterDropdownOpen &&
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
  }, [isFilterDropdownOpen]);

  const toggleColumnSelection = (column: keyof typeof selectedColumns) => {
    setSelectedColumns((prev) => ({...prev, [column]: !prev[column]}));
  };
  console.log('each  history y id', rawListData);
  React.useEffect(() => {
    setUpdatedList(combinedList);
  }, [rawListData]);

  React.useEffect(() => {
    setOpenCategories(Object.keys(groupedByCategory));
  }, [rawListData]);

  const toggleCategory = (cat: string) => {
    setOpenCategories(
      (prev) =>
        prev.includes(cat)
          ? prev.filter((c) => c !== cat) // close
          : [...prev, cat], // open
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formattedRegular =
    rawListData?.data?.sendToVendors?.map(
      (item: {
        rawmaterial: {
          id: string;
          name: string;
          category: {name: string; id: string};
          inventory: number;
          inventoryOrder: number;
          quantity: number;
          unit: string;
          createdAt: string;
        };
        quantity: number;
        RMlistId: string;
        totalQty: number;
        createdAt: string;
        inventoryOrder: number;
        extraQuantity: number;
      }) => ({
        name: item?.rawmaterial?.name,
        id: item?.rawmaterial?.id,
        category: item?.rawmaterial?.category?.name,
        categoryId: item?.rawmaterial?.category?.id,
        inventory: item?.rawmaterial?.inventory,
        inventoryValue: item?.inventoryOrder,
        quantity: item?.quantity,
        unit: item?.rawmaterial?.unit,
        createdAt: formatDate(item?.createdAt),
        type: 'regular',
        rmListId: item?.RMlistId,
        totalQty: item?.totalQty,
        extra: item?.extraQuantity,
      }),
    ) || [];

  const formattedExtra =
    rawListData?.data?.RawMaterialListExtra?.map((item) => ({
      type: 'extra',
      extraTableId: item?.id,
      rmListId: item?.rawMaterialListId,
      id: item?.rawMaterialId,
      name: item?.rawMaterial?.name,
      category: item?.rawMaterial?.category?.name,
      categoryId: item?.rawMaterial?.category?.id,
      quantity: item?.quantity,
      inventory: item?.inventory || 0,
      inventoryValue: item?.inventoryValue,
      unit: item?.rawMaterial?.unit ?? '-',
      totalQty: item?.totalQty,
      extra: item?.extraQuantity,
      createdAt: new Date(item?.createdAt).toLocaleDateString('en-IN'),
    })) || [];

  const combinedList = [...formattedRegular, ...formattedExtra];

  //remaning raw materials for extra
  const remainingRawMaterials = rawMaterialsData?.data?.rawMaterials?.filter(
    (raw: {
      id: string;
      name: string;
      category: {name: string};
      unit: string;
      inventory: number;
    }) => !combinedList.some((f) => f.id === raw.id),
  );

  const formatedRemaning = remainingRawMaterials?.map(
    (raw: {
      id: string;
      name: string;
      category: {name: string};
      unit: string;
      inventory: number;
    }) => ({
      category: raw?.category?.name,
      id: raw?.id,
      inventory: raw?.inventory,
      maharaj: 'unknown',
      name: raw?.name,
      subEvent: 'Extra',
      unit: raw?.unit,
    }),
  );

  const groupedByCategory = combinedList.reduce(
    (acc, item) => {
      const category = item.category || 'Unknown';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const handleSubmit = async () => {
    const regular: rawRegularHistory = [];
    const extra: rawExtraHistory = [];

    updatedList.forEach((item) => {
      const formatted = {
        rawMaterialListId: listId,
        rawMaterialId: item.id,
        name: item.name,
        quantity: item.quantity,
        inventoryValue: item.inventoryValue ?? 0,
        totalQty: item.totalQty ?? 0,
      };

      if (item.type === 'regular') {
        regular.push(formatted);
      } else {
        extra.push(formatted);
      }
    });

    await updateHistory({
      id: listId,
      extramaterials: extra,
      materials: regular,
    });
  };

  // Function to handle inventory value change with validation
  const handleInventoryValueChange = (
    itemId: string,
    value: number,
    maxInventory: number,
  ) => {
    // Ensure value doesn't exceed inventory
    const validatedValue = Math.min(value, maxInventory);

    setUpdatedList((prev) =>
      prev.map((mat) =>
        mat.id === itemId ? {...mat, inventoryValue: validatedValue} : mat,
      ),
    );
  };
  console.log('updatedd listtt', updatedList);

  const downloadPDF = async () => {
    try {
      let htmlContent = `
      <div style="
        font-family: 'Noto Sans Devanagari', Arial, sans-serif;
        background: white;
        color: black;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      ">
        <div style="text-align: center; padding: 20px 0 15px 0; background: #1e40af; color: white; margin: 0;">
          <h1 style="margin:0; font-size: 26px; font-weight: bold;">
            Raw Materials Order List
          </h1>
          <p style="margin: 8px 0 0; font-size: 16px;">
            Date: <strong>${formatDate(rawListData?.data?.from)}</strong> to <strong>${formatDate(rawListData?.data?.to)}</strong>
          </p>
        </div>

        <table style="
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin: 0;
          border: none;
        ">
          <thead>
            <tr style="background-color: #1e40af; color: white;">
              <th style="border: 1px solid #aaa; padding: 10px; text-align: left; font-weight: bold;">Name</th>
              ${selectedColumns.inventory ? '<th style="border: 1px solid #aaa; padding: 10px; text-align: left;">Inventory</th>' : ''}
              ${selectedColumns.totalQuantity ? '<th style="border: 1px solid #aaa; padding: 10px; text-align: left;">Total Qty</th>' : ''}
              ${selectedColumns.orderQuantity ? '<th style="border: 1px solid #aaa; padding: 10px; text-align: left;">Order Quantity</th>' : ''}
              ${selectedColumns.inventoryValue ? '<th style="border: 1px solid #aaa; padding: 10px; text-align: left;">Inventory Value</th>' : ''}
            </tr>
          </thead>
          <tbody>
    `;

      Object.keys(groupedByCategory).forEach((categoryName) => {
        const colCount =
          1 +
          (selectedColumns.inventory ? 1 : 0) +
          (selectedColumns.totalQuantity ? 1 : 0) +
          (selectedColumns.orderQuantity ? 1 : 0) +
          (selectedColumns.inventoryValue ? 1 : 0);

        htmlContent += `
        <tr style="background: #e0e7ff; font-weight: bold; font-size: 13px;">
          <td colspan="${colCount}" style="padding: 14px 10px; border: 1px solid #999; color: #1e40af; text-align: left;">
            ${categoryName}
          </td>
        </tr>
      `;

        groupedByCategory[categoryName].forEach((item) => {
          htmlContent += `
          <tr style="background: ${item.type === 'extra' ? '#f0f9ff' : 'white'};">
            <td style="border: 1px solid #ccc; padding: 10px 12px; font-size: 11.5px;">
              ${item.name}
              ${item.type === 'extra' ? '<span style="color: #2563eb; font-weight: bold; font-size: 10px;"> (extra)</span>' : ''}
            </td>
            ${selectedColumns.inventory ? `<td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${item.inventory ?? '-'}</td>` : ''}
            ${selectedColumns.totalQuantity ? `<td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${item.totalQty ?? '-'}</td>` : ''}
            ${selectedColumns.orderQuantity ? `<td style="border: 1px solid #ccc; padding: 10px; text-align: center; font-weight: bold;">${item.quantity ?? 0} ${item.unit}</td>` : ''}
            ${selectedColumns.inventoryValue ? `<td style="border: 1px solid #ccc; padding: 10px; text-align: center;">₹${(item.inventoryValue || 0).toLocaleString()}</td>` : ''}
          </tr>
        `;
        });
      });

      htmlContent += `
          </tbody>
        </table>

        <div style="position: fixed; bottom: 15px; left: 0; right: 0; text-align: center; color: #666; font-size: 10px; padding: 8px; background: white;">
          Generated on: ${new Date().toLocaleString('en-GB')} | Raw Materials Order Report
        </div>
      </div>
    `;

      const printWin = window.open('', '_blank', 'width=1100,height=900');
      if (!printWin) {
        toast.error('Please allow popups');
        return;
      }

      printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Raw Materials Order List</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: white;
              font-family: 'Noto Sans Devanagari', Arial, sans-serif;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
            }
            th, td {
              border: 1px solid #aaa;
              padding: 10px 12px;
              text-align: left;
            }
            th {
              background: #1e40af !important;
              color: white;
              font-weight: 600;
            }
            tr:nth-child(even of tbody tr:not(:has(th))) {
              background: #f8fafc;
            }
            .category-row td {
              background: #e0e7ff !important;
              font-weight: bold;
              color: #1e40af;
            }
            @media print {
              body { padding: 0 !important; margin: 0 !important; }
              @page {
                margin: 0mm !important;  /* FULL BLEED - NO MARGIN AT ALL */
                size: A4 portrait;
              }
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => setTimeout(() => window.print(), 800);
            window.onafterprint = () => setTimeout(() => window.close(), 600);
          </script>
        </body>
      </html>
    `);

      printWin.document.close();
      toast.success('Print Preview Opened - Full Page View!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to open print preview');
    }
  };
  const cleanTextForPDF = (text: string): string => {
    if (!text) return '';

    // You can add specific replacements for Marathi characters here
    // Example: replace common Marathi characters with something readable
    const replacements: Record<string, string> = {
      ॐ: '(Om)',
      अ: 'a',
      आ: 'aa',
      // Add more replacements as needed
    };

    // Simple approach: keep alphanumeric and common symbols, replace others
    return text.replace(/[^\x00-\x7F]/g, (char) => {
      return replacements[char] || '?';
    });
  };

  return (
    <div className="bg-white dark:bg-black">
      {/* Header Section */}
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-4 shadow-xl md:p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="text-white">
            <h1 className="text-xl font-bold md:text-2xl">
              Raw Material List History
            </h1>
            <p className="text-sm text-blue-100 md:text-base">
              {formatDate(rawListData?.data?.from)} to{' '}
              {formatDate(rawListData?.data?.to)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            {/* Filter Options Button */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                ref={filterButtonRef}
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
              >
                <FaFilter className="h-4 w-4" />
                <span>Filter Options</span>
                <FaAngleDown
                  className={`ml-1 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isFilterDropdownOpen && (
                <>
                  {/* Mobile overlay backdrop - only on mobile */}
                  <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />

                  {/* Filter dropdown content */}
                  <div className="md:border-gray-200 dark:md:border-gray-700 fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-meta-4 md:absolute md:inset-auto md:right-0 md:top-full md:mt-1 md:w-80 md:rounded-md md:border md:p-4 md:shadow-lg">
                    {/* Mobile header */}
                    <div className="mb-6 flex items-center justify-between border-b pb-4 md:hidden">
                      <h4 className="text-gray-800 text-lg font-semibold dark:text-white">
                        Filter Options
                      </h4>
                      <button
                        onClick={() => setIsFilterDropdownOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {/* <FaTimes className="h-5 w-5" /> */}
                      </button>
                    </div>

                    {/* Desktop header - hidden on mobile */}
                    <h4 className="text-gray-800 mb-3 hidden text-sm font-semibold dark:text-white md:block">
                      Filter Options
                    </h4>

                    <div className="space-y-4 md:space-y-3">
                      {/* Filter toggles */}
                      {[
                        {key: 'inventory', label: 'Show Inventory'},
                        {key: 'inventoryValue', label: 'Show Inventory Value'},
                        {key: 'totalQuantity', label: 'Show Total Quantity'},
                        {key: 'orderQuantity', label: 'Show Order Quantity'},
                      ].map(({key, label}) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-700 text-sm font-medium dark:text-white">
                            {label}
                          </span>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={selectedColumns[key]}
                              onChange={() => toggleColumnSelection(key)}
                              className="peer sr-only"
                            />
                            <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                          </label>
                        </div>
                      ))}

                      {/* Mobile apply button at bottom */}
                      <div className="border-t pt-4 md:hidden">
                        <button
                          onClick={() => setIsFilterDropdownOpen(false)}
                          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
            >
              <FiDownload className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="mt-4 md:mt-6">
        <div className="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
          <div className="min-w-[768px] md:min-w-full">
            {/* Table */}
            <table className="w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="dark:bg-gray-700 bg-blue-900 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                    Name
                  </th>
                  {selectedColumns.inventory && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Inventory
                    </th>
                  )}
                  {selectedColumns.requiredQuantity && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Required Qty
                    </th>
                  )}
                  {selectedColumns.extraQuantity && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Extra Qty
                    </th>
                  )}
                  {selectedColumns.totalQuantity && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Total Qty
                    </th>
                  )}
                  {selectedColumns.orderQuantity && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Order Qty
                    </th>
                  )}
                  {selectedColumns?.inventoryValue && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Inventory Value
                    </th>
                  )}
                  {formattedExtra.length > 0 && (
                    <th className="px-3 py-2 text-left text-xs font-semibold md:px-4 md:py-3 md:text-sm">
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-boxdark">
                {Object.keys(groupedByCategory).map((categoryName) => (
                  <React.Fragment key={categoryName}>
                    {/* Category Header Row */}
                    <tr
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer bg-neutral-100 dark:bg-meta-4"
                      onClick={() => toggleCategory(categoryName)}
                    >
                      <td
                        colSpan={
                          1 +
                          (selectedColumns.inventory ? 1 : 0) +
                          (selectedColumns.extraQuantity ? 1 : 0) +
                          (selectedColumns.requiredQuantity ? 1 : 0) +
                          (selectedColumns.totalQuantity ? 1 : 0) +
                          (selectedColumns.orderQuantity ? 1 : 0) +
                          (selectedColumns?.inventoryValue ? 1 : 0) +
                          (formattedExtra.length > 0 ? 1 : 0)
                        }
                        className="px-3 py-2 font-semibold text-black dark:text-white md:px-4 md:py-3"
                      >
                        <div className="flex items-center">
                          <span className="mr-2">
                            {openCategories.includes(categoryName) ? (
                              <FaAngleDown />
                            ) : (
                              <FaAngleRight />
                            )}
                          </span>
                          <span className="text-sm md:text-base">
                            {categoryName}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Category Items */}
                    {openCategories.includes(categoryName) &&
                      groupedByCategory[categoryName].map((item, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-3 py-2 md:px-4 md:py-2">
                            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                              <span className="text-sm md:text-base">
                                {item.name}
                              </span>
                              {item.type === 'extra' && (
                                <span className="mt-1 inline-block w-fit rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200 md:mt-0">
                                  (extra)
                                </span>
                              )}
                            </div>
                          </td>

                          {selectedColumns.inventory && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              <span className="text-sm md:text-base">
                                {item.inventory ?? '-'}
                              </span>
                            </td>
                          )}

                          {selectedColumns.requiredQuantity && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              <span className="text-sm md:text-base">
                                {item.quantity.toFixed(3) ?? '-'}
                              </span>
                            </td>
                          )}

                          {selectedColumns.extraQuantity && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              <span className="text-sm md:text-base">
                                {item?.extra ?? '-'}
                              </span>
                            </td>
                          )}
                          {selectedColumns.totalQuantity && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              <span className="text-sm md:text-base">
                                {(
                                  (item.quantity ?? 0) + (item.extra ?? 0)
                                ).toFixed(3)}
                              </span>
                            </td>
                          )}
                          {selectedColumns.orderQuantity && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  defaultValue={item.quantity.toFixed(3) ?? 0}
                                  className="w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white md:w-28"
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setUpdatedList((prev) =>
                                      prev.map((mat) =>
                                        mat.id === item.id
                                          ? {...mat, quantity: value}
                                          : mat,
                                      ),
                                    );
                                  }}
                                />
                                <span className="text-gray-600 dark:text-gray-300 ml-2 text-sm">
                                  {item.unit}
                                </span>
                              </div>
                            </td>
                          )}
                          {selectedColumns.inventoryValue && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              <div className="relative">
                                <input
                                  type="number"
                                  value={
                                    updatedList.find(
                                      (mat) => mat.id === item.id,
                                    )?.inventoryValue ??
                                    item.inventoryValue ??
                                    0
                                  }
                                  max={item.inventory}
                                  className="w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white md:w-28"
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    handleInventoryValueChange(
                                      item.id,
                                      value,
                                      item.inventory,
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const value = Number(e.target.value);
                                    if (value > item.inventory) {
                                      handleInventoryValueChange(
                                        item.id,
                                        item.inventory,
                                        item.inventory,
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </td>
                          )}

                          {formattedExtra.length > 0 && (
                            <td className="px-3 py-2 md:px-4 md:py-2">
                              {item.type === 'extra' && (
                                <button
                                  className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                  onClick={() =>
                                    deleteExtra(item?.extraTableId)
                                  }
                                >
                                  <span className="hidden sm:inline">
                                    Delete
                                  </span>
                                  <span className="sm:hidden">X</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                  </React.Fragment>
                ))}

                {combinedList.length === 0 && (
                  <tr>
                    <td
                      colSpan={
                        1 +
                        (selectedColumns.inventory ? 1 : 0) +
                        (selectedColumns.totalQuantity ? 1 : 0) +
                        (selectedColumns.orderQuantity ? 1 : 0) +
                        (selectedColumns?.inventoryValue ? 1 : 0) +
                        (formattedExtra.length > 0 ? 1 : 0)
                      }
                      className="text-gray-500 dark:text-gray-400 px-4 py-8 text-center text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      No raw materials available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Extra Raw Material Section */}
      <div className="mt-4 md:mt-6">
        <h2 className="text-gray-800 mb-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold dark:bg-blue-900/20 dark:text-white md:px-4 md:py-3 md:text-base">
          Extra Raw Material
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[768px] md:min-w-full">
            <ExtraRawMaterialForPo data={formatedRemaning} rawListId={listId} />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex items-end justify-end">
        <button
          onClick={handleSubmit}
          className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default EachRawListHistory;
