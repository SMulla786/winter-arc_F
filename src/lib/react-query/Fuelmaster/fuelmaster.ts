import {api} from '@/utils/axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

export const getFuelList = async () => {
  try {
    const res = await api.get('/cateror/cateror/fuel');
    return res.data;
  } catch (error) {
    toast.error('Failed to get fuel list');
    throw error;
  }
};

export const updateFuelList = async (
  data: {
    name: string;
    price: number;
  }[],
) => {
  try {
    const res = await api.put('/cateror/cateror/fuel', data);
    return res.data;
  } catch (error) {
    toast.error('Failed to update fuel list');
    throw error;
  }
};

export const useGetFuels = () => {
  return useQuery({
    queryKey: ['fuel-list'],
    queryFn: getFuelList,
  });
};

export const useUpdateFuels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: {
        name: string;
        price: number;
      }[],
    ) => updateFuelList(data),
    onSuccess: () => {
      toast.success('Fuel prices updated');
      queryClient.invalidateQueries({queryKey: ['fuel-list']});
    },
  });
};
