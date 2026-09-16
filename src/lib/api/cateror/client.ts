// api/clients.ts

import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {ClientCreate, ClientUpdate} from '@/types/cateror';

// Function to register a new client
const registerClient = async (data: ClientCreate) => {
  try {
    const response = await api.post('/cateror/clients', data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to register client',
      );
    }
    throw error;
  }
};

// Function to get a list of clients
const getClients = async () => {
  try {
    const response = await api.get('/cateror/clients');
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to retrieve clients',
      );
    }
    throw error;
  }
};

// Function to get a client by ID
const getClientById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/clients/${id}`);
    console.log('sadsadsa', response);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to retrieve client',
      );
    }
    throw error;
  }
};

// Function to update a client
const updateClient = async (id: string, data: ClientUpdate) => {
  console.log(id, data);
  try {
    const response = await api.patch(`/cateror/clients/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update client',
      );
    }
    throw error;
  }
};

// Function to delete a client
const deleteClient = async (id: string) => {
  try {
    await api.delete(`/cateror/clients/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete client',
      );
    }
    throw error;
  }
};
const clientHistory = async (id: string) => {
  try {
    const response = await api.get(`/cateror/clients/history/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get client history',
      );
    }
    throw error;
  }
};

export {
  registerClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  clientHistory,
};
