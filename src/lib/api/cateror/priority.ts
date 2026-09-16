import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getallPriorities = async () => {
  try {
    const res = await api.get('/cateror/priorities');
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get priorities',
      );
    }
    throw error;
  }
};

export const addPriority = async (data: {
  categoryId: string;
  priorities: {
    value: number;
    priority: string;
  }[];
}) => {
  try {
    const response = await api.post('/cateror/priorities', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add Priority',
      );
    }
    throw error;
  }
};

export const getPriorityById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/priorities/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Priority by ID',
      );
    }
    throw error;
  }
};

// API call to update priority
export const updatePriority = async ({
  id,
  data,
}: {
  id: string;
  data: {categoryId: string; priorities: {value: number; priority: string}[]};
}) => {
  if (!id) {
    throw new Error('ID is required to update priorities.');
  }

  if (
    !data.categoryId ||
    !Array.isArray(data.priorities) ||
    data.priorities.some(
      (p) => typeof p.value !== 'number' || typeof p.priority !== 'string',
    )
  ) {
    throw new Error('Invalid data format for updating priorities.');
  }

  try {
    const response = await api.patch(`/cateror/priorities/${id}`, data);
    return response.data; // Adjust based on API response structure
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Priority',
      );
    }
    throw error;
  }
};

export const deletePriority = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/priorities/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Priority',
      );
    }
    throw error;
  }
};
