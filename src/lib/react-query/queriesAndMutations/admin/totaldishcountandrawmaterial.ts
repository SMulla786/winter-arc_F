/*eslint-disable*/
import {AddExtraRawMaterial} from '@/types/dish';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getAllEventsWithSubEvents = async () => {
  try {
    const res = await api.get(`cateror/events/dishcalculation`);
    // console.log(res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

// totaldishcountandrawmaterial.ts
export const dishCountTotal = async (payload: any) => {
  try {
    const response = await api.post('/cateror/events/dishlist', payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to save');
    }
    throw error;
  }
};

export const addExtraRawMaterial = async (data: AddExtraRawMaterial) => {
  try {
    const res = await api.put(`/cateror/events/rawmaterial`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get raw materials',
      );
    }
    throw error;
  }
};

export const getAllDishHistory = async () => {
  try {
    const res = await api.get(`/cateror/events/dishlist`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get raw materials',
      );
    }
    throw error;
  }
};

export const getRawListHistory = async () => {
  try {
    const res = await api.get(`/cateror/events/rawmateriallist`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get raw materials',
      );
    }
    throw error;
  }
};
export const getAllRawMaterialHistory = async () => {
  try {
    const res = await api.get(`/cateror/events/rawmateriallist`);
    console.log('gethisytory data', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get raw materials',
      );
    }
    throw error;
  }
};

export const getAllRawMaterialHistoryById = async (id: string) => {
  try {
    const res = await api.get(`/cateror/events/rawmateriallist/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get raw materials',
      );
    }
    throw error;
  }
};

type RawMaterialReguHistoryItem = {
  rawMaterialListId?: string;
  rawMaterialId: string | undefined;
  name: string | undefined;
  quantity: number | undefined;
  inventoryValue?: number | undefined;
  totalQty: number;
};
type RawMaterialExtraHistoryItem = {
  rawMaterialListId?: string;
  rawMaterialId: string;
  quantity: number;
  inventoryValue?: number;
  totalQty: number;
};
export type rawRegularHistory = RawMaterialReguHistoryItem[];
export type rawExtraHistory = RawMaterialExtraHistoryItem[];

export const updateRawHistory = async (
  id: string,
  extramaterials: rawExtraHistory,
  materials: rawRegularHistory,
) => {
  try {
    const res = await api.put(`/cateror/events/rawmateriallist/${id}`, {
      extramaterials,
      materials,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update raw materials',
      );
    }
    throw error;
  }
};
