import {
  getQrDesign,
  getSubEventDesign,
  saveQrDesign,
} from '@/lib/api/cateror/designselection';
import {getSubEvent} from '@/lib/api/cateror/event';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useGetQrDesign = () => {
  return useQuery({
    queryKey: ['design'],
    queryFn: () => getQrDesign(),
  });
};

export const useSaveQrDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, designId}: {id: string; designId: string}) => {
      return saveQrDesign(id, designId);
    },
    onSuccess: () => toast.success('Design Selected successfully!'),
    onError: () => toast.error('Failed to select design'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['design'],
      });
    },
  });
};

export const useGetSubEventDesign = (id: string) => {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => getSubEventDesign(id),
  });
};
