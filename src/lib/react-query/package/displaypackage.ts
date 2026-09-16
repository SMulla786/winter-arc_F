import {
  deletePackage,
  getPackages,
  getPackagesdata,
  getPackagesExternal,
} from '@/lib/api/cateror/display';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

const PACKAGE_QUERY_KEY = 'packages';

export const useGetAllPackage = () => {
  return useQuery({
    queryKey: [PACKAGE_QUERY_KEY],
    queryFn: () => getPackages(),
  });
};

export const useGetAllPackageExternal = (id: string) => {
  return useQuery({
    queryKey: [PACKAGE_QUERY_KEY],
    queryFn: () => getPackagesExternal(id),
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [PACKAGE_QUERY_KEY]});
    },
  });
};

export const useGetPackageById = (id: string) => {
  return useQuery({
    queryKey: [PACKAGE_QUERY_KEY, id],
    queryFn: () => getPackagesdata({id}),
  });
};
