/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

const getExpense = async () => {
  try {
    const response = await api.get(`/cateror/expenses`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Expense');
    }
    throw error;
  }
};

const createExpense = async (data: any) => {
  try {
    const response = await api.post(`/cateror/expenses`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to create Expense',
      );
    }
    throw error;
  }
};

const updateExpense = async (data: any) => {
  try {
    const response = await api.put(`/cateror/expenses/${data.id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Expense',
      );
    }
    throw error;
  }
};

const deleteExpense = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/expenses/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Expense',
      );
    }
    throw error;
  }
};

const useGetExpense = () => {
  return useQuery({
    queryKey: ['expense'],
    queryFn: getExpense,
  });
};

const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      toast.success('Expense created!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create expense');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['expense']});
    },
  });
};

const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      toast.success('Expense updated!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update expense');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['expense']});
    },
  });
};

const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      toast.success('Expense deleted!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete expense');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['expense']});
    },
  });
};

export {useGetExpense, useCreateExpense, useUpdateExpense, useDeleteExpense};
