/* eslint-disable */

import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const bulkAddRawMaterialReturns = async (data: any) => {
  try {
    const response = await api.post('/cateror/events/utensils/bulk', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to Add Event Utensils',
      );
    }
    throw error;
  }
};
