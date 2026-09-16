/*eslint-disable*/

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_CLIENT_KEYS, INCOME_EXPENSE_KEYS} from '../../queryKeys';

import {ClientUpdate} from '@/types/cateror';
import toast from 'react-hot-toast';
import {
  addIncome,
  deleteIncomeExpense,
  getIncomeExpenditure,
  getIncomeExpenseById,
  getTotalAmount,
  notificationAccept,
  notificationEdit,
  notificationEditPayload,
  updateIncome,
} from '@/lib/api/cateror/income';
import {getIncomeAndExpenditure} from '@/lib/api/cateror/income&expenditure';
import {string} from 'zod';

// Hook to create client
const useAddIncomeExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addIncome,
    onSuccess: () => {
      toast.success('Income Expense Added!');
    },
    onError: () => {
      toast.error('Failed to add Income expense!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [INCOME_EXPENSE_KEYS.GET_INCOME_EXPENSES],
      });
    },
  });
};

const useUpdateIncomeExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIncome,
    onSuccess: () => {
      toast.success('Income Expense Updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update Income expense!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [INCOME_EXPENSE_KEYS.GET_INCOME_EXPENSES],
      });
    },
  });
};

// Hook to get all clients
const useGetIncomeExpenseById = (id: string) => {
  return useQuery({
    queryKey: [INCOME_EXPENSE_KEYS.GET_INCOME_EXPENSE_BY_ID],
    queryFn: () => getIncomeExpenseById(id),
  });
};

const useGetIncomeExpenseByCaterorId = (id: string) => {
  return useQuery({
    queryKey: [INCOME_EXPENSE_KEYS.GET_INCOME_EXPENSES],
    queryFn: () => getIncomeExpenditure(id),
  });
};

const useDeleteIncomeExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIncomeExpense,
    onSuccess: () => {
      toast.success('Income Expense Deleted!');
    },
    onError: () => {
      toast.error('Failed to delete Income expense!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [INCOME_EXPENSE_KEYS.GET_INCOME_EXPENSES],
      });
    },
  });
};

export const useAcceptncomeExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAccept(id),

    onSuccess: () => {
      toast.success('Income Expense Accepted!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept Income expense!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['notification'],
      });
    },
  });
};

export const useEditIncomeExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: notificationEditPayload}) =>
      notificationEdit(id, data),

    onSuccess: () => {
      toast.success('Income Expense Updated!');
    },

    onError: (error: any) => {
      toast.error(error.message || 'Failed to update Income expense!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['notification'],
      });
    },
  });
};

const useGetTotalAmount = (id: string) => {
  return useQuery({
    queryKey: ['total'],
    queryFn: () => getTotalAmount(id),
  });
};

export {
  useAddIncomeExpense,
  useUpdateIncomeExpense,
  useGetIncomeExpenseById,
  useGetIncomeExpenseByCaterorId,
  useDeleteIncomeExpense,
  useGetTotalAmount,
};
