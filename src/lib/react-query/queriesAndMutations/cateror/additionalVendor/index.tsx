import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export type additionalVendorPayPayload = {
  amount: number;
  eventId: string;
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

export type additionalVendorPayAllPayload = {
  amount: number;
  eventId: {id: string}[];
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

const getAdditionalVendorHistoryById = async (id: string) => {
  const response = await api.get(`cateror/additional/history/${id}`);
  return response.data;
};

export const updateAdditionalVendor = async (data: {
  id: string;
  name: string;
  phone: string;
  address: string;
}) => {
  const response = await api.put(`cateror/additional/vendor/${data.id}`, data);
  return response.data;
};

export const getAdditionalVendorAllHistory = async (id: string) => {
  try {
    const response = await api.get(`cateror/additional/AllHistory/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed get additional vendor history');
    throw error;
  }
};
export const payAdditionalVendorAdvance = async (
  id: string,
  data: {amount: number},
) => {
  try {
    const response = await api.post(`cateror/additional/advance/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed pay advance additional vendor');
    throw error;
  }
};

export const saveAdditionalVendorPay = async (
  data: additionalVendorPayPayload,
) => {
  try {
    const response = await api.post(`cateror/additional/pay`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const payMultiAdditionalVendor = async (
  data: additionalVendorPayAllPayload,
) => {
  try {
    const response = await api.post(`cateror/additional/payMultiple`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

const useGetAdditionalVendorHistoryById = (id: string) => {
  return useQuery({
    queryKey: ['additionalVendorHistory', id],
    queryFn: () => getAdditionalVendorHistoryById(id),
    // enabled: !!id,
  });
};
const useSaveAdditionalVendorAdvancePay = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {amount: number}) =>
      payAdditionalVendorAdvance(id, data),
    onSuccess: () => {
      toast.success('Additional Vendor Advance Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['additionalVendorHistory']});
    },
    onError: () => {
      toast.error('Failed To Payed Additional Vendor');
    },
  });
};

const useSaveAdditionalVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: additionalVendorPayPayload) =>
      saveAdditionalVendorPay(data),
    onSuccess: () => {
      toast.success('Additional Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['additionalVendorHistory']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed Additional Vendor');
    // },
  });
};

const useSaveMultiAdditionalVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: additionalVendorPayAllPayload) =>
      payMultiAdditionalVendor(data),
    onSuccess: () => {
      toast.success('Additional Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['additionalVendorHistory']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed Additional Vendor');
    // },
  });
};

const useGetAdditionalVendorAllHistory = (id: string) =>
  useQuery({
    queryKey: ['additionalVendorAllHistory', id],
    queryFn: () => getAdditionalVendorAllHistory(id),
    enabled: !!id,
  });

const useGetAdditionalVendors = () => {
  return useQuery({
    queryKey: ['additional-vendors'],
    queryFn: async () => {
      const response = await api.get('/Cateror/additional/vendor');
      return response.data;
    },
  });
};

export {
  useGetAdditionalVendorHistoryById,
  useSaveAdditionalVendorAdvancePay,
  useSaveAdditionalVendorPay,
  useSaveMultiAdditionalVendorPay,
  useGetAdditionalVendorAllHistory,
  useGetAdditionalVendors,
};
