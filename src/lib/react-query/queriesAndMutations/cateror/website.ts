/* eslint-disable */
import {
  createWebsiteContent,
  updateWebsiteContent,
} from '@/lib/api/cateror/website';
import {useMutation, useQueryClient} from '@tanstack/react-query';

export const useCreateWebsiteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      return await createWebsiteContent(data);
    },
    onSuccess: () => {
      // Optionally invalidate or refetch related data
      queryClient.invalidateQueries({queryKey: ['websitecontent']});
    },
    onError: (error: any) => {
      console.error('Website content creation failed:', error);
    },
  });
};

export const useUpdateWebsiteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      return await updateWebsiteContent(data);
    },
    onSuccess: () => {
      // Optionally invalidate or refetch related data
      queryClient.invalidateQueries({queryKey: ['websitecontent']});
    },
    onError: (error: any) => {
      console.error('Website content creation failed:', error);
    },
  });
};
