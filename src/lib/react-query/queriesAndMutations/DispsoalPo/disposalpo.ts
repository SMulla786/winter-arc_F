/*eslint-disable*/
import {api} from '@/utils/axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export const useGetDisposalPurchase = () => {
  return useQuery({
    queryKey: ['eventDisposalPurchase'],
    queryFn: () => getdiposalpurchase(),
  });
};
export const useSubmitEventDisposalPO = (eventId: string) => {
  return useMutation({
    mutationFn: (data) =>
      submitPurchaseorderEventDisposal(data, eventId, false), // Regular PO
    onSuccess: () => {
      toast.success('Event Disposal PO submitted successfully');
    },
  });
};

const getdiposalpurchase = async () => {
  try {
    const res = await api.get(`/cateror/disposalspurchase`);
    console.log('ressssss', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const submitPurchaseorderEventDisposal = async (
  data: any,
  eventId: string,
  isEmergency: boolean = false,
) => {
  try {
    const payload = {
      ...data,
      isEmergency, // Add the emergency flag
    };
    const response = await api.post(
      `/cateror/disposalspurchase/event/${eventId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add purchase order event',
      );
    }
    throw error;
  }
};
