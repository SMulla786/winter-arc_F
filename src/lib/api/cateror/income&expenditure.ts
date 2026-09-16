import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getIncomeAndExpenditure = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/evenssts/bill/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Bill');
    }
    throw error;
  }
};
