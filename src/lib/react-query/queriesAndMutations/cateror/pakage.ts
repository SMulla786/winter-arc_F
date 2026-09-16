/*eslint-disable*/
import {CATEROR_PACKAGE_QUERY_KEYS} from '../../queryKeys';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createPackage,
  getPackageById,
  updatePackage,
} from '@/lib/api/cateror/package';

// export const useGetAllPriorities = () => {
//   return useQuery({
//     queryKey: [CATEROR_PRIORITY_QUERY_KEYS.PRIORITY],
//     queryFn: () => getallPriorities(),
//   });
// };

export const useAddPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPackage,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_PACKAGE_QUERY_KEYS.PACKAGES],
      });
    },
    onError: (error) => {
      console.error('Failed to add Package');
    },
    onSuccess: () => {
      toast.success('Package added successfully');
    },
  });
};

export const useGetPackageById = (id: string) => {
  return useQuery({
    queryKey: ['Packages', id],
    queryFn: () => getPackageById(id),
    // enabled: !!id,
  });
};

export const useUpdatePackage = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updatePackage(id, data),
    onSuccess: (_, variables) => {
      toast.success('Package updated successfully');

      // Invalidate both single package + list
      queryClient.invalidateQueries({queryKey: ['packages']});
      queryClient.invalidateQueries({queryKey: ['package', id]});
    },
    onError: (error: any) => {
      console.error(error.message || 'Failed to update Package');
    },
  });
};
