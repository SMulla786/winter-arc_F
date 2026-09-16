/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {
  useDeleteAddedRawmaterialForSubevent,
  useGetNewRawMaterialsFroSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetEventRawMaterial,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {usePostExternalVendor} from '@/lib/react-query/queriesAndMutations/cateror/external';
import {shareLinkSchema} from '@/lib/validation/vendorSchema';
import {Route} from '@/routes/_app/_event/events.$id';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from '@tanstack/react-router';
import 'jspdf-autotable';
import React, {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaAngleDown,
  FaAngleRight,
  FaFileInvoice,
  FaFilter,
  FaShare,
  FaTimes,
} from 'react-icons/fa';
import {Loader} from '../Loader/Loader';
import ExtraRawmaterial from './ExtraRawmaterial';
import RedDishesShow from './RawMaterialComponents/RedDishesShow';

interface RawMaterial {
  quantity: number;
  maharaj: string;
  rawMaterialId: string;
  name: string;
  unit: string;
  subEvent: string;
  categoryId: string;
  categoryName?: string | null;
  category?: string | null;
  inventory?: number;
  inventory_value?: number;
  id?: string;
  subEventId?: string;
  price?: number;
  total_price?: number;
  peopleType?: string;
  people?: number;
  baselinePeople?: number;
  orderQuantity?: number;
  inventoryQuantity?: number;
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
    category?: string;
  };
}

interface FormattedData {
  unformatedRawMaterials: RawMaterial[];
  maharajList: string[];
  subEventNameList: string[];
  formatedRawMaterials: RawMaterial[];
  subEventMaharajwiseRawMaterials: {
    [subEvent: string]: RawMaterial[];
  };
  maharajSubEventwiseRawMaterials: {
    [maharaj: string]: RawMaterial[];
  };
}

// Define a type for category options
interface CategoryOption {
  id: string;
  name: string;
}

const RawMaterialOrderrrr: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialOrder;
  const role = user?.role;
  const {id: EventId} = Route.useParams();
  const {data: vendorData, isLoading} = useGetEventRawMaterial(EventId);
  const {data: eventData} = useGetSubevent(EventId);
  const {mutateAsync: deleteRawMaterialForSubevent} =
    useDeleteAddedRawmaterialForSubevent();
  const {
    data: extraAddedRawmaterials,
    refetch: refetchExtraRawMaterials,
    isLoading: isLoadingExtraMaterials,
  } = useGetNewRawMaterialsFroSubevent(EventId);

  const fetchMaterials = () => {
    refetchExtraRawMaterials();
  };

  const {mutate: sendExternalVendor} = usePostExternalVendor();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [extraMaterials, setExtraMaterials] = useState<ExtraRawMaterial[]>([]);

  // Generate registration link with selected category IDs
  const generateVendorLink = () => {
    const baseUrl = `${import.meta.env.VITE_EXTERNAL_VENDOR_BASE_URL}${user?.fullname.replace(/\s/g, '_')}/${user?.caterorId}/${EventId}`;
    if (selectedCategoryIds && selectedCategoryIds.length > 0) {
      const url = new URL(baseUrl);
      url.searchParams.set('categories', selectedCategoryIds.join(','));
      return url.toString();
    }
    return baseUrl;
  };

  const registrationLink = generateVendorLink();
  const methods = useForm({
    resolver: zodResolver(shareLinkSchema),
    defaultValues: {
      EventId: EventId,
      sponsorId: user?.caterorId,
      link: registrationLink,
    },
  });

  const [rawMaterial, setRawMaterial] = useState<FormattedData | null>(null);
  const [filters, setFilters] = useState({
    subEvent: false,
    maharaj: false,
    category: true,
  });
  const [selectedMaharaj, setSelectedMaharaj] = useState<string | null>(null);
  const [startInventoryValue, setInitialInventoryValue] = useState<{
    [key: string]: number;
  }>({});
  const [initialOrderQuanity, setInitialOrderQuanity] = useState<{
    [key: string]: number;
  }>({});
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  const [selectedColumns, setSelectedColumns] = useState({
    inventory: true,
    inventory_value: true,
    totalQuantity: true,
    orderQuantity: true,
    extra: false,
  });
  const [inventoryQuantities, setInventoryQuantities] = useState<{
    [key: string]: string | number;
  }>({});
  const [inventoryValue, setInventoryValue] = useState<{
    [key: string]: string | number;
  }>({});

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const inventoryValues: {[key: string]: number} = {};

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Category dropdown
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

  const sortRawMaterials = (
    materials: RawMaterial[] | undefined,
  ): RawMaterial[] => {
    if (!materials) return [];
    return materials?.sort((a, b) =>
      a?.name?.localeCompare(b.name, 'en', {sensitivity: 'base'}),
    );
  };

  console.log('all raw materiall', vendorData?.data?.formatedRawMaterials);
  useEffect(() => {
    if (vendorData?.data) {
      const sortedMaterials = sortRawMaterials(
        vendorData.data.formatedRawMaterials,
      );
      if (sortedMaterials && sortedMaterials.length > 0) {
        // create unique categories
        const uniqueCategories: CategoryOption[] = [];
        const seen = new Set();
        sortedMaterials.forEach((item) => {
          if (!seen.has(item.categoryId)) {
            seen.add(item.categoryId);
            uniqueCategories.push({
              name: item.category,
              id: item.categoryId,
            });
          }
        });
        setCategoryOptions(uniqueCategories);
      }
    }
  }, [vendorData]);

  const navigate = useNavigate();

  useEffect(() => {
    if (vendorData?.data) {
      const sortedMaterials = sortRawMaterials(
        vendorData.data.formatedRawMaterials,
      );
      setRawMaterial({
        ...vendorData.data,
        formatedRawMaterials: sortedMaterials,
      });

      const initialInventory: {[key: string]: number} = {};
      const initialInventoryValue: {[key: string]: number} = {};
      const initialOrderQuantity: {[key: string]: number} = {};

      sortedMaterials.forEach((item) => {
        if (item?.id) {
          initialInventory[item.id] = item.inventory || 0;
          initialInventoryValue[item.id] = item.inventory_value || 0;
          initialOrderQuantity[item.id] = item.orderQuantity || 0;
        }
      });

      if (extraAddedRawmaterials?.data) {
        extraAddedRawmaterials.data.forEach((item) => {
          if (item?.id) {
            initialOrderQuantity[item.id] = item.quantity || 0;
          }
        });
      }

      setInventoryQuantities(initialInventory);
      setInitialInventoryValue(initialInventoryValue);
      setInitialOrderQuanity(initialOrderQuantity);
    }
  }, [
    vendorData,
    vendorData?.data?.formatedRawMaterials,
    extraAddedRawmaterials?.data,
  ]);

  const toggleColumnSelection = (column: keyof typeof selectedColumns) => {
    setSelectedColumns((prev) => ({...prev, [column]: !prev[column]}));
  };

  const toggleExpand = (keyPath: string) => {
    setExpanded((prev) => ({...prev, [keyPath]: !prev[keyPath]}));
  };

  const handleInventoryChange = (id: string, value: string) => {
    setInitialInventoryValue((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleQuantityChange = (id: string, value: string) => {
    setInitialOrderQuanity((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const getGroupedData = () => {
    if (!rawMaterial) return null;
    let baseData = [...rawMaterial.formatedRawMaterials];

    if (
      extraAddedRawmaterials?.data &&
      extraAddedRawmaterials.data.length > 0
    ) {
      const extraMaterials: RawMaterial[] = extraAddedRawmaterials.data.map(
        (item) => ({
          id: item.id,
          rawMaterialId: item.rawMaterialId,
          name: item.rawMaterial.name,
          unit: item.rawMaterial.unit,
          categoryId: item.rawMaterial.categoryId,
          category: item.rawMaterial.category?.name,
          quantity: item.totalQty,
          inventory: item.rawMaterial?.inventory,
          inventory_value: item?.inventory,
          orderQuantity: initialOrderQuanity[item.id] || item.quantity,
          subEvent: 'Extra',
          maharaj: 'Extra',
          peopleType: 'extra',
        }),
      );
      baseData = [...baseData, ...extraMaterials];
    }

    if (selectedCategoryIds.length > 0) {
      baseData = baseData.filter(
        (item) =>
          item.categoryId && selectedCategoryIds.includes(item.categoryId),
      );
    }

    let groupedData: any = {};

    // Helper function to clamp inventory to 0 if negative
    const getClampedInventory = (item: RawMaterial) => {
      const inventoryValue =
        Number(inventoryQuantities[item?.id || '']) || item?.inventory || 0;
      return inventoryValue < 0 ? 0 : inventoryValue;
    };

    // Helper function to compute regular, total, and extra quantities

    const computeMaterialQuantities = (items: RawMaterial[]): any[] => {
      const materialMap: {
        [key: string]: {
          regular: number;
          total: number;
          extra: number;
          item: RawMaterial;
        };
      } = {};
      console.log('all itemsss', items);

      items.forEach((item) => {
        const key = item.id || item.name;
        if (!materialMap[key]) {
          materialMap[key] = {
            regular: 0,
            total: 0,
            extra: 0,
            item: {
              ...item,
              quantity: 0,
              orderQuantity: item.orderQuantity || 0,
            },
          };
        }

        if (item.peopleType === 'extra') {
          materialMap[key].extra = item.quantity;
          materialMap[key].total = item.quantity;
          materialMap[key].item.orderQuantity =
            item.orderQuantity || item.quantity;
        } else if (item.peopleType === 'expected') {
          materialMap[key].regular = item.quantity;
          materialMap[key].item.orderQuantity =
            item.orderQuantity || item.quantity;
        } else if (item.peopleType === 'preparation') {
          materialMap[key].total = item?.orderQuantity || item.quantity;
          // materialMap[key].item.orderQuantity = item.orderQuantity || 0;
        }

        // Copy common fields from the first item
        materialMap[key].item.name = item.name;
        materialMap[key].item.unit = item.unit;
        materialMap[key].item.category = item.category;
        materialMap[key].item.categoryId = item.categoryId;
        materialMap[key].item.subEvent = item.subEvent;
        materialMap[key].item.maharaj = item.maharaj;
        materialMap[key].item.inventory = getClampedInventory(item);
        materialMap[key].item.peopleType = item.peopleType;
      });

      return Object.values(materialMap).map((m) => ({
        ...m.item,
        quantity: m.total,
        regularQuantity: m.regular,
        extraQuantity: m.extra,
      }));
    };

    if (filters.subEvent && filters.maharaj) {
      const subEventMaharajGroup: {
        [subEvent: string]: {[maharaj: string]: RawMaterial[]};
      } = {};
      baseData.forEach((item) => {
        const subEvent = item.subEvent;
        const maharaj = item.maharaj;
        if (!subEventMaharajGroup[subEvent])
          subEventMaharajGroup[subEvent] = {};
        if (!subEventMaharajGroup[subEvent][maharaj])
          subEventMaharajGroup[subEvent][maharaj] = [];
        subEventMaharajGroup[subEvent][maharaj].push({
          ...item,
          inventory: getClampedInventory(item),
        });
      });

      Object.keys(subEventMaharajGroup).forEach((subEvent) => {
        Object.keys(subEventMaharajGroup[subEvent]).forEach((maharaj) => {
          subEventMaharajGroup[subEvent][maharaj] = computeMaterialQuantities(
            subEventMaharajGroup[subEvent][maharaj],
          );
        });
      });
      groupedData = subEventMaharajGroup;
    } else if (filters.subEvent) {
      // Group only by sub-event
      const subEventGroup: {[subEvent: string]: RawMaterial[]} = {};
      baseData.forEach((item) => {
        if (!subEventGroup[item.subEvent]) subEventGroup[item.subEvent] = [];
        subEventGroup[item.subEvent].push({
          ...item,
          inventory: getClampedInventory(item),
        });
      });

      Object.keys(subEventGroup).forEach((subEvent) => {
        subEventGroup[subEvent] = computeMaterialQuantities(
          subEventGroup[subEvent],
        );
      });
      groupedData = subEventGroup;
    } else if (filters.maharaj) {
      // Group only by Maharaj
      if (selectedMaharaj) {
        // Specific Maharaj selected: compute quantities for this Maharaj
        const maharajItems = baseData
          .filter((item) => item.maharaj === selectedMaharaj)
          .map((item) => ({
            ...item,
            inventory: getClampedInventory(item),
          }));
        groupedData[selectedMaharaj] = computeMaterialQuantities(maharajItems);
      } else {
        // All Maharajs: group by Maharaj without merging across Maharajs
        rawMaterial.maharajList.forEach((maharaj) => {
          const maharajItems = baseData
            .filter((item) => item.maharaj === maharaj)
            .map((item) => ({
              ...item,
              inventory: getClampedInventory(item),
            }));
          groupedData[maharaj] = computeMaterialQuantities(maharajItems);
        });
      }
    } else {
      // No Maharaj or sub-event filters: compute quantities
      groupedData = computeMaterialQuantities(
        baseData.map((item) => ({
          ...item,
          inventory: getClampedInventory(item),
        })),
      );
    }

    // Apply category grouping if enabled
    if (filters.category) {
      const groupByCategoryName = (dataToGroup: any): any => {
        if (Array.isArray(dataToGroup)) {
          const catGroup: any = {};
          dataToGroup.forEach((item: RawMaterial) => {
            const catName = item.category?.trim() || 'Uncategorized';
            if (!catGroup[catName]) catGroup[catName] = [];
            catGroup[catName].push(item);
          });
          return catGroup;
        } else {
          const result: any = {};
          Object.keys(dataToGroup).forEach((key) => {
            result[key] = groupByCategoryName(dataToGroup[key]);
          });
          return result;
        }
      };
      groupedData = groupByCategoryName(groupedData);
    }
    return groupedData;
  };

  const groupedData = getGroupedData();

  const handleSend = (eventId: string, data: RawMaterial[]) => {
    // Separate main materials and extra materials
    const mainMaterials = data.filter((item) => item.peopleType !== 'extra');
    const extraMaterials = data.filter((item) => item.peopleType === 'extra');

    const updatedData = mainMaterials.map((item) => ({
      id: item.id,
      rawMaterialId: item.rawMaterialId ?? item.id,
      name: item.name,
      quantity: Number(
        initialOrderQuanity[item.id || ''] ?? item.quantity ?? 0,
      ),
      unit: item.unit,
      categoryId: item.categoryId ?? '',
      inventory: Number(
        inventoryQuantities[item.id || ''] ?? item.inventory ?? 0,
      ),
      inventory_value: Number(
        startInventoryValue[item.id || ''] ?? item.inventory_value ?? 0,
      ),
    }));

    // Process extra materials
    const extraData = extraAddedRawmaterials?.data?.map((item: any) => ({
      id: item?.rawMaterial?.id,
      rawMaterialId: item?.rawMaterial?.id,
      name: item?.rawMaterial?.name,
      quantity: item?.quantity ?? 0,
      unit: item?.rawMaterial?.name,
      categoryId: item?.rawMaterial?.categoryId,
      inventory: 0,
      inventory_value: 0,
    }));

    const allData = [...updatedData, ...extraData];
    sendExternalVendor({eventId, data: allData});
  };

  const handleDeleteExtraMaterial = (id: string) => {
    deleteRawMaterialForSubevent(id);
    fetchMaterials();
  };

  const renderRows = (
    data: any,
    keyPath: string = '',
    depth: number = 0,
  ): JSX.Element[] => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <tr key={`${keyPath}-${index}`} className="bg-white dark:bg-boxdark">
          <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
            {item.name?.trim()}
            {item.peopleType === 'extra' && (
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
                value={
                  item.peopleType === 'extra'
                    ? 0
                    : Number(inventoryQuantities[item.id || '']) || 0
                }
              />
            </td>
          )}
          {selectedColumns.totalQuantity && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <input
                disabled
                type="number"
                className="w-full bg-white dark:bg-boxdark"
                value={Number(item.quantity).toFixed(
                  item.quantity % 1 === 0 ? 0 : 1,
                )}
              />
            </td>
          )}
          {selectedColumns.extra && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <input
                disabled
                type="number"
                className="w-full bg-white dark:bg-boxdark"
                value={Number(item.extraQuantity || 0).toFixed(
                  (item.extraQuantity || 0) % 1 === 0 ? 0 : 1,
                )}
              />
            </td>
          )}
          {selectedColumns.orderQuantity && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="mt-2 w-24 rounded-md border border-stroke px-2 py-1 dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  value={Number(
                    initialOrderQuanity[item.id || ''] || item.quantity,
                  ).toFixed(
                    (initialOrderQuanity[item.id || ''] || item.quantity) %
                      1 ===
                      0
                      ? 0
                      : 1,
                  )}
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
              value={
                item.peopleType === 'extra'
                  ? 0
                  : Number(inventoryQuantities[item.id || ''] || 0)
              }
              onChange={(e) =>
                handleInventoryChange(item.id || '', e.target.value)
              }
              disabled={item.peopleType === 'extra'}
            />
          </td>

          {/* Show delete button only for extra materials */}
          {item.peopleType === 'extra' && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              <button
                type="button"
                className="text-red-600 hover:text-red-800 dark:text-red-400"
                onClick={() => handleDeleteExtraMaterial(item.id)}
              >
                Delete
              </button>
            </td>
          )}
          {item.peopleType !== 'extra' && (
            <td className="w-1/5 border-stroke px-4 py-2 dark:border-strokedark">
              {/* Empty cell for non-extra materials */}
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
            onClick={() => toggleExpand(currentPath)}
          >
            <td
              colSpan={selectedColumns.extra ? 7 : 6}
              className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white"
              style={{paddingLeft: isCategory ? '2rem' : '1rem'}}
            >
              <div className="flex w-full items-center">
                <span className="mr-2">
                  {isExpanded ? <FaAngleDown /> : <FaAngleRight />}
                </span>
                <span className="mr-4">{groupKey}</span>
              </div>
            </td>
          </tr>,
        );
        if (isExpanded) {
          rows.push(...renderRows(data[groupKey], currentPath, depth + 1));
        }
      });
      return rows;
    }
  };

  const handleDownloadPDF = () => {
    if (!groupedData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get all raw materials data in a flat array for distribution
    const allRawMaterials = flattenGroupedData(groupedData);
    const hasExtraMaterials = extraAddedRawmaterials?.data?.length > 0;

    // Split raw materials into two halves for left and right tables
    const midPoint = Math.ceil(allRawMaterials.length / 2);
    const leftTableMaterials = allRawMaterials.slice(0, midPoint);
    const rightTableMaterials = allRawMaterials.slice(midPoint);

    const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RAW MATERIAL LIST</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 5px;
          color: #000000;
          font-size: 12px;
          line-height: 1.2;
        }
        .main-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 3px 0;
          color: #000000;
        }
        .caterer-info {
          padding: 3px;
          border: 1px solid #0D47A1;
          text-align: center;
          margin-bottom: 3px;
        }
        .summary {
          background: #f8f9fa;
          padding: 3px;
          margin-bottom: 5px;
          text-align: center;
          color: #000000;
          font-size: 11px;
          font-weight: bold;
        }
        .tables-container {
          display: flex;
          gap: 8px;
          width: 100%;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
        .table-column {
          flex: 1;
          margin: 0;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 8px 0;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #444;
          padding: 3px;
          text-align: center;
          vertical-align: middle;
          line-height: 1.2;
        }
        th {
          background-color: #1E3A8A;
          color: #ffffff;
          font-weight: bold;
          font-size: 11px;
          padding: 4px;
        }
        td {
          color: #000000;
          font-weight: 600;
          background-color: #ffffff;
          font-size: 11px;
          padding: 3px;
        }
        .row-even {
          background-color: #ffffff;
        }
        .row-odd {
          background-color: #f8f9fa;
        }
        .group-header {
          padding: 3px 5px;
          margin: 3px 0;
          background-color: #e3f2fd;
          border-left: 2px solid #2196f3;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          color: #000000;
          line-height: 1.2;
        }
        .sub-group-header {
          padding: 2px 5px;
          margin: 2px 0 2px 6px;
          background-color: #f3e5f5;
          border-left: 2px solid #9c27b0;
          text-align: left;
          font-weight: bold;
          font-size: 10px;
          color: #000000;
          line-height: 1.2;
        }
        .section-title {
          font-weight: bold;
          margin: 5px 0 3px 0;
          color: #000000;
          border-bottom: 1px solid #1E3A8A;
          padding-bottom: 2px;
          font-size: 12px;
          text-align: center;
          line-height: 1.2;
        }
        .extra-section-title {
          font-weight: bold;
          margin: 5px 0 3px 0;
          color: #000000;
          border-bottom: 1px solid #FF6B35;
          padding-bottom: 2px;
          font-size: 12px;
          text-align: center;
          line-height: 1.2;
        }
        .empty-table-message {
          text-align: center;
          color: #666;
          font-style: italic;
          font-size: 11px;
          padding: 20px;
          line-height:1.2;
        }

        @media print {
          body {
            margin: 0;
            padding: 5px;
          }
          .no-print { display: none; }
          table {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>

      <!-- Caterer Header -->
      <div class="caterer-info">
        <h1 style="margin:0; font-weight:800; font-size:14px; color:#000000; line-height:1.2;">
          ${user?.fullname || 'Caterer Name'}
        </h1>
        <div style="background:#0D47A1; height:1px; margin:2px auto; width:50%;"></div>
        <p style="margin:0; font-size:10px; font-weight:bold; color:#000000; line-height:1.2;">
          ${user?.address || ''} ${user?.email ? `| ${user.email} |` : ''} ${user?.phoneNumber || ''}
        </p>
      </div>
      <!-- Event Summary -->
      <div class="summary">
        <strong>${eventData?.data.name || 'N/A'}</strong> |
        ${new Date(eventData?.data.startDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })} - ${new Date(eventData?.data.endDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </div>
      <div class="tables-container">
        <!-- Left Column - Raw Materials Part 1 -->
        <div class="table-column">
          ${
            leftTableMaterials.length > 0
              ? `
            ${renderMaterialsTableHTML(leftTableMaterials)}
          `
              : `
            <div class="empty-table-message">
              No raw materials data available
            </div>
          `
          }
        </div>
        <!-- Right Column - Raw Materials Part 2 OR Additional Items -->
        <div class="table-column">
          ${
            rightTableMaterials.length > 0
              ? `
            ${renderMaterialsTableHTML(rightTableMaterials)}
            ${
              hasExtraMaterials
                ? `
              <div style="margin-top: 15px;">
                <div class="extra-section-title">ADDITIONAL ITEMS</div>
                ${renderExtraMaterialsHTML(extraAddedRawmaterials.data)}
              </div>
            `
                : ''
            }
          `
              : hasExtraMaterials
                ? `
            <div class="extra-section-title">ADDITIONAL ITEMS</div>
            ${renderExtraMaterialsHTML(extraAddedRawmaterials.data)}
          `
                : `
            <div class="empty-table-message">
              No additional data
            </div>
          `
          }
        </div>
      </div>
      <div class="no-print" style="margin-top: 8px; text-align: center;">
        <button onclick="window.print()" style="padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 10px; margin-right: 4px; line-height:1.2;">
          Print
        </button>
        <button onclick="window.close()" style="padding: 4px 8px; background: #6c757d; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 10px; line-height:1.2;">
          Close
        </button>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  // Helper function to flatten grouped data into a single array
  const flattenGroupedData = (data: any): any[] => {
    const result: any[] = [];
    const flatten = (obj: any) => {
      if (Array.isArray(obj)) {
        result.push(...obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach((value) => flatten(value));
      }
    };
    flatten(data);
    return result;
  };

  const getExistingMaterialData = () => {
    const existingMaterials = new Set<string>();

    // Add main materials by name and ID
    if (rawMaterial?.formatedRawMaterials) {
      rawMaterial.formatedRawMaterials.forEach((item) => {
        if (item.name) existingMaterials.add(item.name.toLowerCase().trim());
        if (item.rawMaterialId) existingMaterials.add(item.rawMaterialId);
        if (item.id) existingMaterials.add(item.id);
      });
    }

    // Add extra materials that are already added
    if (extraAddedRawmaterials?.data) {
      extraAddedRawmaterials.data.forEach((item) => {
        if (item.rawMaterial?.name)
          existingMaterials.add(item.rawMaterial.name.toLowerCase().trim());
        if (item.rawMaterialId) existingMaterials.add(item.rawMaterialId);
      });
    }

    return existingMaterials;
  };
  // Helper function to render materials table
  const renderMaterialsTableHTML = (materials: any[]): string => {
    if (materials.length === 0) return '';

    // Define headers for raw materials
    const headers = ['Material Name'];
    if (selectedColumns.totalQuantity) headers.push('Total');
    if (selectedColumns.extra) headers.push('Extra');
    if (selectedColumns.orderQuantity) headers.push('Order');
    if (selectedColumns.inventory) headers.push('Stock');
    headers.push('Value');

    return `
    <table>
      <thead>
        <tr>
          ${headers
            .map(
              (header) => `
            <th>${header}</th>
          `,
            )
            .join('')}
        </tr>
      </thead>
      <tbody>
        ${materials
          .map((item, index) => {
            const totalQty = item.quantity || 0;
            const extraQty = item.extraQuantity || 0;
            const orderQty =
              initialOrderQuanity[item.id || ''] ?? item.quantity ?? 0;
            const inventoryVal =
              inventoryQuantities[item.id || ''] !== undefined
                ? (inventoryQuantities[item.id || ''] as number).toFixed(1)
                : typeof item.inventory === 'number'
                  ? item.inventory.toFixed(1)
                  : '0';
            const inventoryValue =
              startInventoryValue[item.id || ''] !== undefined
                ? (startInventoryValue[item.id || ''] as number).toFixed(1)
                : typeof item.inventory_value === 'number'
                  ? item.inventory_value.toFixed(1)
                  : '0';
            return `
            <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
              ${headers
                .map((header) => {
                  let content = '';
                  let align = 'center';
                  switch (header) {
                    case 'Material Name':
                      content = item.name || item.rawMaterial?.name || '';
                      align = 'left';
                      break;
                    case 'Total':
                      content = Number(totalQty).toFixed(
                        totalQty % 1 === 0 ? 0 : 1,
                      );
                      break;
                    case 'Extra':
                      content = Number(extraQty).toFixed(
                        extraQty % 1 === 0 ? 0 : 1,
                      );
                      break;
                    case 'Order':
                      content = `${Number(orderQty).toFixed(orderQty % 1 === 0 ? 0 : 1)}`;
                      break;
                    case 'Stock':
                      content = inventoryVal;
                      break;
                    case 'Value':
                      content = inventoryValue;
                      break;
                    default:
                      content = '';
                  }
                  return `<td style="text-align: ${align}; font-size: 11px;">${content}</td>`;
                })
                .join('')}
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  `;
  };

  // Helper function for Additional Items
  const renderExtraMaterialsHTML = (extraMaterials: any[]): string => {
    const mergedExtraMaterials: Record<string, any> = {};
    extraMaterials.forEach((item: any) => {
      const key = item.rawMaterialId;
      if (mergedExtraMaterials[key]) {
        mergedExtraMaterials[key].quantity += item.quantity;
      } else {
        mergedExtraMaterials[key] = {
          ...item,
          name: item.rawMaterial.name,
          unit: item.rawMaterial.unit,
          orderQuantity: initialOrderQuanity[item.id] ?? item.quantity,
        };
      }
    });

    const extraMaterialsArray = Object.values(mergedExtraMaterials);
    const extraHeaders = ['Material Name', 'Total'];
    if (selectedColumns.orderQuantity) extraHeaders.push('Order');
    extraHeaders.push('Type');

    return `
    <table>
      <thead>
        <tr>
          ${extraHeaders
            .map(
              (header) => `
            <th style="background-color: #FF6B35; font-size: 11px;">${header}</th>
          `,
            )
            .join('')}
        </tr>
      </thead>
      <tbody>
        ${extraMaterialsArray
          .map((item: any, index: number) => {
            const totalQty = item.quantity || 0;
            const orderQty = initialOrderQuanity[item.id] ?? item.quantity ?? 0;
            return `
            <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
              ${extraHeaders
                .map((header) => {
                  let content = '';
                  let align = 'center';
                  switch (header) {
                    case 'Material Name':
                      content = item.rawMaterial?.name || item.name || '';
                      align = 'left';
                      break;
                    case 'Total':
                      content = Number(totalQty).toFixed(
                        totalQty % 1 === 0 ? 0 : 1,
                      );
                      break;
                    case 'Order':
                      content = `${Number(orderQty).toFixed(orderQty % 1 === 0 ? 0 : 1)}`;
                      break;
                    case 'Type':
                      content = 'Extra';
                      break;
                    default:
                      content = '';
                  }
                  return `<td style="text-align: ${align}; font-size: 11px;">${content}</td>`;
                })
                .join('')}
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  `;
  };

  const handleshare = () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator
        .share({
          title: 'Raw Material Order',
          text: 'Join us using this registration link.',
          url: registrationLink,
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          // Fallback to clipboard if share fails
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
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(registrationLink)
        .then(() => {
          toast.success('Link copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
          // Final fallback for very old browsers
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

  const handleRawMaterialCompare = () => {
    navigate({
      to: '/rmrate/$id',
      params: {id: EventId},
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Raw Material List</h1>
          </div>
          <div className="flex gap-3">
            {/* Filter Options Button */}
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
                    {/* Sub-Event Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Group by Sub-Event
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={filters.subEvent}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              subEvent: !prev.subEvent,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>
                    {/* Maharaj Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Group by Maharaj
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={filters.maharaj}
                          onChange={() => {
                            setFilters((prev) => ({
                              ...prev,
                              maharaj: !prev.maharaj,
                            }));
                            if (!filters.maharaj) setSelectedMaharaj(null);
                          }}
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>
                    {/* Maharaj Select */}
                    {filters.maharaj && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm font-medium dark:text-white">
                          Select Maharaj
                        </span>
                        <select
                          value={selectedMaharaj || ''}
                          onChange={(e) =>
                            setSelectedMaharaj(e.target.value || null)
                          }
                          className="border-gray-300 rounded-lg border bg-white px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-800"
                        >
                          <option value="">All Maharajs</option>
                          {rawMaterial?.maharajList.map((maharaj) => (
                            <option key={maharaj} value={maharaj}>
                              {maharaj}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Category Toggle */}
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
                    {/* Inventory Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Show Inventory
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedColumns.inventory}
                          onChange={() => toggleColumnSelection('inventory')}
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>
                    {/* Total Quantity Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Show Total Quantity
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedColumns.totalQuantity}
                          onChange={() =>
                            toggleColumnSelection('totalQuantity')
                          }
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>
                    {/* Extra Quantity Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Show Extra Raw Material
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedColumns.extra}
                          onChange={() => toggleColumnSelection('extra')}
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>
                    {/* Order Quantity Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium dark:text-white">
                        Show Order Quantity
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedColumns.orderQuantity}
                          onChange={() =>
                            toggleColumnSelection('orderQuantity')
                          }
                          className="peer sr-only"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 dark:border-gray-600 peer h-6 w-11 rounded-full after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadPDF();
              }}
              className="flex gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
            >
              <span>📄</span>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <RedDishesShow />

      <div className="mb-8 overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
        <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
          {' '}
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
                {selectedColumns.totalQuantity && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Total Qty
                  </th>
                )}
                {selectedColumns.extra && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Extra Raw Material
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
                {/* Add Action column */}
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
              {groupedData ? (
                renderRows(groupedData)
              ) : (
                <tr>
                  <td
                    colSpan={selectedColumns.extra ? 7 : 6}
                    className="text-gray-500 dark:text-gray-400 px-4 py-6 text-center"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Only show the ExtraRawmaterial form, no separate table */}
      <div className="mb-8 rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-gray-800 mb-6 flex items-center gap-2 text-lg font-semibold dark:text-white">
          Add Extra Raw Materials
        </h3>
        <ExtraRawmaterial
          onSuccess={fetchMaterials}
          existingMaterialData={getExistingMaterialData()}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        {/* PO Button - Left Side */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: `/eventpo/$id`,
                params: {id: EventId},
              })
            }
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800"
          >
            <FaFileInvoice className="h-4 w-4" />
            <span>Purchase Orders</span>
          </button>
        </div>

        {/* Multi-Select Category Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative" ref={categoryDropdownRef}>
            <button
              ref={dropdownButtonRef}
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
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
                  <div className="overflow-y-auto" style={{maxHeight: '200px'}}>
                    {categoryOptions.map((category) => (
                      <label
                        key={category.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center rounded px-2 py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(category.id)}
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
                    {categoryOptions.length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 px-2 py-2 text-center text-sm">
                        No categories available
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

        {/* Save and Share Button */}
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSend(EventId, rawMaterial?.formatedRawMaterials || []);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:from-blue-700 dark:to-indigo-800 dark:hover:from-blue-800 dark:hover:to-indigo-900 dark:focus:ring-blue-800 sm:px-6"
            >
              <span className="hidden sm:inline">Save </span>
              <span className="sm:hidden">Share Order</span>
            </button>

            {/* Alternative: Direct copy button for mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard
                  .writeText(registrationLink)
                  .then(() => {
                    toast.success('Link copied to clipboard');
                  })
                  .catch((err) => {
                    console.error('Failed to copy:', err);
                    toast.error('Failed to copy link');
                  });
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-3 font-medium text-blue-600 shadow-md transition-all hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:bg-boxdark dark:text-blue-400 dark:hover:bg-blue-900/20 sm:hidden"
            >
              <FaShare className="h-4 w-4" />
              Copy Link
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RawMaterialOrderrrr;
