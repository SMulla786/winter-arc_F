import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_DISPOSAL_QUERY_KEYS} from '../../queryKeys';
import {
  addDisposal,
  addDisposalCategory,
  addDisposalInventory,
  deleteDisposal,
  deleteDisposalCategory,
  getDisposalById,
  getDisposalCategories,
  getDisposalCategoryById,
  getDisposals,
  getDisposalsData,
  updateDisposal,
  updateDisposalCategory,
} from '@/lib/api/cateror/disposal';
import toast from 'react-hot-toast';

// Hook to get all disposal categories
export const useGetDisposalCategories = () => {
  return useQuery({
    queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORIES],
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
    onError: (error) => {
      toast.error('Failed to add disposal category');
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORIES],
      });
    },
  });
};

// Hook to update a disposal category
export const useUpdateDisposalCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: {name: string}}) =>
      updateDisposalCategory(id, data),
    onSuccess: () => {
      toast.success('Disposal category updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update disposal category');
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORIES],
      });
    },
  });
};

// Hook to get a disposal category
export const useGetDisposalCategoryById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORY, id],
    queryFn: () => getDisposalCategoryById(id),
    enabled: !!id,
  });
};

// Hook to delete a disposal category
export const useDeleteDisposalCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisposalCategory,
    onSuccess: () => {
      toast.success('Disposal category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete disposal category');
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSAL_CATEGORIES],
      });
    },
  });
};

// Hook to get all disposals based on languageId
export const useGetDisposals = (languageId: string | null) => {
  return useQuery({
    queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSALS, languageId],
    queryFn: () => getDisposals(languageId!),
    enabled: !!languageId, // Only run query when languageId is available
  });
};
export const useGetDisposalsData = (eventid: string | null) => {
  return useQuery({
    queryKey: ['disposals', eventid],
    queryFn: () => getDisposalsData(eventid!),
    enabled: !!eventid, // Only run query when languageId is available
  });
};

// Hook to get a specific disposal by ID
export const useGetDisposalById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSAL, id],
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
    onError: (error) => {
      toast.error('Failed to add disposal');
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSALS],
      });
    },
  });
};

// Hook to update a disposal
export const useUpdateDisposal = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        categoryId: string;
        languageId: string;
        inventory: number;
        unit: string;
        price: string;
      };
    }) => updateDisposal(id, data),
    onSuccess: () => {
      toast.success('Disposal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update disposal with ID');
      console.error(error);
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
    onError: (error) => {
      toast.error('Failed to delete disposal with ID');
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSALS],
      });
    },
  });
};

export const useAddDisposalInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDisposalInventory,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISPOSAL_QUERY_KEYS.DISPOSALS],
      });
    },
    onSuccess: () => toast.success('Utensils inventory added successfully!'),
    onError: () => toast.error('Failed to add utensils inventory'),
  });
};
