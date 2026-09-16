/* eslint-disable */
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {manpowerPayPayload} from './foodvender';
import toast from 'react-hot-toast';
import {
  manPowerVendorPayAllPayload,
  manPowerVendorPayPayload,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';

export interface VendorManpower {
  name: string;
  phone: string;
  address: string;
  role: string;
  price: string;
}
export interface vendorPayPayload {
  amount: number;
  id: string;
}

export interface menPowerVendor {}
export const registerVendorManpower = async (data: VendorManpower) => {
  try {
    const response = await api.post('cateror/vendors/manpower', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add Process');
    }
    throw error;
  }
};

export const vendorPay = async (data: vendorPayPayload) => {
  try {
    console.log('api data', data);
    const response = await api.post('cateror/vendors/manpower/pay', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add pay');
    }
    throw error;
  }
};

export const getVendorManpower = async () => {
  try {
    const response = await api.get('cateror/vendors/manpower');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const getVendorManpowerById = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/manpower/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const savemenPower = async (data: any) => {
  try {
    console.log('api data', data);
    const response = await api.post('cateror/events/subevent/manpower', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add pay');
    }
    throw error;
  }
};

export const getManpowerEvent = async (id: string) => {
  try {
    const response = await api.get(
      `cateror/events/managerposts/manpower/${id}`,
    );
    console.log('getmenpowerdataaaaa', response);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const updateVendorManpower = async (
  id: string,
  data: VendorManpower,
) => {
  try {
    const response = await api.patch(`cateror/vendors/manpower/${id}`, data);
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

export const deleteVendorManpower = async (id: string) => {
  try {
    const response = await api.delete(`cateror/vendors/manpower/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete process',
      );
    }
    throw error;
  }
};

export const getAllVendorManpowerRole = async () => {
  try {
    const response = await api.get(`cateror/vendors/manpower/role`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};
export const getAllKitchenVendorManpowerRole = async (subeventId: string) => {
  try {
    const response = await api.get(`cateror/dresscode/roles/${subeventId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};
export const getVendorManpowerRole = async (vendorId: string) => {
  try {
    const response = await api.get(`cateror/vendors/manpower/${vendorId}`);
    console.log('dataaaaaaaaaaa', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};
export const addVendorManpowerRole = async (data: {
  name: string;
  price: number;
  roleType: string;
}) => {
  try {
    const response = await api.post(`cateror/vendors/manpower/role`, data);
    // console.log('Vendor Roles', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add process');
    }
    throw error;
  }
};

export const deleteVendorManpowerRole = async (id: string) => {
  try {
    const response = await api.delete(`cateror/vendors/manpower/role/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete process',
      );
    }
    throw error;
  }
};

export const updateVendorManpowerRole = async (data: {
  id: string;
  name: string;
  price: number;
  roleType: string;
}) => {
  try {
    const response = await api.put(`cateror/vendors/manpower/role/${data.id}`, {
      name: data.name,
      price: data.price,
      roleType: data.roleType,
    });
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

export const payPendingVendorManpower = async (data: {
  id: string;
  amount: number;
}) => {
  try {
    const response = await api.put(`cateror/vendors/manpower/pay/${data.id}`, {
      amount: data.amount,
    });
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

export const payMenPowerVendor = async (data: manpowerPayPayload) => {
  try {
    const response = await api.post(`cateror/vendors/manpower/pay`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed pay food vendor');
    throw error;
  }
};

export const getManPowerVendorHistoryById = async (id: string) => {
  const response = await api.get(`cateror/vendors/manpower/history/${id}`);
  return response.data;
};

export const saveManPowerVendorAdvancePay = async (
  id: string,
  data: {amount: number},
) => {
  try {
    const response = await api.post(
      `cateror/vendors/manpower/advance/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    toast.error('Failed pay advance manpower vendor');
    throw error;
  }
};

export const saveManPowerVendorPay = async (data: manPowerVendorPayPayload) => {
  try {
    const response = await api.post(`cateror/vendors/manpower/pay`, data);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const payMultiManPowerVendor = async (
  data: manPowerVendorPayAllPayload,
) => {
  try {
    const response = await api.post(
      `cateror/vendors/manpower/payMultiple`,
      data,
    );
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
};

export const getManPowerVendorAllHistory = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/manpower/AllHistory/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed get display vendor history');
    throw error;
  }
};
export const newKitchenManpower = async (
  subEventId: string,
  data: {
    vendorId?: string;
    employeeId?: string;
    serviceId: string;
    quantity: number;
    price: number;
    transport: number;
    total: number;
  },
) => {
  try {
    const response = await api.post(
      `cateror/counter/kitchen/${subEventId}`,
      data,
    );
    return response.data;
  } catch (error) {
    toast.error('Failed to add Kitchen Manpower');
    throw error;
  }
};

export const updateKitchenManpower = async (data: {
  id: string;
  employeeId?: string;
  serviceId: string;
  quantity: number;
  price: number;
  transport: number;
  total: number;
}) => {
  try {
    const response = await api.put(`cateror/counter/kitchen/${data?.id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteKitchenManpower = async (id: string) => {
  try {
    const response = await api.delete(`cateror/counter/kitchen/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed to delete Kitchen Manpower');
    throw error;
  }
};

export const getKItchenManpower = async (subEventId: string) => {
  try {
    const response = await api.get(`cateror/counter/kitchen/${subEventId}`);
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch Kitchen Manpower');
    throw error;
  }
};
