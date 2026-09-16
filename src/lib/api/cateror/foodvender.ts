import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export type foodVendorPayload = {
  name: string;
  address: string;
  phone: string;
  rawMaterialCalculation: boolean;
  dailySalary?: number;
  transport?: number;
};

export type foodVendorPayPayload = {
  amount: number;
  eventId: string;
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};
export type foodVendorPayAllPayload = {
  amount: number;
  eventId: {id: string}[];
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

export type manpowerPayPayload = {
  amount: number;
  id: string;
};

export type foodVendor = {
  id: string;
  name: string;
  email: number;
  address: string;
  phone: string;
};

export type dispalyfoodVendor = {
  name: string;
  email: number;
  address: string;
  phone: string;
  amount: number;
};
export const saveFoodVendor = async (data: foodVendorPayload) => {
  try {
    const response = await api.post(`cateror/vendors/food`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to add food vendor');
    throw error;
  }
};

export const getFoodVendorHistory = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/food/history/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed get food vendor history');
    throw error;
  }
};

export const getFoodVendorAllHistory = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/food/AllHistory/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed get food vendor history');
    throw error;
  }
};

export const payFoodVendor = async (data: foodVendorPayPayload) => {
  try {
    const response = await api.post(`cateror/vendors/food/pay`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const payMultiFoodVendor = async (data: foodVendorPayAllPayload) => {
  try {
    const response = await api.post(`cateror/vendors/food/payMultiple`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const payFoodVendorAdvance = async (
  id: string,
  data: {amount: number},
) => {
  try {
    const response = await api.post(`cateror/vendors/food/advance/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed pay food vendor');
    throw error;
  }
};

export const getFoodVendor = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/food`);
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch food vendor');
    throw error;
  }
};

export const DeleteFoodVendor = async (id: string) => {
  try {
    const response = await api.delete(`cateror/vendors/food/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed to delete food vendor');
    throw error;
  }
};

export const UpdateFoodVendor = async (id: string, data: foodVendorPayload) => {
  try {
    const response = await api.put(`cateror/vendors/food/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to update food vendor');
    throw error;
  }
};

export const addFoodVendor = async (data: dispalyfoodVendor) => {
  try {
    const response = await api.post(`cateror/vendors/food`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to add food vendor');
    throw error;
  }
};

export const deletedisplayFoodVendor = async (id: string) => {
  try {
    const response = await api.delete(`cateror/vendors/food/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed to delete food vendor');
    throw error;
  }
};

export const getdisplayFoodVendor = async () => {
  try {
    const response = await api.get(`cateror/vendors/food`);
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch food vendor');
    throw error;
  }
};
