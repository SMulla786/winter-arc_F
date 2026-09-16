import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export type servicePayload = {
  name: string;
  price: number;
};

export type AddOnService = {
  id: string;
  name: string;
  price: number;
};

const saveAddOnService = async (id: string, data: servicePayload) => {
  try {
    const response = await api.post(`cateror/additionalService`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to add addon Service');
    throw error;
  }
};

const getAddOnService = async (id: string) => {
  try {
    const response = await api.get(`cateror/additionalService`);
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch addon service');
    throw error;
  }
};

const DeleteAddOnService = async (id: string) => {
  try {
    const response = await api.delete(`cateror/additionalService/${id}`);
    return response.data;
  } catch (error) {
    toast.error('Failed to delete addon service');
    throw error;
  }
};

const UpdateAddOnService = async (id: string, data: servicePayload) => {
  try {
    const response = await api.put(`cateror/additionalService/${id}`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to update addon service');
    throw error;
  }
};

export {
  saveAddOnService,
  getAddOnService,
  DeleteAddOnService,
  UpdateAddOnService,
};

const addExtraAddons = async (occId: string, data: {id: string[]}) => {
  try {
    const response = await api.put(`admin/functionWork/addon/${occId}`, data);
    console.log('Response from addExtraAddons:', response.data);
    return response.data;
  } catch (error) {
    toast.error('Failed to update addon service');
    throw error;
  }
};

export const useAddExtraAddons = (occId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {id: string[]}) => addExtraAddons(occId, data),
    onSuccess: () => {
      toast.success('Addon service updated successfully');
      queryClient.invalidateQueries({queryKey: ['addon_services', occId]});
    },
    onError: () => {
      toast.error('Failed to update addon service');
    },
  });
};
