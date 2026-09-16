// src/api/maharajApi.ts
import {api} from '@/utils/axios';
import {Maharaj, MaharajUpdate} from '@/types/cateror';
import {AxiosError} from 'axios';
import z, {string} from 'zod';
import {maharajSchema} from '@/lib/validation/maharajSchema';

type CreateMaharajTypes = z.infer<typeof maharajSchema>;

// Register a new Maharaj
export const registerMaharaj = async (data: CreateMaharajTypes) => {
  try {
    const response = await api.post('/cateror/maharajs', data);
    console.log('dataaaaaaaa', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to register Maharaj',
      );
    }
    throw error;
  }
};

// Get all Maharajs with optional query parameters
export const getMaharajs = async (queryParams?: Maharaj) => {
  try {
    const response = await api.get('cateror/maharajs', {params: queryParams});
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Maharajs',
      );
    }
    throw error;
  }
};

// Get a single Maharaj by ID
export const getMaharajById = async (id: string) => {
  try {
    const response = await api.get(`cateror/maharajs/${id}`);
    console.log('API Response:', response.data); // Add logging here
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Maharaj by ID',
      );
    }
    throw error;
  }
};

// Function to Update a Maharaj by ID
export const updateMaharaj = async (id: string, data: MaharajUpdate) => {
  try {
    console.log(id, data);
    const response = await api.patch(`cateror/maharajs/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Maharaj',
      );
    }
    throw error;
  }
};

// Delete a Maharaj by ID
export const deleteMaharaj = async (id: string) => {
  try {
    await api.delete(`cateror/maharajs/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Maharaj',
      );
    }
    throw error;
  }
};
export const getMaharajDishes = async () => {
  try {
    const response = await api.get(`/cateror/maharajs/dishes`);
    //console.log('dishes response', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Maharaj dishes',
      );
    }
    throw error;
  }
};

export const getDishUpdate = async (id: string) => {
  try {
    const response = await api.get(`/cateror/maharajs/dishes/${id}`);
    console.log('dishes response', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get dishes');
    }
    throw error;
  }
};

export const getMaharajData = async (id: string) => {
  try {
    const response = await api.get(`/cateror/maharajs/data/${id}`);
    console.log('Maharaj Data:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Maharaj data',
      );
    }
    throw error;
  }
};
