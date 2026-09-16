/* eslint-disable */
import {
  CategoryOption,
  RawMaterial,
  ExtraRawMaterial,
  FormattedData,
} from './RawmaterialOrderTypes';

// 1. Data Flattening and Transformation
export const flattenGroupedData = (data: any, context: any = {}): any[] => {
  let rows: any[] = [];

  if (Array.isArray(data)) {
    data.forEach((item: any) => {
      rows.push({
        Category: context.category || item.category || '',
        SubEvent: context.subEvent || item.subEvent || '',
        Maharaj: context.maharaj || item.maharaj || '',
        Name: item.name,
        Unit: item.unit,
        Inventory: Number(item.inventory ?? 0).toFixed(3),
        RequiredQty: Number(item.quantity ?? 0).toFixed(3),
        ExtraQty: Number(context.extraQty?.[item.id] ?? 0).toFixed(3),
        TotalQty: (
          Number(item.quantity ?? 0) + Number(context.extraQty?.[item.id] ?? 0)
        ).toFixed(3),
        OrderQty: Number(
          context.orderQty?.[item.id] ?? item.orderQuantity ?? 0,
        ).toFixed(3),
        InventoryValue: Number(
          context.inventoryValue?.[item.id] ?? item.inventory_value ?? 0,
        ).toFixed(3),
      });
    });
  } else {
    Object.keys(data).forEach((key) => {
      rows = rows.concat(
        flattenGroupedData(data[key], {
          ...context,
          category: context.category || key,
        }),
      );
    });
  }

  return rows;
};

// 2. Sorting Utility
export const sortRawMaterials = (
  materials: RawMaterial[] | undefined,
): RawMaterial[] => {
  if (!materials) return [];
  return materials?.sort((a, b) =>
    a?.name?.localeCompare(b.name, 'en', {sensitivity: 'base'}),
  );
};

// 3. Safe get category name function
export const getCategoryName = (item: RawMaterial): string => {
  if (!item.category) return 'Uncategorized';

  // Handle both string and object types
  if (typeof item.category === 'string') {
    return item.category.trim();
  }

  // If it's an object with a name property
  if (
    item.category &&
    typeof item.category === 'object' &&
    'name' in item.category
  ) {
    return String(item.category.name || '').trim();
  }

  // Fallback
  return String(item.category).trim();
};

// 4. Merge Raw Materials by Name
export const mergeByName = (
  items: RawMaterial[],
  getClampedInventory: (item: RawMaterial) => number,
): RawMaterial[] => {
  const mergedData: {[key: string]: RawMaterial} = {};
  items.forEach((item) => {
    const key = item.name;
    if (mergedData[key]) {
      mergedData[key].quantity += item.quantity;
      if (item.orderQuantity !== undefined) {
        mergedData[key].orderQuantity = mergedData[key].orderQuantity || 0;
      }
    } else {
      mergedData[key] = {
        ...item,
        inventory: getClampedInventory(item),
      };
    }
  });
  return Object.values(mergedData);
};

// 5. Merge Extra Raw Materials
export const mergeRawMaterials = (
  materials: ExtraRawMaterial[] | undefined,
): ExtraRawMaterial[] => {
  if (!materials) return [];
  const merged: Record<string, ExtraRawMaterial> = {};
  materials.forEach((item) => {
    const key = item.rawMaterialId;
    if (merged[key]) {
      merged[key].quantity += item.quantity;
    } else {
      merged[key] = {...item};
    }
  });
  return Object.values(merged);
};

// 6. Get Final Array for Export/Download
export const getFinalArray = (data: any): any[] => {
  const result: any[] = [];

  const traverse = (node: any) => {
    if (Array.isArray(node)) {
      node.forEach((item) => {
        result.push({
          categoryId: item.categoryId,
          id: item.id,
          inventory: Number(item.inventory) || 0,
          inventory_value: Number(item.inventoryValue) || 0,
          name: item.name,
          quantity: Number(item.orderQuantity ?? item.quantity) || 0,
          rawMaterialId: item.rawMaterialId || item.id,
          unit: item.unit,
        });
      });
    } else {
      Object.keys(node).forEach((key) => traverse(node[key]));
    }
  };

  traverse(data);
  return result;
};

// 7. Get Existing Material Data (for duplicates check)
export const getExistingMaterialData = (
  formattedRawMaterials: RawMaterial[] | undefined,
  extraAddedRawmaterials: ExtraRawMaterial[] | undefined,
): Set<string> => {
  const existingMaterials = new Set<string>();

  if (formattedRawMaterials) {
    formattedRawMaterials.forEach((item) => {
      if (item.name) existingMaterials.add(item.name.toLowerCase().trim());
      if (item.rawMaterialId) existingMaterials.add(item.rawMaterialId);
      if (item.id) existingMaterials.add(item.id);
    });
  }

  if (extraAddedRawmaterials) {
    extraAddedRawmaterials.forEach((item) => {
      if (item.rawMaterial?.name)
        existingMaterials.add(item.rawMaterial.name.toLowerCase().trim());
      if (item.rawMaterialId) existingMaterials.add(item.rawMaterialId);
    });
  }

  return existingMaterials;
};

// 8. Calculate Missing Raw Materials
export const calculateMissingRawMaterials = (
  allRawMaterials: any[] | undefined,
  formattedIds: string[] | undefined,
): any[] | undefined => {
  return allRawMaterials?.filter((raw) => !formattedIds?.includes(raw.id));
};

// 9. Convert Missing Raw Materials to Standard Format
export const convertMissingToStandardFormat = (
  missingRawMaterials: any[] | undefined,
): RawMaterial[] => {
  return (
    missingRawMaterials?.map((raw) => ({
      id: raw.id,
      name: raw.name || '',
      category: raw.category || '',
      categoryId: raw.categoryId || '',
      unit: raw.unit || '',
      quantity: 0,
      orderQuantity: 0,
      inventoryQuantity: raw.inventory || 0,
      baselinePeople: 0,
      people: 0,
      maharaj: '',
      total_price: 0,
      price: raw.amount || 0,
      dishId: '',
      peopleType: '',
      subEvent: '',
      subEventId: '',
    })) || []
  );
};

// 10. Generate Vendor Link
export const generateVendorLink = (
  userFullname: string | undefined,
  caterorId: string | undefined,
  eventId: string,
  selectedCategoryIds: string[],
): string => {
  const baseUrl = `${import.meta.env.VITE_EXTERNAL_VENDOR_BASE_URL}${userFullname?.replace(/\s/g, '_')}/${caterorId}/${eventId}`;

  if (selectedCategoryIds && selectedCategoryIds.length > 0) {
    const url = new URL(baseUrl);
    url.searchParams.set('categories', selectedCategoryIds.join(','));
    return url.toString();
  }

  return baseUrl;
};

// 11. Calculate Extra Percentages
export const calculateExtraPercentages = (
  formatedRawMaterials: any[],
): {percentages: Record<string, number>; categories: string[]} => {
  const categoryPercentage: Record<string, number> = {};
  const categorySet = new Set<string>();
  const itemMap: Record<
    string,
    {quantity: number; extra: number; category: any}
  > = {};

  formatedRawMaterials.forEach((item: any) => {
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

    // Get category name safely
    const categoryName = getCategoryName({category} as RawMaterial);

    if (!categoryName || categorySet.has(categoryName) || !quantity) return;

    categorySet.add(categoryName);
    const percentage = Math.floor((extra / quantity) * 100);
    categoryPercentage[categoryName] = percentage;
  });

  return {
    percentages: categoryPercentage,
    categories: Array.from(categorySet),
  };
};

// 12. Prepare Data for External Vendor
export const prepareExternalVendorData = (
  data: RawMaterial[],
  newinitialOrderQuanity: Record<string, number>,
  extraQty: Record<string, number>,
  inventoryQuantities: Record<string, string | number>,
  startInventoryValue: Record<string, number>,
  extraAddedRawmaterials?: any[],
) => {
  console.table(
    data.map((item) => ({
      initial: newinitialOrderQuanity[item.id || ''],
      name: item.name,
      orderQuantity: item.orderQuantity,
      quantity: item.quantity,
    })),
  );
  const updatedData = data.map((item) => ({
    id: item.id,
    rawMaterialId: item.rawMaterialId ?? item.id,
    name: item.name,
    quantity: Number(
      (newinitialOrderQuanity[item.id || ''] > 0
        ? newinitialOrderQuanity[item.id || '']
        : item.orderQuantity > 0
          ? item.orderQuantity
          : item.quantity) || 0,
    ),
    extraQuantity:
      extraQty[item.id] !== undefined
        ? Number(extraQty[item.id].toFixed(3))
        : 0,
    unit: item.unit,
    categoryId: item.categoryId ?? '',
    inventory: Number(
      inventoryQuantities[item.id || ''] ?? item.inventory ?? 0,
    ),
    inventory_value: Number(
      startInventoryValue[item.id || ''] ?? item.inventory_value ?? 0,
    ),
  }));

  const extraData =
    extraAddedRawmaterials?.map((item: any) => ({
      id: item?.rawMaterial?.id,
      rawMaterialId: item?.rawMaterial?.id,
      name: item?.rawMaterial?.name,
      quantity: item?.quantity ?? 0,
      unit: item?.rawMaterial?.name,
      categoryId: item?.rawMaterial?.categoryId,
      inventory: 0,
      inventory_value: 0,
    })) || [];

  return [...updatedData, ...extraData];
};

export const groupByCategoryName = (data: any): any => {
  if (!data) return data;

  // If data is an array, group items by category
  if (Array.isArray(data)) {
    const grouped: {[key: string]: any[]} = {};

    data.forEach((item) => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    // Sort categories alphabetically
    const sortedGrouped: {[key: string]: any[]} = {};
    Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        // Sort items within each category alphabetically by name
        sortedGrouped[key] = grouped[key].sort((a, b) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
      });

    return sortedGrouped;
  }

  // If data is an object (already grouped by something else), recursively process each group
  if (typeof data === 'object') {
    const result: any = {};
    const sortedKeys = Object.keys(data).sort((a, b) => a.localeCompare(b));

    for (const key of sortedKeys) {
      result[key] = groupByCategoryName(data[key]);
    }
    return result;
  }

  return data;
};

// 14. Calculate Order Quantity Display
export const calculateOrderQuantityDisplay = (
  item: any,
  newinitialOrderQuanity: Record<string, number | string>,
  extraPercentage: Record<string, number>,
  extraQty: Record<string, number>,
  hasUserChangedExtra: boolean,
  isManualChange: Record<string, boolean>,
): string => {
  const id = item.id;
  const categoryName = getCategoryName(item);

  // 1️⃣ Manual entry → return raw value (NO toFixed)
  if (isManualChange[id]) {
    return newinitialOrderQuanity[id]?.toString() ?? '';
  }

  let value = 0;

  // 2️⃣ Calculated value
  if (hasUserChangedExtra && extraPercentage[categoryName] > 0) {
    const base = Number(item.quantity || 0);
    const extra = Number(extraQty[id] || 0);
    const inventory = Number(item.inventory || 0);
    value = Math.max(0, base + extra - inventory);
  } else {
    // 3️⃣ Backend value
    value = Number(item.orderQuantity || 0);
  }

  // ✅ Always fixed to 3 for calculated/backend values
  return value.toFixed(3);
};

// 15. Calculate Inventory Value Display
export const calculateInventoryValueDisplay = (
  item: any,
  extraQty: Record<string, number>,
): string => {
  const calculated = Number(
    (
      Number(item.quantity) + (extraQty[item.id] ? extraQty[item.id] : 0)
    ).toFixed(3),
  );

  const inventory = Number(item.inventory ?? 0);
  const finalValue = calculated < inventory ? calculated : inventory;

  return finalValue.toFixed(3);
};

// NEW helper for Total (add this)
export const calculateTotalDisplay = (
  item: any,
  newinitialOrderQuanity: Record<string, number>,
  extraQty: Record<string, number>, // only if you still need it somewhere
): string => {
  const invValue = Number(item.inventory_value ?? 0);
  const orderQty = Number(
    newinitialOrderQuanity[item.id] ?? item.orderQuantity ?? 0,
  );
  return (invValue + orderQty).toFixed(3);
};

// NEW helper for Extra Qty
export const calculateExtraQtyDisplay = (
  item: any,
  newinitialOrderQuanity: Record<string, number>,
): string => {
  const total = Number(calculateTotalDisplay(item, newinitialOrderQuanity, {}));
  const required = Number(item.quantity ?? 0);
  const extra = total - required;
  return Math.max(0, extra).toFixed(3); // no negative extra
};

// 16. Extract category options from raw materials
export const extractCategoryOptions = (
  rawMaterials: RawMaterial[] | undefined,
): CategoryOption[] => {
  if (!rawMaterials) return [];

  const uniqueCategories: CategoryOption[] = [];
  const seen = new Set<string>();

  rawMaterials.forEach((item) => {
    const categoryId = item.categoryId;
    if (categoryId && !seen.has(categoryId)) {
      seen.add(categoryId);
      uniqueCategories.push({
        name: getCategoryName(item),
        id: categoryId,
      });
    }
  });

  return uniqueCategories;
};

// 17. Initialize state from vendor data
export const initializeStateFromVendorData = (
  vendorData: any,
): {
  sortedMaterials: RawMaterial[];
  categoryOptions: CategoryOption[];
  initialInventory: Record<string, number>;
  initialInventoryValue: Record<string, number>;
  initialOrderQuantity: Record<string, number>;
} => {
  const sortedMaterials =
    sortRawMaterials(vendorData?.data?.formatedRawMaterials) || [];

  const categoryOptions = extractCategoryOptions(sortedMaterials);

  const initialInventory: Record<string, number> = {};
  const initialInventoryValue: Record<string, number> = {};
  const initialOrderQuantity: Record<string, number> = {};

  sortedMaterials.forEach((item) => {
    if (item?.id) {
      initialInventory[item.id] = item.inventory || 0;
      initialInventoryValue[item.id] = item.inventory_value || 0;
      initialOrderQuantity[item.id] = item.orderQuantity || 0;
    }
  });

  return {
    sortedMaterials,
    categoryOptions,
    initialInventory,
    initialInventoryValue,
    initialOrderQuantity,
  };
};
