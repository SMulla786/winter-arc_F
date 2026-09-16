import {
  getFeedback,
  postFeedback,
  updateGooglePageCount,
  updateQrPageCount,
} from '@/lib/api/cateror/feedback';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const usePostFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subId,
      data,
    }: {
      subId: string;
      data: {
        rating: number;
        name: string;
        phone?: string;
        email?: string;
        feedback: string;
      };
    }) => postFeedback(subId, data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['feedback'],
      });
      toast.success('Feedback posted successfully!');
    },
    onError: () => {
      toast.error('Failed to post feedback!');
    },
  });
};

export const useGetFeedback = (eventId: string) => {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => getFeedback(eventId),
  });
};

export const useUpdateQRPageCount = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateQrPageCount(eventId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['feedback'],
      });
    },
    onError: () => {},
  });
};
export const useUpdateGooglePageCount = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateGooglePageCount(eventId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['feedback'],
      });
    },
    onError: () => {},
  });
};
