import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

interface ManpowerItem {
  id?: string;
  manpowerVendorId: string;
  manpowerRoleId: string;
  quantity: number;
  rate: number;
  transport: number;
  totalAmount: number;
}

interface DisplayVendorItem {
  id?: string;
  displayVendorId: string;
  displayId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface ExtraCostItem {
  id?: string;
  additionalVendorId: string;
  categoryId: string;
  particular: string;
  quantity: number;
  price: number;
  total: number;
}

interface FoodVendorItem {
  id: string;
  foodVendorId: string;
  price: number;
  rawMaterialCalculation: boolean;
  expected: number;
  preparation: number;
  unit:
    | 'LITRE'
    | 'GRAM'
    | 'KILOGRAM'
    | 'BOTTLE'
    | 'PIECE'
    | 'METER'
    | 'PACKET'
    | 'BUNDLE';
  singlePrice: number;
  transport: number;
  count: number;
}

interface RawMaterialRateListData {
  subEventId: string;
  manpower: ManpowerItem[];
  displayVendors: DisplayVendorItem[];
  price: number;
  foodVendor: FoodVendorItem[];
  profit: number;
  perPlatePrice: number;
  extraCost: ExtraCostItem[];
  rawMaterialCost: number;
  perPlate?: number;
  defaultPerPlate?: number;
}
export const addRawMaterialCaterorPrice = async (
  data: {
    rawMaterialId: string;
    amount: number;
    inventory: number;
  }[],
) => {
  try {
    const res = await api.post('/cateror/amount/bulk', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials',
      );
    }
    throw error;
  }
};

export const getRawMaterialPrice = async () => {
  try {
    const res = await api.get('/cateror/amount');
    console.log('getRawMaterialPrice:', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials',
      );
    }
    throw error;
  }
};

export const addRawMaterialRateList = async (
  subEventId: string, // This will be used in the URL
  data: Omit<RawMaterialRateListData, 'subEventId'>, // Exclude subEventId from the data
) => {
  try {
    console.log('api data................', data);
    const res = await api.post(
      `/cateror/events/subevent/manpower/${subEventId}`,
      data,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials',
      );
    }
    throw error;
  }
};

export const getEventRateList = async (subEventId: string) => {
  try {
    const res = await api.get(
      `/cateror/events/subevent/manpower/${subEventId}`,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getFuelCost = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/fuel/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getTransporatioanCost = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/transport/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getClubVendorPackage = async () => {
  try {
    const res = await api.get(`/cateror/vendors/clubVendors`);
    console.log('getClubVendorPackage:', res);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};
