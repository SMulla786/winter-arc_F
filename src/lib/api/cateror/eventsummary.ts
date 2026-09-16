/*eslint-disable */
import {
  AdditionalType,
  TransportType,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
//VEHICLE
export const createVehicle = (data: any) => {
  try {
    const response = api.post('cateror/transport', data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateVehicle = (id: string, data: any) => {
  try {
    const response = api.put(`cateror/transport/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getVehicles = async () => {
  try {
    const response = await api.get(`cateror/transport`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    const response = await api.delete(`cateror/transport/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//ADDITIONAL
export const addAdditional = async (eventId: string, data: AdditionalType) => {
  try {
    const response = await api.post(
      `cateror/events/additional/${eventId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdditional = async (eventId: string) => {
  try {
    const response = await api.get(`cateror/events/additional/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAdditional = async (id: string, data: AdditionalType) => {
  try {
    const response = await api.put(`cateror/events/additional/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteAdditional = async (id: string) => {
  try {
    const response = await api.delete(`cateror/events/additional/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addTransport = async (eventId: string, data: TransportType) => {
  try {
    const response = await api.post(
      `cateror/events/transport/${eventId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//TRANSPORT
export const getTransport = async (eventId: string) => {
  try {
    const response = await api.get(`cateror/events/transport/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTransport = async (id: string) => {
  try {
    const response = await api.delete(`cateror/events/transport/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTransport = async (id: string, data: TransportType) => {
  try {
    const response = await api.put(`cateror/events/transport/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

type FuelType = {
  name: string;
  price: number;
  quantity: number;
  total: number;
};

export const addFuel = async (eventId: string, data: FuelType) => {
  try {
    const response = await api.post(`cateror/events/fuel/${eventId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFuel = async (id: string) => {
  try {
    const response = await api.delete(`cateror/events/fuel/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFuel = async (eventId: string) => {
  try {
    const response = await api.get(`cateror/events/fuel/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFuel = async (id: string, data: FuelType) => {
  try {
    const response = await api.put(`cateror/events/fuel/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
