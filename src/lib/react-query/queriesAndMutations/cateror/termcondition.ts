import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ADMIN_PROCESS_QUERY_KEYS,
  CATEROR_PROCESS_QUERY_KEYS,
} from '../../queryKeys';
import {
  addTermAndCondition,
  deleteTerms,
  getTerms,
} from '@/lib/api/cateror/termcondition';
import {ProcessUpdate} from '@/types/cateror';
import {updateProcess, deleteProcess} from '@/lib/api/admin/process';

export const useAddTermAndCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTermAndCondition,
    onSuccess: () => {
      toast.success('Process added successfully');
    },
    onError: () => {
      toast.error('Failed to add process');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['terms'],
      });
    },
  });
};

export const useGetTerms = (id: string) => {
  return useQuery({
    queryKey: ['terms', id],
    queryFn: () => getTerms(id),
  });
};

export const useDeleteTerms = () => {
  return useMutation({
    mutationFn: deleteTerms,
    onSuccess: (res) => {
      toast.success('Process deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Process');
    },
  });
};
