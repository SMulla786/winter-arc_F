/* eslint-disable */
import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

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
  breakdownQuantity?: number;
  totalAmount?: number;
  error?: string;
  requiredErrors?: string[];
  inventory?: number;
  orderQuantity?: number;
  inventoryQuantity?: number;
  submitMainRow?: boolean;
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

interface PurchaseMaterialData {
  id: string;
  name: string;
  materials: Array<{
    id: string;
    name: string;
    quantity: number;
    date: string;
    time: string;
    price: number;
    unit: string;
    venue: string;
    vendorId: string;
    vendorName: string;
    vendor?: {
      id: string;
      name: string;
      phone: string;
      address: string;
      email: string | null;
    };
    particular?: string;
    packageType?: string;
  }>;
}

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

const formatDateForAPI = (dateString: string) => {
  if (dateString && dateString.trim() !== '') {
    try {
      if (dateString.includes('/')) {
        const [month, day, year] = dateString.split('/');
        if (month && day && year) {
          const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
          );
          return date.toISOString().split('T')[0];
        }
      }

      if (dateString.includes('-')) {
        return dateString;
      }

      return '';
    } catch {
      return '';
    }
  }
};

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

const formatTimeForInput = (timeString: string): string => {
  if (!timeString) return '';
  try {
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    if (timeString.match(/^\d{1,2}:\d{2}$/)) {
      return timeString;
    }
    return timeString;
  } catch {
    return timeString;
  }
};

const getEventPO = async (EventId: string) => {
  const response = await api.get(`/cateror/purchase/event/main/${EventId}`);
  return response.data;
};

const useGetEventPO = (EventId: string) => {
  return useQuery({
    queryKey: ['eventpo', EventId],
    queryFn: () => getEventPO(EventId),
    enabled: !!EventId,
  });
};

// 1. Quantity formatting
const formatQuantityDisplay = (quantity: number | undefined | null): string => {
  if (quantity === undefined || quantity === null) return '';
  return parseFloat(quantity.toFixed(1)).toString();
};

// 2. Vendor name lookup
const getVendorNameById = (
  vendorId: string | undefined,
  vendors: Vendor[],
): string => {
  if (!vendorId || !vendors) return '';
  const vendor = vendors.find((v) => v.id === vendorId);
  return vendor ? vendor.name : '';
};

// 4. Extract last prices from raw material order data
const extractLastPrices = (rawMaterialOrderData: any): Map<string, number> => {
  const lastPriceMap = new Map<string, number>();
  const materials =
    rawMaterialOrderData?.data?.formatedRawMaterials ||
    rawMaterialOrderData?.formatedRawMaterials ||
    rawMaterialOrderData ||
    [];

  if (Array.isArray(materials)) {
    materials.forEach((item: any) => {
      const rawMaterialId = item.rawmaterialId || item.rawMaterialId || item.id;
      const price =
        item.lastPrice === 0 ? item.price || 0 : item.lastPrice || 0;
      if (rawMaterialId) {
        lastPriceMap.set(rawMaterialId, price);
      }
    });
  }
  return lastPriceMap;
};

// 5. Validation functions (these are pure and reusable)
const validateOrderQuantity = (item: LineItem): string | null => {
  const totalQuantity = item.breakdownQuantity || 0;
  const userQuantity = item.quantity || 0;
  if (userQuantity > totalQuantity) {
    return `This quantity (${formatQuantityDisplay(userQuantity)}) is greater than total available quantity (${formatQuantityDisplay(totalQuantity)})`;
  }
  return null;
};

const validateBreakdownAgainstTotal = (
  breakdownItem: LineItem,
  parentItem: LineItem,
): string | null => {
  const totalQuantity = parentItem.breakdownQuantity || 0;
  const breakdownQuantity = breakdownItem.quantity || 0;
  if (breakdownQuantity > totalQuantity) {
    return `Breakdown quantity (${formatQuantityDisplay(breakdownQuantity)}) exceeds total available quantity (${formatQuantityDisplay(totalQuantity)})`;
  }
  return null;
};

const validateBreakdownQuantities = (
  parentItem: LineItem,
  breakdownItems: LineItem[],
): string | null => {
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
};

const validateRequiredFields = (
  item: LineItem,
  isDraft: boolean = false,
): string[] => {
  const errors: string[] = [];

  // Only check required fields if quantity > 0
  if (item.quantity > 0) {
    if (!item.date?.trim()) errors.push('Date is required');
    if (!item.time?.trim()) errors.push('Time is required');
    if (!item.location?.trim()) errors.push('Location is required');

    if (!isDraft) {
      if (!item.vendorId?.trim()) {
        errors.push('Vendor is required');
      }
      if (item.price === undefined || item.price <= 0) {
        errors.push('Price is required');
      }
    }
  }

  return errors;
};

export {
  formatTimeForAPI,
  formatDateForAPI,
  formatDateForInput,
  formatTimeForInput,
  useGetEventPO,
};
export type {LineItem, Vendor, PurchaseMaterialData};
export {
  formatQuantityDisplay,
  getVendorNameById,
  extractLastPrices,
  validateOrderQuantity,
  validateBreakdownAgainstTotal,
  validateBreakdownQuantities,
  validateRequiredFields,
};
