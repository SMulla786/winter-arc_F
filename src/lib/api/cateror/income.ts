// api/clients.ts

import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {ClientCreate, ClientUpdate} from '@/types/cateror';
import {incomeSchema, updateIncomeSchema} from '@/lib/validation/incomeSchema';
import z from 'zod';

type addIncomeRequestBody = z.infer<typeof incomeSchema>;
type updateIncomeRequestBody = z.infer<typeof updateIncomeSchema>;

export type notificationEditPayload = {
  date: Date;
  particular: string;
  amount: string;
};

// Function to register a new client
const addIncome = async (data: addIncomeRequestBody & {id: string}) => {
  try {
    const response = await api.post(
      `/cateror/incomeExpenditures/${data.id}`,
      data,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add income expense',
      );
    }
    throw error;
  }
};

// Function to get a list of clients
const getIncomeExpenditure = async (id: string) => {
  try {
    const response = await api.get(`/cateror/incomeExpenditures/cateror/${id}`);
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to retrieve income expenditure',
      );
    }
    throw error;
  }
};

// Function to get a client by ID
const getIncomeExpenseById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/incomeExpenditures/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to retrieve income expense',
      );
    }
    throw error;
  }
};

// Function to update a client
const updateIncome = async (data: updateIncomeRequestBody) => {
  const {id} = data;

  try {
    const response = await api.put(`/cateror/incomeExpenditures/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Income expense',
      );
    }
    throw error;
  }
};

const deleteIncomeExpense = async (id: string) => {
  try {
    await api.delete(`/cateror/incomeExpenditures/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete income expense',
      );
    }
    throw error;
  }
};

export const notificationAccept = async (id: string) => {
  try {
    await api.post(`/cateror/incomeExpenditures/notification/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to accept income expense',
      );
    }
    throw error;
  }
};

export const notificationEdit = async (
  id: string,
  data: notificationEditPayload,
) => {
  try {
    console.log('data', data);
    await api.put(`/cateror/incomeExpenditures/notification/${id}`, data);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to edit income expense',
      );
    }
    throw error;
  }
};

export const getTotalAmount = async (id: string) => {
  try {
    const response = await api.get(`/cateror/events/total/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get total');
    }
    throw error;
  }
};

export {
  addIncome,
  getIncomeExpenditure,
  getIncomeExpenseById,
  updateIncome,
  deleteIncomeExpense,
};
