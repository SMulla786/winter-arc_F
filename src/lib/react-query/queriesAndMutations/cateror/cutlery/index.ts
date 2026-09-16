/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

const getAllCutlery = async () => {
  try {
    const response = await api.get('cateror/cutlery');
    return response.data;
  } catch (error) {
    throw error;
  }
};

//A mutation function that performs a side effect (usually a POST/PUT/DELETE request) and returns a promise.
const createCutlery = async (data: any) => {
  try {
    const response = await api.post('cateror/cutlery', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteCutlery = async (id: string) => {
  try {
    alert(id);
    await api.delete(`cateror/cutlery/${id}`);
  } catch (error) {
    throw error;
  }
};

const useGetAllCutlery = () => {
  return useQuery({
    queryKey: ['cutlery'],
    queryFn: getAllCutlery,
  });
};

const useCreateCutlery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCutlery,
    onSuccess: () => {
      toast.success('Cutlery created successfully');
      queryClient.invalidateQueries({
        queryKey: ['cutlery'],
      });
    },
    onError: () => {
      toast.error('Failed to create cutlery');
    },
  });
};




const useDeleteCutlery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCutlery,
    onSuccess: () => {
      toast.success('Cutlery deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['cutlery'],
      });
    },
    onError: () => {
      toast.error('Failed to delete cutlery');
    },
  });
};

export {useGetAllCutlery, useCreateCutlery, useDeleteCutlery};
