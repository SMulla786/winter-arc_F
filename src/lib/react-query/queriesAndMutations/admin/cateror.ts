import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  registerCateror,
  deleteCateror,
  getCaterorById,
  getCaterors,
  updateCateror,
} from '@/lib/api/admin/cateror';
import {ADMIN_CATEROR_QUERY_KEYS} from '../../queryKeys';
import toast from 'react-hot-toast';

// Hook to get all caterors
export const useGetCaterors = () => {
  return useQuery({
    queryKey: [ADMIN_CATEROR_QUERY_KEYS.CATERORS],
    queryFn: getCaterors,
  });
};

// Hook to get a cateror by ID
export const useGetCaterorById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_CATEROR_QUERY_KEYS.CATEROR, id],
    queryFn: () => getCaterorById({id}),
  });
};

// Hook to register a new cateror
export const useRegisterCateror = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerCateror,
    onSuccess: () => {
      toast.success('Cateror Registered!');
    },
    onError: () => {
      toast.error('Failed to register cateror');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_CATEROR_QUERY_KEYS.CATERORS],
      });
    },
  });
};

// Hook to update a cateror
export const useUpdateCateror = () => {
  return useMutation({
    mutationFn: updateCateror,
    onSuccess: () => {
      toast.success('Cateror Updated!');
    },
    onError: () => {
      toast.error('Failed to update cateror');
    },
  });
};

// Hook to delete a cateror
export const useDeleteCateror = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCateror,
    onSuccess: () => {
      toast.success('Cateror Deleted!');
    },
    onError: () => {
      toast.error('Failed to delete cateror');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_CATEROR_QUERY_KEYS.CATERORS],
      });
    },
  });
};
