import {api, unAuthenticatedApi} from '@/utils/axios';
import {AxiosError} from 'axios';

export const postExternal = async (data: {
  eventId: string;
  data: {
    rawMaterialId: string;
    name: string;
    quantity: number;
    unit: string;
    categoryId: string;
    inventory: number;
  }[];
}) => {
  try {
    // ✅ Keep only unique rawMaterialId (first occurrence)
    const uniqueData = Array.from(
      new Map(data.data.map((item) => [item.rawMaterialId, item])).values(),
    );

    const payload = {
      ...data,
      data: uniqueData,
    };

    const response = await api.post('cateror/inventory/vendor', payload);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to Send Data');
    }
    throw error;
  }
};

export const GetAllVendorsData = async (eventId: string) => {
  try {
    const res = await api.get(`cateror/inventory/getAllVendors/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getExternalRaws = async (eventId: string) => {
  try {
    const res = await unAuthenticatedApi.get(`/getvendorData/${eventId}`);
    return res.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getExternalAllRawsMaterial = async (listId: string) => {
  try {
    const res = await unAuthenticatedApi.get(
      `/cateror/events/rawmateriallist/${listId}`,
    );
    return res.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get raw material',
      );
    }
    throw error;
  }
};

export const postExternalRaws = async (data: {
  name: string;
  phone: string;
  address: string;
  eventId?: string;
  RMlistId?: string;
  rawMaterials: {
    rawMaterialId: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
}) => {
  try {
    const response = await api.post('saveVendorPrice', data);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to Save Data');
    }
    throw error;
  }
};

export const getpostExternalRaws = async (eventId: string) => {
  try {
    const res = await api.get(`cateror/events/getAllVendors/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};
