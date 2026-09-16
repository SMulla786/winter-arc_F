import {
  addPriority,
  getallPriorities,
  updatePriority,
} from '@/lib/api/admin/priority';
import {ADMIN_PRIORITY_QUERY_KEYS} from '../../queryKeys';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useGetAllPriorities = () => {
  return useQuery({
    queryKey: [ADMIN_PRIORITY_QUERY_KEYS.PRIORITY],
    queryFn: getallPriorities,
  });
};

export const useAddPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPriority,
    onSuccess: () => {
      toast.success('Priority added successfully');
    },
    onError: () => {
      toast.error('Failed to add priority');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_PRIORITY_QUERY_KEYS.PRIORITY],
      });
    },
  });
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePriority,
    onSuccess: () => {
      toast.success('Priority successfully updated');
    },
    onError: () => {
      toast.error('Error updating priority');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_PRIORITY_QUERY_KEYS.PRIORITY],
      });
    },
  });
};
