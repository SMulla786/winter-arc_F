/*eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
    },
  });
};

export const uploadDocument = async (data: {
  documentName: string;
  documentUpload: File;
}) => {
  try {
    const response = await api.post(`/cateror/documents`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload Document',
      );
    }
    throw error;
  }
};
