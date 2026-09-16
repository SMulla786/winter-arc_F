{
  /*eslint-disable*/
}
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {EVENT_DISPOSAL_KEYS} from '../../queryKeys';
import {
  bulkAddEventDisposal,
  bulkReturnEventDisposals,
  deleteDisposal,
  getEventDisposal,
} from '@/lib/api/cateror/eventDisposal';

import {getEventUtensils} from '@/lib/api/cateror/eventUtensils';

export const useBulkAddEventDisposal = ({
  onSuccess,
}: {
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkAddEventDisposal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_DISPOSAL_KEYS.GET_ALL_EVENT_DISPOSAL],
      });
      toast.success('Event Disposals added successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add event disposals');
      console.log(';;;;;;;;', error);
    },
  });
};

export const useGetEventDisposal = (id: string) => {
  return useQuery({
    queryKey: [EVENT_DISPOSAL_KEYS.GET_ALL_EVENT_DISPOSAL],
    queryFn: () => getEventDisposal(id),
  });
};

export const useDeleteEventDisposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisposal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_DISPOSAL_KEYS.GET_ALL_EVENT_DISPOSAL],
      });
      toast.success('Event utensils deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event utensils');
    },
  });
};

export const useBulkReturnEventDisposals = () => {
  return useMutation({
    mutationFn: bulkReturnEventDisposals,
    onSuccess: () => {
      toast.success('Event disposal returned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to return event disposals');
    },
  });
};
