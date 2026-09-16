import {FormValues} from '@/components/MultipleDishComponents/types';
import {api} from '@/utils/axios';
import toast from 'react-hot-toast';
import {AxiosError} from 'axios';
export const getDetails = async () => {
  try {
    const response = await api.get(`/cateror/cateror/firm`);
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch details');
    throw error;
  }
};

export const addDetails = async (data: FormValues) => {
  try {
    const response = await api.post('/cateror/cateror/firm', data);
    return response.data;
  } catch (error) {
    toast.error('Failed to add details');
    throw error;
  }
};

export const deleteFirmdetail = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/cateror/firm/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete process',
      );
    }
    throw error;
  }
};
