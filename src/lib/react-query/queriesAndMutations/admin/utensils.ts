import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  addUtensil,
  addUtensilCategory,
  deleteUtensil,
  deleteUtensilCategory,
  getUtensilById,
  getUtensilCategories,
  getUtensilCategoryById,
  getUtensils,
  sendUtensilData,
  updateUtensil,
  updateUtensilCategory,
} from '@/lib/api/admin/utensil';
import {ADMIN_UTENSIL_QUERY_KEYS} from '../../queryKeys';
import {
  GetUtensilsParams,
  Utensil,
  UtensilCategoryUpdate,
  UtensilUpdate,
} from '@/types/admin';
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
        queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
      });
    },
  });
};

export const useGetUtensilCategories = () => {
  return useQuery({
    queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
    queryFn: getUtensilCategories,
  });
};

export const useGetUtensilCategoryById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES, id],
    queryFn: () => getUtensilCategoryById(id),
    enabled: !!id,
  });
};

export const useUpdateUtensilCategory = () => {
  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: UtensilCategoryUpdate;
    }) => updateUtensilCategory(id, updateData),
    onSuccess: () => {
      toast.success('Utensil Category updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Utensil Category');
    },
  });
};

export const useDeleteUtensilCategory = () => {
  return useMutation({
    mutationFn: deleteUtensilCategory,
    onSuccess: () => {
      toast.success('Utensil Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Utensil Category');
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
        queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILS],
      });
    },
  });
};

export const useGetUtensils = () => {
  return useQuery({
    queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILS],
    queryFn: getUtensils,
  });
};

export const useGetUtensilById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILS, id],
    queryFn: () => getUtensilById(id),
    enabled: !!id,
  });
};

export const useUpdateUtensil = () => {
  return useMutation({
    mutationFn: ({id, updateData}: {id: string; updateData: UtensilUpdate}) =>
      updateUtensil(id, updateData),
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
        queryKey: [ADMIN_UTENSIL_QUERY_KEYS.UTENSILS],
      });
    },
  });
};

type SendUtensilPayload = {
  caterorId: string;
  languageId: string;
  utensils: {
    utensilId: string;
    name: string;
    categoryId: string;
    quantity?: number;
  }[];
};

export const useSendUtensilData = () => {
  return useMutation({
    mutationFn: ({caterorId, languageId, utensils}: SendUtensilPayload) =>
      sendUtensilData(caterorId, languageId, utensils),
    onSuccess: () => {
      toast.success('Utensil data sent successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to send utensil data');
    },
  });
};
