/* eslint-disable */

import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getInventoryData = async () => {
  try {
    const res = await api.get('cateror/inventory/');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get disposal category',
      );
    }
    throw error;
  }
};

export const delteInventoryData = async (id: string) => {
  console.log(id);
  try {
    const res = await api.delete(`cateror/inventory/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get disposal category',
      );
    }
    throw error;
  }
};

export const updateInventoryData = async (id: string, data: any) => {
  try {
    const res = await api.patch(`cateror/inventory/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update inventory data',
      );
    }
    throw error;
  }
};

export const addRawMaterialReturn = async (data: {
  rawMaterialId: string;
  totalQuantity: string;
}) => {
  try {
    const res = await api.post('/cateror/inventory/', data);
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

export const getInventoryDataById = async (id: string) => {
  try {
    const res = await api.get(`cateror/inventory/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Inventory Data',
      );
    }
    throw error;
  }
};

export const bulkAddRawMaterialToInventory = async (
  data: {
    rawMaterialId: string;
    quantity: number;
  }[],
) => {
  try {
    const res = await api.post('/cateror/inventory/bulk', data);
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

export const getRawMaterialReturn = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/rawmaterials/return/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Raw Material Return',
      );
    }
    throw error;
  }
};

export const saveRawMaterialReturn = async (
  EventId: string,
  data: {
    id: string;
    quantity: number;
    vendorName?: string;
  }[],
) => {
  try {
    const res = await api.put(
      `/cateror/events/rawmaterials/return/${EventId}`,
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
