import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {Process, ProcessCreate, ProcessUpdate} from '../../../types/admin'; // Adjust the import paths based on your project

// Function to add a new process
const addProcess = async (data: ProcessCreate) => {
  try {
    const response = await api.post('/admin/process', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add Process');
    }
    throw error;
  }
};

// Function to get a list of Process with pagination and search
const getProcess = async () => {
  try {
    const response = await api.get('/admin/process');
    return response.data as {
      processes: Process[];
      total: number;
      page: number;
      limit: number;
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

// Function to get a specific Process by ID
const getProcessById = async (id: string) => {
  try {
    const response = await api.get(`/admin/process/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

// Function to update a Process by ID
const updateProcess = async (id: string, data: ProcessUpdate) => {
  try {
    const response = await api.patch(`/admin/process/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update process',
      );
    }
    throw error;
  }
};

// Function to delete a process by ID
const deleteProcess = async (id: string) => {
  try {
    await api.delete(`/admin/process/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete process',
      );
    }
    throw error;
  }
};

export {addProcess, getProcess, getProcessById, updateProcess, deleteProcess};
