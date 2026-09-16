// src/api/staffApi.ts
import {api} from '@/utils/axios';
import {StaffRegister, StaffUpdate} from '@/types/cateror';
import {AxiosError} from 'axios';

// Function to Register a new Staff
export const registerStaff = async (data: StaffRegister) => {
  try {
    const response = await api.post('cateror/staffs', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to register staff',
      );
    }
    throw error;
  }
};

// Get all Staff
export const getStaffs = async () => {
  try {
    const response = await api.get('cateror/staffs');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch staff');
    }
    throw error;
  }
};

// Get a single Staff by ID
export const getStaffById = async (id: string) => {
  try {
    const response = await api.get(`cateror/staffs/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get staff by ID',
      );
    }
    throw error;
  }
};

// Update a Staff by ID
export const updateStaff = async (id: string, data: StaffUpdate) => {
  try {
    const response = await api.patch(`cateror/staffs/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update staff',
      );
    }
    throw error;
  }
};

// Delete a Staff by ID
export const deleteStaff = async (id: string) => {
  try {
    await api.delete(`cateror/staffs/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete staff',
      );
    }
    throw error;
  }
};
