import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

const createBanquet = async (banquetData: {name: string; json: string}) => {
  try {
    const response = await api.post('/cateror/banquet', banquetData);
    return response.data;
  } catch (error) {
    console.error('Error creating banquet:', error);
    throw error;
  }
};
const updateBanquet = async (banquetData: {
  id: string;
  name: string;
  json: string;
}) => {
  try {
    const response = await api.put(
      `/cateror/banquet/${banquetData.id}`,
      banquetData,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating banquet:', error);
    throw error;
  }
};

const getBanquets = async () => {
  try {
    const response = await api.get('/cateror/banquet');
    return response.data;
  } catch (error) {
    console.error('Error fetching banquet:', error);
    throw error;
  }
};

const getBanquetById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/banquet/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching banquet:', error);
    throw error;
  }
};

const deleteBanquet = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/banquet/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting banquet:', error);
    throw error;
  }
};

export const useDeleteBanquet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBanquet,
    onSuccess: () => {
      toast.success('Banquet deleted successfully');
      qc.invalidateQueries({queryKey: ['banquets']});
    },
    onError: () => {
      toast.error('Failed to delete banquet');
    },
  });
};

export const useCreateBanquet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBanquet,
    onSuccess: () => {
      toast.success('Banquet created successfully');
      qc.invalidateQueries({queryKey: ['banquets']});
    },
    onError: () => {
      toast.error('Failed to create banquet');
    },
  });
};

export const useGetBanquets = () => {
  return useQuery({
    queryKey: ['banquets'],
    queryFn: getBanquets,
  });
};

export const useGetBanquetById = (id: string) => {
  return useQuery({
    queryKey: ['banquet', id],
    queryFn: () => getBanquetById(id),
  });
};

export const useUpdateBanquet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBanquet,
    onSuccess: () => {
      toast.success('Banquet updated successfully');
      qc.invalidateQueries({queryKey: ['banquets']});
    },
    onError: () => {
      toast.error('Failed to update banquet');
    },
  });
};
