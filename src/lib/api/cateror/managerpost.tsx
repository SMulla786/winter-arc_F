import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export interface Manager {
  name: string;
}

export interface Service {
  name: string;
  price: number;
}

export interface AssignManager {
  managerPostId: string;
  employeeId: string;
}

export interface CounterPayload {
  employeeId?: string;
  count: number[];
}

export type ExtraVendorPayload = Array<{
  vendorId: string;
  count: number;
}>;

export const createManagerPost = async (data: Manager) => {
  try {
    const response = await api.post('/cateror/managerposts', data);
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

export const updateManagerPost = async (id: string, data: Manager) => {
  try {
    const response = await api.put(`/cateror/dresscode/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Manager',
      );
    }
    throw error;
  }
};

export const deleteManagerPost = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/managerposts/${id}`);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Manager',
      );
    }
    throw error;
  }
};

export const getManagerPost = async () => {
  try {
    const response = await api.get(`/cateror/managerposts`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const getManagerPostById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/managerposts/event/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Manager by ID',
      );
    }
    throw error;
  }
};
export const createDressCode = async (data: Manager) => {
  try {
    const response = await api.post('/cateror/dresscode', data);
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

export const updateDressCode = async (id: string, data: Manager) => {
  try {
    const response = await api.put(`/cateror/dresscode/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Manager',
      );
    }
    throw error;
  }
};

export const deleteDressCode = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/dresscode/${id}`);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Manager',
      );
    }
    throw error;
  }
};

export const getDressCode = async () => {
  try {
    const response = await api.get(`/cateror/dresscode`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const getDressCodeById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/dresscode/event/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Manager by ID',
      );
    }
    throw error;
  }
};

export const createManageServicePost = async (data: Service) => {
  try {
    const response = await api.post('/cateror/counterservice', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to register Service',
      );
    }
    throw error;
  }
};

export const updateManageServicePost = async (id: string, data: Service) => {
  try {
    const response = await api.put(`/cateror/counterservice/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Service',
      );
    }
    throw error;
  }
};

export const deleteManageServicePost = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/counterservice/${id}`);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Service',
      );
    }
    throw error;
  }
};

export const getManageServicePost = async () => {
  try {
    const response = await api.get(`/cateror/counterservice`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Service');
    }
    throw error;
  }
};

export const getManageServicePostById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/counterservice/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Service by ID',
      );
    }
    throw error;
  }
};

/**
 <<<<<<<<<<<<<<<<<<<<<<<<Assign MANAGER FOR EMPLOYEE >>>>>>>>>>>>>>>>>>>>>>>>>
 */

// Update your assignManagerPost function to handle array
export const assignManagerPost = async (id: string, data: AssignManager[]) => {
  try {
    const response = await api.post(`/cateror/managerposts/event/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign Managers',
      );
    }
    throw error;
  }
};

export const getAllAssignManagerPost = async () => {
  try {
    const response = await api.get(`/cateror/assignmanager`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Assign Manager',
      );
    }
    throw error;
  }
};

export const getAssignManagerPostById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/managerposts/event/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Assign Manager by ID',
      );
    }
    throw error;
  }
};

export const updateAssignManagerPost = async (
  id: string,
  data: AssignManager,
) => {
  try {
    const response = await api.put(`/cateror/assignmanager/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Assign Manager',
      );
    }
    throw error;
  }
};

export const deleteAssignManagerPost = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/assignmanager/event/${id}`);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Assign Manager',
      );
    }
    throw error;
  }
};

// <<<<<<<<<<<<<<<<<<<<<<<<Assign COUNTER >>>>>>>>>>>>>>>>>>>>>>>>>

interface CounterService {
  serviceId: string;
  vendorId: {id: string}[];
  employeeId: {id: string}[];
  maharajId: {id: string}[];
  count: number;
  price: number;
}

interface CounterData {
  counterId?: string;
  name: string;
  dishes: {id: string}[];
  services: CounterService[];
}

interface Data extends CounterData {}
interface UpdatedCounter extends CounterData {
  counterId: string;
}
[];
export const assignCounter = async (subEventid: string, data: Data) => {
  try {
    const response = await api.post(`cateror/counter/${subEventid}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign Counter',
      );
    }
    throw error;
  }
};
export const updateAssignedCounter = async (
  subEventId: string,
  data: UpdatedCounter,
) => {
  try {
    const response = await api.put(`cateror/counter/${subEventId}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign Counter',
      );
    }
    throw error;
  }
};

export const getAssignCounterById = async (id: string) => {
  try {
    const response = await api.get(`cateror/counter/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Assign Manager by ID',
      );
    }
    throw error;
  }
};

export const deleteAssignCounterById = async (id: string) => {
  try {
    const response = await api.delete(`cateror/counter/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Assign Counter',
      );
    }
    throw error;
  }
};

// <<<<<<<<<<<<<<<<<<<<<<<< Extra Vendor >>>>>>>>>>>>>>>>>>>>>>>>>

export const assignExtraVendor = async (
  id: string,
  data: ExtraVendorPayload,
) => {
  try {
    const response = await api.post(`cateror/counter/extra/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign Extra Vendor',
      );
    }
    throw error;
  }
};

export const getAssignExtraVendorById = async (id: string) => {
  try {
    const response = await api.get(`cateror/counter/extra/${id}`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Assign Manager by ID',
      );
    }
    throw error;
  }
};

export const updateAssignExtraVendorPost = async (
  id: string,
  data: ExtraVendorPayload,
) => {
  try {
    const response = await api.put(`cateror/counter/extra/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Assign Manager',
      );
    }
    throw error;
  }
};
