import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import toast from 'react-hot-toast';
import {api} from '@/utils/axios';
import {
  addFoodVendor,
  addfoodVendor,
  deletedisplayFoodVendor,
  DeleteFoodVendor,
  dispalyfoodVendor,
  foodVendor,
  foodVendorPayAllPayload,
  foodVendorPayload,
  foodVendorPayPayload,
  getdisplayFoodVendor,
  getFoodVendor,
  getFoodVendorAllHistory,
  getFoodVendorHistory,
  payFoodVendor,
  payFoodVendorAdvance,
  payMultiFoodVendor,
  saveFoodVendor,
} from '@/lib/api/cateror/foodvender';
import {
  getFoodVendors,
  getSubeventWiseDishRateList,
} from '@/lib/api/cateror/Foodverndor';

export const useGetFoodVendor = (id: string) =>
  useQuery<foodVendor[]>({
    queryKey: ['foodvendor', id],
    queryFn: () => getFoodVendor(id),
    enabled: !!id,
  });

export const useGetFoodVendorHistory = (id: string) =>
  useQuery({
    queryKey: ['foodvendor_history', id],
    queryFn: () => getFoodVendorHistory(id),
    enabled: !!id,
  });

export const useGetFoodVendorAllHistory = (id: string) =>
  useQuery({
    queryKey: ['foodvendor_history', id],
    queryFn: () => getFoodVendorAllHistory(id),
    enabled: !!id,
  });

export const useDeleteFoodVendor = (roleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DeleteFoodVendor(id),

    onSuccess: () => {
      toast.success('Food Vendor Deleted');
      queryClient.invalidateQueries({queryKey: ['foodvendor', roleId]});
    },
    onError: () => {
      toast.error('Failed To Delete Food Vendor');
    },
  });
};

export const useSaveFoodVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: foodVendorPayPayload) => payFoodVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor_history']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed Food Vendor');
    // },
  });
};

export const useSaveMultiFoodVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: foodVendorPayAllPayload) => payMultiFoodVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor_history']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed Food Vendor');
    // },
  });
};

export const useSaveFoodVendorAdvancePay = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {amount: number}) => payFoodVendorAdvance(id, data),
    onSuccess: () => {
      toast.success('Food Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor_history']});
    },
    onError: () => {
      toast.error('Failed To Payed Food Vendor');
    },
  });
};

export const useSaveFoodVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: foodVendorPayload) => saveFoodVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Saved Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor']});
    },
    onError: () => {
      toast.error('Failed To Save Food Vendor');
    },
  });
};

export const useUpdateFoodVendor = (roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: foodVendorPayload}) =>
      api.put(`cateror/vendors/food/${id}`, data),
    onSuccess: () => {
      toast.success('Food Vendor Updated Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor', roleId]});
    },
    onError: () => {
      toast.error('Failed To Update Food Vendor');
    },
  });
};

export const useGetAllFoodVendors = () => {
  return useQuery({
    queryKey: ['food-vendors'],
    queryFn: () => getFoodVendors(),
  });
};

export const useGetAllSubeventWiseDishRateList = (eventId: string) => {
  return useQuery({
    queryKey: ['CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR'],
    queryFn: () => getSubeventWiseDishRateList(eventId),
  });
};

export const useAddFoodVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: addfoodVendor) => addFoodVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Saved Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor']});
    },
    onError: () => {
      toast.error('Failed To Save Food Vendor');
    },
  });
};

export const useDeleteDisplayFoodVendor = (roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletedisplayFoodVendor(id),

    onSuccess: () => {
      toast.success('Food Vendor Deleted');
      queryClient.invalidateQueries({queryKey: ['foodvendor', roleId]});
    },
    onError: () => {
      toast.error('Failed To Delete Food Vendor');
    },
  });
};

export const useGetDsiplayFoodVendor = (p0: string) => {
  return useQuery({
    queryKey: ['foodvendor'],
    queryFn: () => getdisplayFoodVendor(),
  });
};

export const useUpdateDisplayFoodVendor = (p0?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: dispalyfoodVendor}) =>
      api.put(`cateror/vendors/food/${id}`, data),
    onSuccess: () => {
      toast.success('Food Vendor Updated Succesfully');
      queryClient.invalidateQueries({queryKey: ['foodvendor', roleId]});
    },
    onError: () => {
      toast.error('Failed To Update Food Vendor');
    },
  });
};
