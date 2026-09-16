import {
  addDetails,
  deleteFirmdetail,
  getDetails,
} from '@/lib/api/cateror/employee/details';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useGetDetails = () => {
  return useQuery({
    queryKey: ['details'],
    queryFn: getDetails,
  });
};

export const useAddDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDetails,
    onSuccess: () => {
      toast.success('Details added successfully');
      queryClient.invalidateQueries({queryKey: ['details']});
    },
    onError: () => {
      toast.error('Failed to add details');
    },
  });
};

export const useDeleteFirmDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFirmdetail,
    onSuccess: (res) => {
      toast.success('Firm delete deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Firm Detail');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['details'],
      });
    },
  });
};
