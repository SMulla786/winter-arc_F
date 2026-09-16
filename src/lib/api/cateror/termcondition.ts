import {TermAndCondition} from '@/types/cateror';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const addTermAndCondition = async (data: TermAndCondition) => {
  try {
    const response = await api.post('/cateror/terms', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add Process');
    }
    throw error;
  }
};

export const getTerms = async (id: string) => {
  try {
    const response = await api.get(`/cateror/terms/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

// const updateProcess = async (id: string, data: ProcessUpdate) => {
//   try {
//     const response = await api.patch(`/cateror/process/${id}`, data);
//     return response.data;
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       throw new Error(
//         error.response?.data?.message || 'Failed to update process',
//       );
//     }
//     throw error;
//   }
// };

export const deleteTerms = async (id: string) => {
  try {
    await api.delete(`/cateror/terms/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete process',
      );
    }
    throw error;
  }
};
