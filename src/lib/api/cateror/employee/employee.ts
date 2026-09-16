import {EmployeeCreate, EmployeeSetting} from '@/types/cateror';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const CreateEmployee = async (data: EmployeeCreate) => {
  console.log('====================================');
  console.log('data:::::', data);
  console.log('====================================');
  try {
    const response = await api.post('/cateror/employee', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to register Employee',
      );
    }
    throw error;
  }
};

export const getEmployee = async () => {
  try {
    const response = await api.get('/cateror/employee');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to retrieve Employee',
      );
    }
    throw error;
  }
};

export const getEmployeeById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/employee/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to retrieve Employee',
      );
    }
    throw error;
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/employee/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Employee',
      );
    }
    throw error;
  }
};

export const updateEmployee = async (id: string, data: EmployeeCreate) => {
  try {
    const response = await api.put(`/cateror/employee/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Employee',
      );
    }
    throw error;
  }
};

export const updateEmployeeSetting = async (
  id: string,
  data: EmployeeSetting,
) => {
  try {
    const response = await api.put(`/cateror/employee/access/${id}`, data); // ✅ Send full data object
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Employee',
      );
    }
    throw error;
  }
};
