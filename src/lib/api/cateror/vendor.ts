import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {VendorRegister, VendorUpdate} from '@/types/cateror';

// Function to add a new Vendor
const registerVendor = async (data: VendorRegister) => {
  try {
    const response = await api.post('cateror/vendors/', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add Process');
    }
    throw error;
  }
};

// Function to get a list of Vendor with pagination and search
const getVendors = async () => {
  try {
    const response = await api.get('cateror/vendors');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

// Function to get a specific Vendor by ID
const getVendorById = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

// Function to update a Vendor by ID
const updateVendor = async (id: string, data: VendorUpdate) => {
  try {
    const response = await api.patch(`cateror/vendors/${id}`, data);
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

// Function to delete a Vendor by ID
const deleteVendor = async (id: string) => {
  try {
    await api.delete(`cateror/vendors/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete process',
      );
    }
    throw error;
  }
};

export {registerVendor, getVendorById, getVendors, updateVendor, deleteVendor};
