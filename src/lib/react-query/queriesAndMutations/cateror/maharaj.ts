/*eslint-disable*/
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_MAHARAJ_KEYS} from '../../queryKeys';
import {Maharaj, MaharajUpdate} from '@/types/cateror';
import {
  deleteMaharaj,
  getDishUpdate,
  getMaharajById,
  getMaharajData,
  getMaharajDishes,
  getMaharajs,
  registerMaharaj,
  updateMaharaj,
} from '@/lib/api/cateror/maharaj';
import toast from 'react-hot-toast';

// Hook to create a Maharaj
const useCreateMaharaj = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerMaharaj,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_MAHARAJ_KEYS.GET_ALL_MAHARAJS],
      });
      toast.success('Maharaj created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create Maharaj');
    },
  });
};
// Hook to get all Maharajs
const useGetAllMaharaj = (queryParams?: Maharaj) => {
  return useQuery({
    queryKey: [CATEROR_MAHARAJ_KEYS.GET_ALL_MAHARAJS],
    queryFn: () => getMaharajs(queryParams),
  });
};

// Hook to get a Maharaj by ID
const useGetMaharajById = (id: string) => {
  //  console.log('useGetMaharajById called with ID:', id);

  return useQuery({
    queryKey: [CATEROR_MAHARAJ_KEYS.GET_MAHARAJ_BY_ID, id], // Use dynamic query key
    queryFn: () => getMaharajById(id),
    enabled: !!id, // Only run the query if the ID is provided
  });
};

// Hook to update a Maharaj
const useUpdateMaharaj = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: MaharajUpdate}) =>
      updateMaharaj(id, data),
    onSuccess: () => {
      // Invalidate the GET_ALL_MAHARAJS query after updating a Maharaj
      queryClient.invalidateQueries({
        queryKey: [CATEROR_MAHARAJ_KEYS.GET_ALL_MAHARAJS],
      });
      toast.success('Maharaj updated successfully');
    },
    onError: (error) => toast.error('Failed to update Maharaj'),
  });
};

const useDeleteMaharaj = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMaharaj,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_MAHARAJ_KEYS.GET_ALL_MAHARAJS],
      });
      toast.success('Maharaj deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete Maharaj'),
  });
};
export const useGetMaharajDishes = () => {
  return useQuery({
    queryKey: ['getMaharajDishes'],
    queryFn: () => getMaharajDishes(),
    // enabled: !!id, // only run if caterorId exists
  });
};

export const useGetDishUpdate = (id: string) => {
  return useQuery({
    queryKey: ['getDish'],
    queryFn: () => getDishUpdate(id),
    // enabled: !!id, // only run if caterorId exists
  });
};

export const useGetMaharajData = (id: string) => {
  return useQuery({
    queryKey: ['getMaharajData'],
    queryFn: () => getMaharajData(id),
    // enabled: !!id, // only run if caterorId exists
  });
};
export {
  useCreateMaharaj,
  useDeleteMaharaj,
  useGetMaharajById,
  useGetAllMaharaj,
  useUpdateMaharaj,
};
