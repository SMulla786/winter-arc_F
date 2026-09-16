import {
  addPriority,
  getallPriorities,
  updatePriority,
} from '@/lib/api/cateror/priority';
import {CATEROR_PRIORITY_QUERY_KEYS} from '../../queryKeys';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useGetAllPriorities = () => {
  return useQuery({
    queryKey: [CATEROR_PRIORITY_QUERY_KEYS.PRIORITY],
    queryFn: () => getallPriorities(),
  });
};

export const useAddPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPriority,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_PRIORITY_QUERY_KEYS.PRIORITY],
      });
    },
    onError: (error) => {
      toast.error('Failed to add priority');
    },
    onSuccess: () => {
      toast.success('Priority added successfully');
    },
  });
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient(); // Get the query client to invalidate queries when necessary

  return useMutation({
    mutationFn: updatePriority, // Your API call to update the priority
    onSettled: () => {
      // Invalidate the queries related to priorities so they are refetched
      queryClient.invalidateQueries({
        queryKey: [CATEROR_PRIORITY_QUERY_KEYS.PRIORITY], // Replace with the correct query key you use for priorities
      });
    },
    onError: (error) => {
      toast.error('Error updating priority');
    },
    onSuccess: () => {
      toast.success('Priority successfully updated');
    },
  });
};
