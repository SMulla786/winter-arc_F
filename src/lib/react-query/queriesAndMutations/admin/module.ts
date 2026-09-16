/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export const useModulewise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addmodule,
    onSuccess: () => {
      toast.success('Module configuration saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save module configuration');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulewise'],
      });
    },
  });
};

interface ModuleData {
  plan: string;
  pages: any[];
}

export const addmodule = async (moduleData: ModuleData) => {
  try {
    // Only send plan and pages to backend
    const dataToSend = {
      plan: moduleData.plan,
      pages: moduleData.pages,
    };

    const res = await api.post('admin/module', dataToSend);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to save module configuration',
      );
    }
    throw error;
  }
};
