import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

type LabourVendor = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  rawMaterialCalculation: boolean;
  dailySalary?: number;
  transport?: string;
  dishes?: {
    dishId: string;
  }[];
};

type FoodVendor = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  rawMaterialCalculation: boolean;
  dailySalary?: number;
  transport?: string;
  dishes?: {
    dishId: string;
    range: {from: string; to: string; rate: string}[];
  }[];
};
type UpdateFoodVendor = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  transport?: string;
  dailySalary?: number;
  dishes?: {
    dishId: string;
    range: {from: string; to: string; rate: string}[];
  }[];
};
type UpdateLabourVendor = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  transport?: string;
  dailySalary?: number;
  dishes?: {
    dishId: string;
  }[];
};

const dishesWithCategories = async () => {
  try {
    const response = await api.get('/cateror/dishes/categorywise');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to fetch dishes with categories',
      );
    }
    throw error;
  }
};

const saveLabourVendor = async (data: LabourVendor) => {
  try {
    const response = await api.post(`cateror/vendors/food`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to add food vendor');
    throw error;
  }
};

const saveFoodVendor = async (data: FoodVendor) => {
  try {
    const response = await api.post(`cateror/vendors/food`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to add food vendor');
    throw error;
  }
};
const UpdateLabourVendor = async (id: string, data: UpdateLabourVendor) => {
  try {
    const response = await api.put(`cateror/vendors/food/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to update food vendor');
    throw error;
  }
};
const UpdateFoodVendor = async (id: string, data: UpdateFoodVendor) => {
  try {
    const response = await api.put(`cateror/vendors/food/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to update food vendor');
    throw error;
  }
};

const getFoodVendors = async () => {
  try {
    const response = await api.get(`cateror/vendors/food`);
    console.log('getfdataa of club vendorss', response);
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch food vendor');
    throw error;
  }
};

const deleteFoodVendor = async (id: string) => {
  try {
    const response = await api.delete(`cateror/vendors/food/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed to delete food vendor');
    throw error;
  }
};

const useDishesWithCategories = () => {
  return useQuery({
    queryFn: dishesWithCategories,
    queryKey: ['dishesWithCategories'],
  });
};

const useGetAllFoodVendors = () => {
  return useQuery({
    queryKey: ['food-vendors'],
    queryFn: () => getFoodVendors(),
  });
};

const useDeleteFoodVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFoodVendor(id),
    onSuccess: () => {
      toast.success('Food Vendor Deleted Succesfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
    },
    onError: () => {
      toast.error('Failed To Delete Food Vendor');
    },
  });
};

const useSaveLabourVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LabourVendor) => saveLabourVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Saved Succesfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
    },
    onError: (err) => {
      toast.error(err.response.data.errors[0] || 'Failed To Save Food Vendor');
    },
  });
};
const useSaveFoodVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FoodVendor) => saveFoodVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Saved Succesfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
    },
    onError: () => {
      toast.error('Failed To Save Food Vendor');
    },
  });
};

const useUpdateLabourVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateLabourVendor}) =>
      UpdateLabourVendor(id, data),
    onSuccess: () => {
      toast.success('Food Vendor Updated Succesfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
    },
    onError: () => {
      toast.error('Failed To Update Food Vendor');
    },
  });
};
const useUpdateFoodVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateFoodVendor}) =>
      UpdateFoodVendor(id, data),
    onSuccess: () => {
      toast.success('Food Vendor Updated Succesfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
    },
    onError: () => {
      toast.error('Failed To Update Food Vendor');
    },
  });
};

export {
  useDishesWithCategories,
  useSaveLabourVendor,
  useUpdateLabourVendor,
  useGetAllFoodVendors,
  useDeleteFoodVendor,
  useSaveFoodVendor,
  useUpdateFoodVendor,
};
