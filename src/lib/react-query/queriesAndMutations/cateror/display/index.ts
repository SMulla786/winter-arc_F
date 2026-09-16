/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

const getAllDisplay = async () => {
  const response = await api.get('cateror/display');
  return response.data;
};

const createDisplay = async (data: any) => {
  const response = await api.post('cateror/display', data);
  return response.data;
};

const deleteDisplay = async (id: string) => {
  await api.delete(`cateror/display/${id}`);
};

const useGetAllDisplay = () => {
  return useQuery({
    queryKey: ['display'],
    queryFn: getAllDisplay,
  });
};

const useCreateDisplay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDisplay,
    onSuccess: () => {
      toast.success('Display created successfully');
      queryClient.invalidateQueries({queryKey: ['display']});
    },
    onError: () => {
      toast.error('Failed to create display');
    },
  });
};

const useDeleteDisplay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisplay,
    onSuccess: () => {
      toast.success('Display deleted successfully');
      queryClient.invalidateQueries({queryKey: ['display']});
    },
    onError: () => {
      toast.error('Failed to delete display');
    },
  });
};

export {useGetAllDisplay, useCreateDisplay, useDeleteDisplay};
