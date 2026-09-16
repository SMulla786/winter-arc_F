import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {ADMIN_DISH_QUERY_KEYS, CATEROR_STAFF_KEYS} from '../../queryKeys';
import {SendData} from '@/lib/api/admin/copydata';

export const useSendData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: SendData, // Pass arguments directly
    onSuccess: () => {
      toast.success('Data Saved Successfully!');
    },
    onError: () => {
      toast.error('Failed to Save Data');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['external'],
      });
    },
  });
};
