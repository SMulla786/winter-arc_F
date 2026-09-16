import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EVENT_UTENSIL_KEYS} from '../../queryKeys';
import {
  bulkAddEventUtensils,
  bulkReturnEventUtensils,
  deleteUtensils,
  getEventUtensils,
} from '@/lib/api/cateror/eventUtensils';
import toast from 'react-hot-toast';

const useBulkAddEventUtensils = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkAddEventUtensils,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_UTENSIL_KEYS.GET_ALL_EVENT_UTENSIL],
      });
      toast.success('Event utensils added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add event utensils');
    },
  });
};

const useGetEventUtensils = (id: string) => {
  return useQuery({
    queryKey: [EVENT_UTENSIL_KEYS.GET_ALL_EVENT_UTENSIL],
    queryFn: () => getEventUtensils(id),
  });
};

export const useDeleteEventUtensils = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUtensils,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_UTENSIL_KEYS.GET_ALL_EVENT_UTENSIL],
      });
      toast.success('Event utensils deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event utensils');
    },
  });
};

const useBulkReturnEventUtensils = () => {
  return useMutation({
    mutationFn: bulkReturnEventUtensils,
    onSuccess: () => {
      toast.success('Event utensils returned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to return event utensils');
    },
  });
};

export {
  useBulkAddEventUtensils,
  useGetEventUtensils,
  useBulkReturnEventUtensils,
};
