import {api} from '@/utils/axios';

export const createWebsiteContent = async (data: FormData) => {
  try {
    const response = await api.post('cateror/cateror/web', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create website content');
  }
};

export const updateWebsiteContent = async (data: FormData) => {
  try {
    const response = await api.put('cateror/cateror/web', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update website content');
  }
};
