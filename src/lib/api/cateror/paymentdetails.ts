import {PaymentDetailsC, TermAndCondition} from '@/types/cateror';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const addPaymentDetailsc = async (id: string, data: PaymentDetailsC) => {
  console.log('====================================');
  console.log(id, data.AccountHolderName);
  console.log('====================================');
  try {
    const response = await api.post(`/cateror/bank`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add Process');
    }
    throw error;
  }
};

export const getPaymentDetails = async (id: string) => {
  try {
    const response = await api.get(`/cateror/bank`);
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
