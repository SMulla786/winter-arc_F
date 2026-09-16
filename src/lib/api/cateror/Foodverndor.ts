import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getFoodVendors = async () => {
  try {
    const res = await api.get('/cateror/vendors/food');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get food vendors',
      );
    }
    throw error;
  }
};

export const getSubeventWiseDishRateList = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/dishes/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get food vendors',
      );
    }
    throw error;
  }
};
