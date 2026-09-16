import {ADMIN_DISPOSAL_QUERY_KEYS} from '../../queryKeys';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  addDisposal,
  addDisposalCategory,
  deleteDisposal,
  deleteDisposalCategory,
  getDisposalById,
  getDisposalCategories,
  getDisposalCategoryById,
  getDisposals,
  sendDisposalData,
  updateDisposal,
  updateDisposalCategory,
} from '@/lib/api/admin/disposal';
import {GetDisposalParams} from '@/types/admin';
import toast from 'react-hot-toast';
import {sendUtensilData} from '@/lib/api/admin/utensil';

// Hook to get all disposal categories
export const useGetDisposalCategories = () => {
  return useQuery({
    queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORIES],
    queryFn: getDisposalCategories,
  });
};

// Hook to add a new disposal category
export const useAddDisposalCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDisposalCategory,
    onSuccess: () => {
      toast.success('Disposal category added successfully');
    },
    onError: () => {
      toast.error('Failed to add disposal category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORIES],
      });
    },
  });
};

// Hook to update a disposal category
export const useUpdateDisposalCategory = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {name: string; languageId: string};
    }) => updateDisposalCategory(id, data),
    onSuccess: () => {
      toast.success('Disposal category updated successfully');
    },
    onError: () => {
      toast.error('Failed to update disposal category');
    },
  });
};

// Hook to get a disposal category by ID
export const useGetDisposalCategoryById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORY, id],
    queryFn: () => getDisposalCategoryById(id),
    enabled: !!id,
  });
};

// Hook to delete a disposal category
export const useDeleteDisposalCategory = () => {
  return useMutation({
    mutationFn: deleteDisposalCategory,
    onSuccess: () => {
      toast.success('Disposal category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete disposal category');
    },
  });
};

// Hook to get all disposals based on languageId
export const useGetDisposal = () => {
  return useQuery({
    queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSALS],
    queryFn: getDisposals,
  });
};

// Hook to get a specific disposal by ID
export const useGetDisposalById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSALS, id],
    queryFn: () => getDisposalById(id),
  });
};

// Hook to add a new disposal
export const useAddDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDisposal,
    onSuccess: () => {
      toast.success('Disposal added successfully');
    },
    onError: () => {
      toast.error('Failed to add disposal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSALS],
      });
    },
  });
};

// Hook to update a disposal
export const useUpdateDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {name: string; categoryId: string; languageId: string};
    }) => updateDisposal(id, data),
    onSuccess: () => {
      toast.success('Disposal updated successfully');
    },
    onError: () => {
      toast.error('Failed to update disposal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSALS],
      });
    },
  });
};

// Hook to delete a disposal
export const useDeleteDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDisposal(id),
    onSuccess: () => {
      toast.success('Disposal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete disposal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISPOSAL_QUERY_KEYS.DISPOSALS],
      });
    },
  });
};

type SendUtensilPayload = {
  caterorId: string;
  languageId: string;
  disposals: {disposalId: string; quantity: number}[];
};

export const useSendDisposalData = () => {
  return useMutation({
    mutationFn: ({caterorId, languageId, disposals}: SendUtensilPayload) =>
      sendDisposalData(caterorId, languageId, disposals),
    onSuccess: () => {
      toast.success('Disposal data sent successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to send utensil data');
    },
  });
};
