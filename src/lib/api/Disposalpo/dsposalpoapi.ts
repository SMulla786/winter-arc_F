import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const createDisposalVendors = async (data: {
  name: string;
  phone: string;
  address: string;
  categories: string[];
}) => {
  try {
    const response = await api.post(`/cateror/disposalsVendors`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to create Vendor',
      );
    }
    throw error;
  }
};

export const deleteDisposalVendors = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/disposalsVendors/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Vendor',
      );
    }
    throw error;
  }
};
export const getDisposalVendorsPo = async () => {
  try {
    const response = await api.get(`/cateror/disposalsVendors`);
    // console.log('vendors dataaaaaa', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Vendors');
    }
    throw error;
  }
};

export const updateDisposalVendors = async (data: {
  id: string;
  name: string;
  phone: string;
  address: string;
  categories?: string[];
}) => {
  try {
    const response = await api.put(
      `/cateror/disposalsVendors/${data.id}`,
      data,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Vendor',
      );
    }
    throw error;
  }
};

export const getDisposalVendorsbyid = async (id: string) => {
  try {
    const response = await api.get(`/cateror/disposalsVendors/${id}`);
    console.log('vendors dataaaaaa', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Vendors');
    }
    throw error;
  }
};
