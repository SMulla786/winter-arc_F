import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const SendData = async (data: {
  languageId: string;
  caterorId: string;
  dishes: {dishId: string; people: number}[];
}) => {
  try {
    console.log('PostData', data);
    const response = await api.post('admin/copy-data/dishes', data);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to Save Data');
    }
    throw error;
  }
};
