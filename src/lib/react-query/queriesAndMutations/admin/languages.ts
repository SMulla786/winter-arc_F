import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ADMIN_LANGUAGE_QUERY_KEYS} from '../../queryKeys';
import {
  addLanguage,
  deleteLanguage,
  getLanguageById,
  getLanguages,
  updateLanguage,
} from '@/lib/api/admin/language';
import {LanguageUpdate} from '@/types/admin';
import toast from 'react-hot-toast';

// Hook to add a new language
export const useAddLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addLanguage,
    onSuccess: () => {
      toast.success('Language added successfully');
    },
    onError: () => {
      toast.error('Failed to add language');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_LANGUAGE_QUERY_KEYS.LANGUAGES],
      });
    },
  });
};

// Hook to get all languages
export const useGetLanguages = () => {
  return useQuery({
    queryKey: [ADMIN_LANGUAGE_QUERY_KEYS.LANGUAGES],
    queryFn: getLanguages,
  });
};

// Hook to get language by ID
export const useGetLanguageById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_LANGUAGE_QUERY_KEYS.LANGUAGES, id],
    queryFn: () => getLanguageById(id),
    enabled: !!id,
  });
};

// Hook to update a language
export const useUpdateLanguage = () => {
  return useMutation({
    mutationFn: ({id, updateData}: {id: string; updateData: LanguageUpdate}) =>
      updateLanguage(id, updateData),
    onSuccess: () => {
      toast.success('Language updated successfully');
    },
    onError: () => {
      toast.error('Failed to update language');
    },
  });
};

// Hook to delete a language
export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      toast.success('Language deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete language');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_LANGUAGE_QUERY_KEYS.LANGUAGES],
      });
    },
  });
};
