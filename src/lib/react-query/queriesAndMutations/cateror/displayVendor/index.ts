/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export type displayVendorPayPayload = {
  amount: number;
  eventId: string;
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

export type displayVendorPayAllPayload = {
  amount: number;
  eventId: {id: string}[];
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

const getAllDisplayVendor = async () => {
  const response = await api.get('cateror/display/vendor');
  return response.data;
};

const getDisplayVendorById = async (id: string) => {
  const response = await api.get(`cateror/display/vendor/${id}`);
  return response.data;
};

const getAllDisplayVendorData = async (id: string) => {
  const response = await api.get(`cateror/events/display/${id}`);
  return response.data;
};
const getDisplayVendorHistoryById = async (id: string) => {
  const response = await api.get(`cateror/display/history/${id}`);
  return response.data;
};

export const updateDisplayVendor = async (data: any) => {
  const response = await api.put(`cateror/display/vendor/${data.id}`, data);
  return response.data;
};

const createDisplayVendor = async (data: any) => {
  const response = await api.post('cateror/display/vendor', data);
  return response.data;
};

const createDisplayVendorDisplays = async (vendorId: string, data: any) => {
  const response = await api.post(`cateror/display/add/${vendorId}`, data);
  return response.data;
};

const deleteDisplayVendor = async (id: string) => {
  await api.delete(`cateror/display/vendor/${id}`);
};

export const payDisplayVendorAdvance = async (
  id: string,
  data: {amount: number},
) => {
  try {
    const response = await api.post(`cateror/display/advance/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed pay advance display vendor');
    throw error;
  }
};

export const saveDisplayVendorPay = async (data: displayVendorPayPayload) => {
  try {
    const response = await api.post(`cateror/display/pay`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const payMultiDisplayVendor = async (
  data: displayVendorPayAllPayload,
) => {
  try {
    const response = await api.post(`cateror/display/payMultiple`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const getDisplayVendorAllHistory = async (id: string) => {
  try {
    const response = await api.get(`cateror/display/AllHistory/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed get display vendor history');
    throw error;
  }
};

const useGetAllDisplayVendor = () => {
  return useQuery({
    queryKey: ['displayvendor'],
    queryFn: getAllDisplayVendor,
  });
};
const useGetDisplayVendorById = (id: string) => {
  return useQuery({
    queryKey: ['displayvendor', id],
    queryFn: () => getDisplayVendorById(id),
    enabled: !!id,
  });
};

const useGetAllDisplayVendorData = (id: string) => {
  return useQuery({
    queryKey: ['displayvendordata', id],
    queryFn: () => getAllDisplayVendorData(id),
    enabled: !!id,
  });
};

const useUpdateDisplayVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDisplayVendor,
    onSuccess: () => {
      toast.success('Display Vendor updated successfully');
      queryClient.invalidateQueries({queryKey: ['displayvendor']});
    },
    onError: () => toast.error('Failed to update display vendor'),
  });
};

const useCreateDisplayVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDisplayVendor,
    onSuccess: () => {
      toast.success('Display Vendor created successfully');
      queryClient.invalidateQueries({queryKey: ['displayvendor']});
    },
    onError: () => {
      toast.error('Failed to create display vendor');
    },
  });
};

export const useCreateDisplayVendorDisplays = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({data}: {data: any}) =>
      createDisplayVendorDisplays(vendorId, data),
    onSuccess: () => {
      toast.success('Displays created successfully');
      queryClient.invalidateQueries({queryKey: ['displayvendor']});
    },

    onError: () => {
      toast.error('Failed to create display vendor');
    },
  });
};

const useDeleteDisplayVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisplayVendor,
    onSuccess: () => {
      toast.success('Display Vendor deleted successfully');
      queryClient.invalidateQueries({queryKey: ['displayvendor']});
    },
    onError: () => {
      toast.error('Failed to delete display vendor');
    },
  });
};

const useGetDisplayVendorHistoryById = (id: string) => {
  return useQuery({
    queryKey: ['displayVendorHistory', id],
    queryFn: () => getDisplayVendorHistoryById(id),
    // enabled: !!id,
  });
};
const useSaveDisplayVendorAdvancePay = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {amount: number}) => payDisplayVendorAdvance(id, data),
    onSuccess: () => {
      toast.success('Display Vendor Advance Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['displayVendorHistory']});
    },
    onError: () => {
      toast.error('Failed To Payed Display Vendor');
    },
  });
};

const useSaveDisplayVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: displayVendorPayPayload) => saveDisplayVendorPay(data),
    onSuccess: () => {
      toast.success('Display Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['displayVendorHistory']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed Display Vendor');
    // },
  });
};

const useSaveMultiDisplayVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: displayVendorPayAllPayload) =>
      payMultiDisplayVendor(data),
    onSuccess: () => {
      toast.success('Display Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['displayVendorHistory']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed Display Vendor');
    // },
  });
};

const useGetDisplayVendorAllHistory = (id: string) =>
  useQuery({
    queryKey: ['displayVendorAllHistory', id],
    queryFn: () => getDisplayVendorAllHistory(id),
    enabled: !!id,
  });

export {
  useGetAllDisplayVendor,
  useCreateDisplayVendor,
  useDeleteDisplayVendor,
  useGetDisplayVendorById,
  useUpdateDisplayVendor,
  useGetAllDisplayVendorData,
  useGetDisplayVendorHistoryById,
  useSaveDisplayVendorAdvancePay,
  useSaveDisplayVendorPay,
  useSaveMultiDisplayVendorPay,
  useGetDisplayVendorAllHistory,
};
