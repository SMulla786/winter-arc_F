import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {GstBillData} from '@/types/cateror';

const getBill = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/bill/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Bill');
    }
    throw error;
  }
};

export const AddGstBill = async (eventId: string, data: GstBillData) => {
  try {
    const res = await api.put(`/cateror/events/bill/${eventId}`, data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add bill');
    }
    throw error;
  }
};

export const getGstBill = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/bill/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Bill');
    }
    throw error;
  }
};

export {getBill};
