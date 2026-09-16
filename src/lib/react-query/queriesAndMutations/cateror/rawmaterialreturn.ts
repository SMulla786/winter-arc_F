import {bulkAddRawMaterialReturns} from '@/lib/api/cateror/rawmaterialreturns';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useBulkAddEventUtensils = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkAddRawMaterialReturns,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['RawMaterial Return'],
      });
      toast.success('Event utensils added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add event utensils');
    },
  });
};
