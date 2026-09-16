import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  addUtensil,
  addUtensilCategory,
  addUtensilsInventory,
  deleteUtensil,
  deleteUtensilCategory,
  getUtensilById,
  getUtensilCategories,
  getUtensilCategoryById,
  getUtensils,
  updateUtensil,
  updateUtensilCategory,
} from '@/lib/api/cateror/utensil';
import {CATEROR_UTENSIL_QUERY_KEYS} from '../../queryKeys';
import toast from 'react-hot-toast';

export const useAddUtensilCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUtensilCategory,
    onSuccess: () => {
      toast.success('Utensil Category added successfully');
    },
    onError: () => {
      toast.error('Failed to add Utensil Category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
      });
    },
  });
};

export const useGetUtensilCategories = () => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
    queryFn: getUtensilCategories,
  });
};

export const useGetUtensilCategoryById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILCATEGORY, id],
    queryFn: () => getUtensilCategoryById(id),
  });
};

export const useUpdateUtensilCategory = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {name: string; languageId: string | undefined};
    }) => updateUtensilCategory(id, data),
    onSuccess: () => {
      toast.success('UtensilCategory updated successfully');
    },
    onError: () => {
      toast.error('Failed to update UtensilCategory');
    },
  });
};

export const useDeleteUtensilCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUtensilCategory,
    onSuccess: () => {
      toast.success('UtensilCategory deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete UtensilCategory');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
      });
    },
  });
};

export const useAddUtensil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUtensil,
    onSuccess: () => {
      toast.success('Utensil added successfully');
    },
    onError: () => {
      toast.error('Failed to add Utensil');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS],
      });
    },
  });
};

export const useGetUtensils = (languageId?: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS, languageId],
    queryFn: () => getUtensils(languageId!), // Invoke the function with params
    enabled: !!languageId, // Only run query when languageId is available
  });
};

export const useGetUtensilById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSIL, id],
    queryFn: () => getUtensilById(id),
    enabled: !!id,
  });
};

export const useAddUtensilsInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addUtensilsInventory,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSIL],
      });
    },
    onSuccess: () => toast.success('Utensils inventory added successfully!'),
    onError: () => toast.error('Failed to add utensils inventory'),
  });
};

export const useUpdateUtensil = () => {
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
      };
    }) => updateUtensil(id, data),
    onSuccess: () => {
      toast.success('Utensil updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Utensil');
    },
  });
};

export const useDeleteUtensil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUtensil,
    onSuccess: () => {
      toast.success('Utensil deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Utensil');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS],
      });
    },
  });
};
