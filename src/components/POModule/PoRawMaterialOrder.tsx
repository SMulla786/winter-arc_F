/*eslint-disable*/
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FiDownload, FiSearch, FiArrowLeft} from 'react-icons/fi';
import {
  FaAngleDown,
  FaAngleRight,
  FaFilter,
  FaShare,
  FaTimes,
  FaFileInvoice,
  FaBalanceScale,
} from 'react-icons/fa';
import ExtraRawmaterialOrder from '../Event/subEvent/ExtraRawMatrialOrder';
import {useAuthContext} from '@/context/AuthContext';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {shareLinkSchema} from '@/lib/validation/vendorSchema';
import toast from 'react-hot-toast';
import {useNavigate} from '@tanstack/react-router';
import {usePostExternalVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import ExtraRawMaterialForPo from './ExtraRawMaterialForPo';
import {
  useDeleteExtraRawPo,
  useGetExtraRawMaterial,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
// Add jsPDF types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface RawMaterial {
  id: string;
  rawMaterialId?: string;
  name: string;
  unit: string;
  quantity: number;
  inventory: number;
  store: string;
  maharaj: string;
  subEvent: string;
  category: string;
  categoryId?: string;
  inventory_value?: number;
  orderQuantity?: number;
  peopleType?: string;
}

interface ExtraRawMaterial {
  id: string;
  rawMaterialId: string;
  quantity: number;
  eventId: string;
  rawMaterial: {
    id: string;
    name: string;
    unit: string;
    categoryId: string;
    languageId: string;
    caterorId: string;
    inventory: number;
    amount: number;
  };
}

interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
  type: 'dish' | 'raw-material';
}

interface PoRawMaterialOrderProps {
  selectedHistoryItem: HistoryItem | null;
  fromDate: string;
  toDate: string;
  filteredRawMaterials: RawMaterial[];
  mergedMaterials: ExtraRawMaterial[];
  selectedSubEventsCount: number;
  isRawLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filters: {
    category: boolean;
    subEvent: boolean;
    maharaj: boolean;
  };
  onFiltersChange: React.Dispatch<
    React.SetStateAction<{
      category: boolean;
      subEvent: boolean;
      maharaj: boolean;
    }>
  >;
  selectedColumns: {
    inventory: boolean;
    totalQuantity: boolean;
    orderQuantity: boolean;
    requiredQuantity: boolean;
    extraQuantity: boolean;
  };
  onToggleColumnSelection: (column: keyof typeof selectedColumns) => void;
  expanded: {[key: string]: boolean};
  onToggleExpand: (keyPath: string) => void;
  isRawSuccess: boolean;
  isLoadingExtraMaterials: boolean;
  initialOrderQuantity: {[key: string]: number};
  onQuantityChange: (id: string, value: string) => void;
  onDeleteExtraMaterial: (id: string) => Promise<void>;
  onSuccessExtra: () => void;
  selectedSubEventIds: string[];
  onBack: () => void;
  groupedData: any;
  renderRawMaterialRows: (
    data: any,
    keyPath?: string,
    depth?: number,
  ) => JSX.Element[];
}

interface CategoryOption {
  id: string;
  name: string;
}

const PoRawMaterialOrder: React.FC<PoRawMaterialOrderProps> = (props) => {
  const {
    fromDate,
    toDate,
    filteredRawMaterials,
    mergedMaterials,
    selectedSubEventsCount,
    isRawLoading,
    searchQuery,
    filters,
    onFiltersChange,
    selectedColumns,
    onToggleColumnSelection,
    expanded,
    onToggleExpand,
    isRawSuccess,
    onQuantityChange,
  } = props;

  console.log('filtered raw po', filteredRawMaterials);
  const {data: rawMaterialsData} = useGetRawMaterialsCateror();
  const {data: extraRawMaterial} = useGetExtraRawMaterial(
    filteredRawMaterials[0]?.rawListId,
  );
  const {mutateAsync: deleteExtra} = useDeleteExtraRawPo();
  const [newinitialOrderQuanity, setNewInitialOrderQuanity] = useState<{
    [key: string]: number;
  }>({});
  const [extraQty, setExtraQty] = useState<{
    [key: string]: number;
  }>({});

  const [categoryForExtra, setCategoryForExtra] = useState<string[]>([]);

  const isManualChange = useRef<{[key: string]: boolean}>({});

  const [extraPercentage, setExtraPercentage] = useState<{
    [key: string]: number;
  }>({});

  const [combinedList, setCombinedList] = useState([]);

  useEffect(() => {
    if (filteredRawMaterials?.length) {
      const extraQty: {[key: string]: number} = {};
      filteredRawMaterials?.map((item: any) => {
        extraQty[item.id] = item?.extra || 0;
      });
      setExtraQty(extraQty);
    }
  }, [filteredRawMaterials]);

  useEffect(() => {
    if (!filteredRawMaterials?.length) return;
    const categoryPercentage: {[key: string]: number} = {};
    const categorySet = new Set<string>();
    const itemMap: {
      [key: string]: {quantity: number; extra: number; category: string};
    } = {};

    filteredRawMaterials.forEach((item: any) => {
      const id = item.id;
      if (!id) return;

      if (!itemMap[id]) {
        itemMap[id] = {
          quantity: Number(item.quantity) || 0,
          extra: Number(item.extra) || 0,
          category: item.category,
        };
      } else {
        itemMap[id].quantity += Number(item.quantity) || 0;
      }
    });

    Object.values(itemMap).forEach((item) => {
      const {category, quantity, extra} = item;

      if (!category || categorySet.has(category) || !quantity) return;

      categorySet.add(category);

      const percentage = Math.floor((extra / quantity) * 100);
      categoryPercentage[category] = percentage;
    });

    setCategoryForExtra(Array.from(categorySet));
    setExtraPercentage(categoryPercentage);
  }, [filteredRawMaterials]);

  useEffect(() => {
    if (!filteredRawMaterials || !extraRawMaterial?.data) return;

    const extraFilterd = Array.isArray(extraRawMaterial.data)
      ? extraRawMaterial.data.map((raw) => ({
          extraTableId: raw?.id,
          category: raw?.rawMaterial?.category?.name,
          quantity: raw?.quantity,
          inventoryValue: raw?.inventoryValue,
          inventory: raw?.rawMaterial?.inventory,
          maharaj: 'unknown',
          name: raw?.rawMaterial?.name,
          id: raw?.rawMaterial?.id,
          subEvent: 'Extra',
          totalQty: raw?.totalQty,
          unit: raw?.rawMaterial?.unit,
          rawListId: raw?.rawMaterialListId,
        }))
      : [];

    setCombinedList([...filteredRawMaterials, ...extraFilterd]);
  }, [filteredRawMaterials, extraRawMaterial]);

  const remainingRawMaterials = rawMaterialsData?.data?.rawMaterials?.filter(
    (raw) => !filteredRawMaterials.some((f) => f.id === raw.id),
  );

  const formatedRemaning = remainingRawMaterials?.map((raw) => ({
    category: raw?.category?.name,
    id: raw?.id,
    inventory: raw?.inventory,
    maharaj: 'unknown',
    name: raw?.name,
    subEvent: 'Extra',
    unit: raw?.unit,
  }));

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialOrder;
  const role = user?.role;
  const navigate = useNavigate();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [startInventoryValue, setInitialInventoryValue] = useState<{
    [key: string]: number;
  }>({});
  console.log('initial invetory vallueee', startInventoryValue);
  const {mutate: sendExternalVendor} = usePostExternalVendor();
  const [orderQuantities, setOrderQuantities] = useState<{
    [key: string]: number;
  }>({});

  const sortRawMaterials = (
    materials: RawMaterial[] | undefined,
  ): RawMaterial[] => {
    if (!materials) return [];
    return materials?.sort((a, b) =>
      a?.name?.localeCompare(b.name, 'en', {sensitivity: 'base'}),
    );
  };

  const mergedFilteredRawMaterials = useMemo(() => {
    const materialMap: {
      [key: string]: RawMaterial & {
        totalQuantity: number;
        mergedIds: string[];
        subEvents: string[];
      };
    } = {};

    combinedList.forEach((item) => {
      const key = item.id;
      if (!materialMap[key]) {
        materialMap[key] = {
          ...item,
          totalQuantity: 0,
          mergedIds: [],
          subEvents: [],
        };
      }
      materialMap[key].totalQuantity += item.quantity;
      materialMap[key].mergedIds.push(item.id);
      materialMap[key].subEvents.push(item.subEvent.trim());
    });

    return Object.values(materialMap).map((item) => ({
      ...item,
      quantity: item.totalQuantity, // Set quantity to total
      subEvent: [...new Set(item.subEvents)].join(', '), // Join unique subEvents
      orderQuantity: orderQuantities[item.id] || item.totalQuantity,
    }));
  }, [combinedList, orderQuantities]);

  const downloadPDF = async () => {
    try {
      const tableElement = document.querySelector('table');
      if (!tableElement) {
        toast.error('No table found to print');
        return;
      }

      // Clone the original table
      const clonedTable = tableElement.cloneNode(true) as HTMLTableElement;

      // Remove action column (last column)
      clonedTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length > 0) {
          const lastCell = cells[cells.length - 1];
          // Check if it's the action column (contains buttons or has specific class/attribute)
          if (
            lastCell.textContent?.includes('Action') ||
            lastCell.textContent?.includes('Actions') ||
            lastCell.querySelector('button') ||
            lastCell.querySelector('.action-cell')
          ) {
            row.removeChild(lastCell);
          }
        }
      });

      // Convert input fields to plain text values
      clonedTable
        .querySelectorAll('input, select, textarea')
        .forEach((input) => {
          const td = input.closest('td');
          if (td) {
            const value =
              (input as HTMLInputElement).value ||
              (input as HTMLSelectElement).selectedOptions[0]?.text ||
              (input as HTMLTextAreaElement).value;
            td.textContent = value || '';
            // Remove any child elements except the text
            while (td.firstChild) {
              td.removeChild(td.firstChild);
            }
            td.textContent = value || '';
          }
        });

      // Also handle quantity input fields specifically
      clonedTable
        .querySelectorAll('input[type="number"], input[type="text"]')
        .forEach((input) => {
          const parent = input.parentElement;
          if (parent && (parent.tagName === 'TD' || parent.tagName === 'TH')) {
            const value = (input as HTMLInputElement).value;
            parent.textContent = value || '';
          }
        });

      // Ensure table takes full width and looks exactly like on screen
      clonedTable.style.width = '100%';
      clonedTable.style.borderCollapse = 'collapse';
      clonedTable.style.fontSize = '12px';

      // Style the table headers and cells
      clonedTable.querySelectorAll('th').forEach((th) => {
        th.style.backgroundColor = '#1e40af';
        th.style.color = 'white';
        th.style.fontWeight = '600';
        th.style.padding = '10px';
        th.style.border = '1px solid #e5e7eb';
        th.style.textAlign = 'left';
      });

      clonedTable.querySelectorAll('td').forEach((td) => {
        td.style.padding = '8px';
        td.style.border = '1px solid #e5e7eb';
        td.style.textAlign = 'left';
        // Preserve background colors for alternating rows
        const tr = td.closest('tr');
        if (tr && tr.rowIndex % 2 === 0) {
          td.style.backgroundColor = '#f9fafb';
        }
      });

      // Add extra information about totals
      const totalMaterials =
        mergedFilteredRawMaterials.length + mergedMaterials.length;
      const totalQuantity =
        mergedFilteredRawMaterials.reduce(
          (sum: number, material: any) => sum + (material.quantity || 0),
          0,
        ) +
        mergedMaterials.reduce(
          (sum: number, material: any) => sum + (material.quantity || 0),
          0,
        );

      // Create minimal container
      const printContainer = document.createElement('div');
      printContainer.style.cssText = `
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      font-family: Arial, sans-serif;
    `;

      // Add your header
      const header = document.createElement('div');
      header.style.cssText = `
      text-align: center;
      padding: 20px 0 15px 0;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
      margin: 0 0 10px 0;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    `;
      header.innerHTML = `
      <h1 style="margin:0; font-size:28px; font-weight:800;">Raw Materials Order Report</h1>
      <p style="margin:5px 0 0; font-size:15px;">
        From: <strong>${fromDate}</strong> | 
        To: <strong>${toDate}</strong> | 
        Total Materials: <strong>${totalMaterials}</strong> | 
        Total Quantity: <strong>${totalQuantity.toFixed(2)}</strong> | 
        Sub-Events: <strong>${selectedSubEventsCount}</strong>
      </p>
      <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">
        Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      </p>
    `;
      printContainer.appendChild(header);

      // Add summary statistics
      const summary = document.createElement('div');
      summary.style.cssText = `
      margin: 15px 0;
      padding: 10px;
      background: #f1f5f9;
      border-radius: 5px;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      font-size: 14px;
    `;

      // Calculate additional statistics
      const uniqueCategories = new Set([
        ...mergedFilteredRawMaterials.map((m: any) => m.category),
        ...mergedMaterials.map((m: any) => m.rawMaterial?.categoryId),
      ]).size;

      const totalInventory = mergedFilteredRawMaterials.reduce(
        (sum: number, material: any) => sum + (material.inventory || 0),
        0,
      );

      const totalOrderQuantity = totalQuantity - totalInventory;

      printContainer.appendChild(summary);

      printContainer.appendChild(clonedTable);

      // Signature line at bottom
      const signature = document.createElement('div');
      signature.style.cssText = `
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    `;

      const signatureLeft = document.createElement('div');
      signatureLeft.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Prepared By:</div>
      <div style="border-top: 1px solid #374151; width: 200px; padding-top: 8px;">
        ____________________
      </div>
    `;

      const signatureRight = document.createElement('div');
      signatureRight.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Authorized Signature:</div>
      <div style="border-top: 1px solid #374151; width: 200px; padding-top: 8px;">
        ____________________
      </div>
    `;

      signature.appendChild(signatureLeft);
      signature.appendChild(signatureRight);
      printContainer.appendChild(signature);

      // Open print preview — full bleed, no margins
      const printWin = window.open('', '_blank', 'width=1000,height=800');
      if (!printWin) {
        toast.error('Please allow popups for print preview');
        return;
      }

      printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Raw Materials Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              margin: 0;
              padding: 15px;
              background: white;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 10px;
            }
            th, td {
              padding: 8px 6px;
              border: 1px solid #d1d5db;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #1e40af !important;
              color: white !important;
              font-weight: 600;
              position: sticky;
              top: 0;
            }
            tr:nth-child(even) td {
              background-color: #f9fafb;
            }
            .summary-box {
              background: #f1f5f9;
              border-radius: 5px;
              padding: 10px;
              margin: 15px 0;
            }
            @media print {
              body { 
                padding: 5mm !important; 
                margin: 0 !important;
                font-size: 10pt !important;
              }
              @page { 
                margin: 5mm !important;
                size: A4 portrait;
              }
              table {
                font-size: 9pt !important;
              }
              th, td {
                padding: 6px 4px !important;
              }
              /* Force background colors */
              * { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              /* Avoid page breaks inside rows */
              tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 500);
              }, 300);
            }
            
            // Handle print cancellation
            window.addEventListener('afterprint', () => {
              setTimeout(() => {
                window.close();
              }, 300);
            });
          </script>
        </body>
      </html>
    `);

      printWin.document.close();
      toast.success('Print Preview Ready!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate print preview');
    }
  };

  useMemo(() => {
    if (mergedFilteredRawMaterials.length > 0) {
      const uniqueCategories: CategoryOption[] = [];
      const seen = new Set();
      mergedFilteredRawMaterials.forEach((item) => {
        if (item.categoryId && !seen.has(item.categoryId)) {
          seen.add(item.categoryId);
          uniqueCategories.push({
            name: item.category || 'Uncategorized',
            id: item.categoryId,
          });
        }
      });
      setCategoryOptions(uniqueCategories);
    }
  }, [mergedFilteredRawMaterials]);

  useEffect(() => {
    if (filteredRawMaterials) {
      const initialInventory: {[key: string]: number} = {};
      const initialInventoryValue: {[key: string]: number} = {};
      const initialOrderQuantity: {[key: string]: number} = {};

      filteredRawMaterials.forEach((item) => {
        // console.log('itemmmm,,,,', item);

        if (item?.id) {
          initialInventory[item.id] = item.inventory || 0;
          initialInventoryValue[item.id] = item.inventory_value || 0;
          initialOrderQuantity[item.id] =
            (initialOrderQuantity[item.id] ?? 0) + (item.orderQuantity ?? 0);
        }
      });

      setInitialInventoryValue(initialInventoryValue);
    }
  }, [filteredRawMaterials]);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      // Filter dropdown
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCategorySelection = (categoryId: string) => {
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

  const handleQuantityChange = (id: string, value: string) => {
    const numValue = Number(value) || 0;
    setOrderQuantities((prev) => ({
      ...prev,
      [id]: numValue,
    }));
    onQuantityChange(id, value);
  };

  const handleSend = () => {
    // Separate main materials and extra materials
    const mainMaterials = mergedFilteredRawMaterials;
    const extraMaterials = mergedMaterials;
    const updatedData = mainMaterials.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: Number(
        orderQuantities[item.id] ?? item.orderQuantity ?? item.quantity ?? 0,
      ),
      extraQuantity:
        extraQty[item.id] !== undefined
          ? Number(extraQty[item.id].toFixed(2))
          : 0,
      unit: item.unit,
      categoryId: item.categoryId ?? '',
      inventory: Number(item.inventory ?? 0),
      inventory_value: Number(
        startInventoryValue[item.id || ''] ?? item.inventory_value ?? 0,
      ),
    }));

    const allData = [...updatedData];

    sendExternalVendor({
      RMlistId: filteredRawMaterials[0]?.rawListId,
      data: allData,
    });
  };

  const handleInventoryChange = (id: string, value: string) => {
    const currentItem = filteredRawMaterials.find((item) => item.id === id);
    const maxInventory = currentItem?.inventory || 0;
    if (value === '') {
      setInitialInventoryValue((prev) => ({
        ...prev,
        [id]: 0,
      }));
      return;
    }

    const numValue = Number(value);

    if (numValue >= 0 && numValue <= maxInventory) {
      setInitialInventoryValue((prev) => ({
        ...prev,
        [id]: numValue,
      }));
    }
  };

  const calculateColSpan = () => {
    let colSpan = 7; // Name + Category
    if (selectedColumns.totalQuantity) colSpan++;
    if (selectedColumns.inventory) colSpan++;
    if (selectedColumns.orderQuantity) colSpan++;
    return colSpan;
  };

  const renderRowsWithInputs = (
    data: any,
    keyPath: string = '',
    depth: number = 0,
  ): JSX.Element[] => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <tr key={`${keyPath}-${index}`} className="bg-white dark:bg-boxdark">
          <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
            {item.name?.trim()}
            {item.subEvent === 'Extra' && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                (Extra)
              </span>
            )}
          </td>
          {selectedColumns.inventory && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <input
                disabled
                type="number"
                className="w-full bg-white dark:bg-boxdark"
                value={Number(item.inventory || 0).toFixed(0)}
              />
            </td>
          )}
          {selectedColumns.requiredQuantity && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <input
                disabled
                type="number"
                className="w-full bg-white dark:bg-boxdark"
                defaultValue={Number(item.quantity).toFixed(
                  item.quantity % 1 === 0 ? 0 : 1,
                )}
              />
            </td>
          )}

          {selectedColumns.extraQuantity && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <input
                type="number"
                className="w-full bg-white dark:bg-boxdark"
                value={
                  extraQty[item.id] !== undefined
                    ? Number(extraQty[item.id].toFixed(2))
                    : 0
                }
                readOnly
              />
            </td>
          )}
          {selectedColumns.totalQuantity && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <input
                type="number"
                className="w-full bg-white dark:bg-boxdark"
                value={Number(
                  (
                    Number(item.quantity) +
                    (extraQty[item.id] ? extraQty[item.id] : 0)
                  ).toFixed(item.quantity % 1 === 0 ? 0 : 1),
                )}
                readOnly
              />
            </td>
          )}

          {selectedColumns.orderQuantity && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="mt-2 w-24 rounded-md border border-stroke px-2 py-1 dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  defaultValue={
                    newinitialOrderQuanity[item.id] !== undefined
                      ? Number(
                          newinitialOrderQuanity[item.id].toFixed(
                            newinitialOrderQuanity[item.id] % 1 === 0 ? 0 : 1,
                          ),
                        )
                      : ''
                  }
                  onChange={(e) =>
                    handleQuantityChange(item.id || '', e.target.value)
                  }
                />
                <span className="text-gray-600 dark:text-gray-300 min-w-[80px] whitespace-nowrap text-sm">
                  {item.unit}
                </span>
              </div>
            </td>
          )}
          <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
            <input
              type="number"
              className="mt-2 w-24 rounded-md border border-stroke px-2 py-1 dark:border-strokedark dark:bg-meta-4 dark:text-white"
              value={(() => {
                const calculated = Number(
                  (
                    Number(item.quantity) +
                    (extraQty[item.id] ? extraQty[item.id] : 0)
                  ).toFixed(item.quantity % 1 === 0 ? 0 : 1),
                );

                const inventory = Number(item.inventory ?? 0);

                return calculated < inventory ? calculated : inventory;
              })()}
              onChange={(e) =>
                handleInventoryChange(item.id || '', e.target.value)
              }
            />
          </td>

          {item.subEvent === 'Extra' && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <button
                className="text-sm font-semibold text-red-600 hover:text-red-800"
                onClick={() => deleteExtra(item?.extraTableId)}
              >
                Delete
              </button>
            </td>
          )}
        </tr>
      ));
    } else {
      const rows: JSX.Element[] = [];

      Object.keys(data).forEach((groupKey) => {
        const currentPath = keyPath ? `${keyPath}-${groupKey}` : groupKey;
        const isExpanded =
          currentPath in expanded ? expanded[currentPath] : true;
        const isCategory = filters.subEvent && filters.category && depth === 1;

        rows.push(
          <tr
            key={currentPath}
            className="cursor-pointer bg-gray dark:bg-black"
            onClick={() => onToggleExpand(currentPath)}
          >
            <td
              colSpan={8}
              className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white"
              style={{paddingLeft: isCategory ? '2rem' : '1rem'}}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">
                    {isExpanded ? <FaAngleDown /> : <FaAngleRight />}
                  </span>
                  <span className="mr-4">{groupKey}</span>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    placeholder="Enter value (%)"
                    defaultValue={extraPercentage[groupKey]}
                    className="w-18 rounded border-[1.7px] border-stroke bg-transparent px-3 py-0.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={(e) =>
                      setExtraPercentage((prev) => ({
                        ...prev,
                        [groupKey]: Number(e.target.value),
                      }))
                    }
                  />
                  <span>%</span>
                  <button
                    className="rounded bg-primary px-3 py-1 text-sm text-white"
                    onClick={() => {
                      setCategoryForExtra((prev) => [...prev, groupKey]);
                      toast.success(
                        `${extraPercentage[groupKey]}% for ${groupKey} added successfully`,
                      );
                    }}
                  >
                    Extra
                  </button>
                </div>
              </div>
            </td>
          </tr>,
        );

        if (isExpanded) {
          rows.push(
            ...renderRowsWithInputs(data[groupKey], currentPath, depth + 1),
          );
        }
      });

      return rows;
    }
  };

  const getGroupedMergedData = useMemo(() => {
    let baseData = sortRawMaterials(mergedFilteredRawMaterials);

    if (selectedCategoryIds.length > 0) {
      baseData = baseData.filter(
        (item) =>
          item.categoryId && selectedCategoryIds.includes(item.categoryId),
      );
    }

    if (baseData.length === 0) return null;

    const applyEvent = filters.event;
    const applySubEvent = filters.subEvent;
    const applyCategory = filters.category;

    if (!applyEvent && !applySubEvent && !applyCategory) {
      return baseData;
    }

    let eventGroup: {[event: string]: RawMaterial[]} = {};

    if (applyEvent) {
      baseData.forEach((item) => {
        const eventName = item.eventName?.trim() || 'Unassigned Event';
        if (!eventGroup[eventName]) eventGroup[eventName] = [];
        eventGroup[eventName].push(item);
      });
    } else {
      // If event grouping is not applied, treat all data as one "default" group
      eventGroup['All Events'] = baseData;
    }

    // -------------------------------
    // 🔥 SUBEVENT GROUPING (inside each event if enabled)
    // -------------------------------
    const groupBySubEvent = (items: RawMaterial[]) => {
      const subEventGroup: {[subEvent: string]: RawMaterial[]} = {};

      items.forEach((item) => {
        let subEvents: string[] = [];

        if (Array.isArray(item.subEvents) && item.subEvents.length > 0) {
          subEvents = item.subEvents.map((s) => s.trim());
        } else if (item.subEvent) {
          subEvents = item.subEvent.split(',').map((s) => s.trim());
        }

        // If no subEvent, use 'Unassigned SubEvent'
        if (subEvents.length === 0) subEvents = ['Unassigned SubEvent'];

        subEvents.forEach((sub) => {
          if (!subEventGroup[sub]) subEventGroup[sub] = [];
          subEventGroup[sub].push(item);
        });
      });

      return subEventGroup;
    };

    // -------------------------------
    // 🔥 CATEGORY GROUPING (helper)
    // -------------------------------
    const groupByCategory = (items: RawMaterial[]) => {
      const catGroup: any = {};

      items.forEach((item) => {
        const catName = item.category?.trim() || 'Uncategorized';
        if (!catGroup[catName]) catGroup[catName] = [];
        catGroup[catName].push(item);
      });

      // Sort categories alphabetically
      return Object.keys(catGroup)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = catGroup[key];
          return acc;
        }, {});
    };

    // -------------------------------
    // 🔥 FINAL GROUPING
    // -------------------------------
    const finalResult: any = {};

    Object.keys(eventGroup).forEach((eventKey) => {
      let data = eventGroup[eventKey];

      if (applySubEvent) {
        const subEventGrouped = groupBySubEvent(data);

        if (applyCategory) {
          // Event → SubEvent → Category
          finalResult[eventKey] = {};
          Object.keys(subEventGrouped).forEach((subKey) => {
            finalResult[eventKey][subKey] = groupByCategory(
              subEventGrouped[subKey],
            );
          });
        } else {
          // Event → SubEvent
          finalResult[eventKey] = subEventGrouped;
        }
      } else if (applyCategory) {
        // Event → Category
        finalResult[eventKey] = groupByCategory(data);
      } else {
        // Event only
        finalResult[eventKey] = data;
      }
    });

    return finalResult;
  }, [mergedFilteredRawMaterials, selectedCategoryIds, filters]);

  useEffect(() => {
    if (!getGroupedMergedData) return;

    const inventoryMap: Record<string, number> = {};

    Object.values(getGroupedMergedData).forEach((event: any) => {
      if (!event || typeof event !== 'object') return;

      Object.values(event).forEach((items: any[]) => {
        if (!Array.isArray(items)) return;

        items.forEach((item) => {
          if (!item?.id) return;

          const calculated = Number(
            (Number(item.quantity) + (extraQty[item.id] ?? 0)).toFixed(
              item.quantity % 1 === 0 ? 0 : 1,
            ),
          );

          const inventory = Number(item.inventory ?? 0);
          inventoryMap[item.id] =
            calculated < inventory ? calculated : inventory;
        });
      });
    });

    setInitialInventoryValue(inventoryMap);
  }, [getGroupedMergedData, extraQty]);

  useEffect(() => {
    if (!getGroupedMergedData) return;
    setNewInitialOrderQuanity((prev) => {
      const updated = {...prev};

      Object.values(getGroupedMergedData).forEach((categoryObject: any) => {
        if (!categoryObject || typeof categoryObject !== 'object') return;

        Object.values(categoryObject).forEach((items: any) => {
          if (!Array.isArray(items)) return;

          items.forEach((item: any) => {
            const id = item.id;
            if (isManualChange.current[id]) return;
            const baseQty = Number(item.quantity ?? 0);
            const inventory = Number(item.inventory ?? 0);
            const extra = Number(extraQty[id] ?? 0);
            const calculated = baseQty + extra - inventory;
            updated[id] = Number(Math.max(0, calculated).toFixed(4));
          });
        });
      });

      return updated;
    });
  }, [getGroupedMergedData, extraQty, extraPercentage]);

  console.log('grouppppp', getGroupedMergedData);

  useEffect(() => {
    if (!categoryForExtra?.length) return;
    const qtyMap: {[key: string]: number} = {};
    categoryForExtra.forEach((category) => {
      const categoryItems = getGroupedMergedData?.['All Events']?.[category];
      if (!Array.isArray(categoryItems)) return;

      const percentage = Number(extraPercentage?.[category]) || 0;
      categoryItems.forEach((item: any) => {
        const quantity = Number(item.quantity) || 0;

        qtyMap[item.id] = (quantity * percentage) / 100;
      });
    });
    setExtraQty(qtyMap);
  }, [categoryForExtra, getGroupedMergedData, extraPercentage]);

  return (
    <>
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Raw Materials</h1>
            <p className="text-blue-100">
              {fromDate} to {toDate}
            </p>
          </div>
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
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Desktop header - hidden on mobile */}
                    <h4 className="text-gray-800 mb-3 hidden text-sm font-semibold dark:text-white md:block">
                      Filter Options
                    </h4>

                    <div className="space-y-4 md:space-y-3">
                      {/* Event Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Group event
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={filters.event}
                            onChange={() =>
                              onFiltersChange((prev) => ({
                                ...prev,
                                event: !prev.event,
                              }))
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Group by Sub-Event
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={filters.subEvent}
                            onChange={() =>
                              onFiltersChange((prev) => ({
                                ...prev,
                                subEvent: !prev.subEvent,
                              }))
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Group by Category
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={filters.category}
                            onChange={() =>
                              onFiltersChange((prev) => ({
                                ...prev,
                                category: !prev.category,
                              }))
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>

                      {/* Inventory Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Show Inventory
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={selectedColumns.inventory}
                            onChange={() =>
                              onToggleColumnSelection('inventory')
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Show Total Quantity
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={selectedColumns.totalQuantity}
                            onChange={() =>
                              onToggleColumnSelection('totalQuantity')
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Show Order Quantity
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={selectedColumns.orderQuantity}
                            onChange={() =>
                              onToggleColumnSelection('orderQuantity')
                            }
                            className="peer sr-only"
                          />
                          <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                        </label>
                      </div>

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

            {(mergedFilteredRawMaterials.length > 0 ||
              mergedMaterials.length > 0) && (
              <button
                onClick={downloadPDF}
                className="flex items-center gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
              >
                <FiDownload className="h-4 w-4" />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {isRawLoading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      )}

      {!isRawLoading &&
        (mergedFilteredRawMaterials.length > 0 ||
          mergedMaterials.length > 0) && (
          <>
            <div className="mb-8 mt-6 overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
              <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
                <h3 className="text-gray-800 font-semibold dark:text-white">
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
                        Name
                      </th>
                      {selectedColumns.inventory && (
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-semibold"
                        >
                          Inventory
                        </th>
                      )}
                      {selectedColumns.requiredQuantity && (
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-semibold"
                        >
                          Required Qty
                        </th>
                      )}

                      {selectedColumns.extraQuantity && (
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-semibold"
                        >
                          Extra Qty
                        </th>
                      )}
                      {selectedColumns?.totalQuantity && (
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-semibold"
                        >
                          Total Qty
                        </th>
                      )}

                      {selectedColumns.orderQuantity && (
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-semibold"
                        >
                          Order Quantity
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Inventory Value
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                    {getGroupedMergedData ? (
                      renderRowsWithInputs(getGroupedMergedData)
                    ) : (
                      <tr>
                        <td
                          colSpan={calculateColSpan()}
                          className="text-gray-500 dark:text-gray-400 px-4 py-6 text-center"
                        >
                          {searchQuery
                            ? 'No materials match your filters'
                            : isRawSuccess &&
                                mergedFilteredRawMaterials.length === 0
                              ? 'No raw material data available for selected date range'
                              : 'Generate report to view data'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extra Raw Materials Section */}
            <div className="mb-8 rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-gray-800 mb-6 flex items-center gap-2 text-lg font-semibold dark:text-white">
                Extra Raw Materials
              </h3>

              <div className="mb-4">
                <ExtraRawMaterialForPo
                  data={formatedRemaning}
                  rawListId={filteredRawMaterials[0]?.rawListId}
                />
              </div>
            </div>
          </>
        )}

      {!isRawLoading &&
        mergedFilteredRawMaterials.length === 0 &&
        mergedMaterials.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No raw material data available. Please generate a report first.
            </p>
          </div>
        )}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4"></div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {categoryOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  ref={dropdownButtonRef}
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-meta-4 dark:text-white"
                >
                  <span>
                    {selectedCategoryIds.length > 0
                      ? `${selectedCategoryIds.length} category(ies) selected`
                      : 'All Categories'}
                  </span>
                  <FaAngleDown
                    className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isCategoryDropdownOpen && (
                  <div
                    className="border-gray-200 dark:bg-gray-800 dark:border-gray-700 absolute bottom-full left-0 z-50 mb-1 w-64 rounded-md border bg-white shadow-lg dark:bg-meta-4"
                    style={{
                      bottom: dropdownButtonRef.current
                        ? window.innerHeight -
                            dropdownButtonRef.current.getBoundingClientRect()
                              .bottom <
                          300
                          ? '100%'
                          : 'auto'
                        : 'auto',
                      top: dropdownButtonRef.current
                        ? window.innerHeight -
                            dropdownButtonRef.current.getBoundingClientRect()
                              .bottom >=
                          300
                          ? '100%'
                          : 'auto'
                        : '100%',
                    }}
                  >
                    <div className="p-2">
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
                        style={{maxHeight: '200px'}}
                      >
                        {categoryOptions.map((category) => (
                          <label
                            key={category.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center rounded px-2 py-2"
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
                              className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300 ml-3 text-sm">
                              {category.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <div className="flex items-end justify-end">
              <button
                onClick={() => {
                  handleSend();
                }}
                className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PoRawMaterialOrder;
