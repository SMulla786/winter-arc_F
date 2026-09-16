import {
  GetAllVendorsData,
  getExternalAllRawsMaterial,
  getExternalRaws,
  getpostExternalRaws,
  postExternal,
  postExternalRaws,
} from '@/lib/api/cateror/postExternal';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const usePostExternalVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postExternal,
    onSuccess: () => {
      toast.success('Data Sent Successfully!');
    },
    onError: () => {
      toast.error('Failed to Send Data');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['external'],
      });
    },
  });
};

export const useGetAllVendors = (id: string) => {
  return useQuery({
    queryKey: ['external', id],
    queryFn: () => GetAllVendorsData(id),
  });
};

export const useGetRawMaterialVendor = (id: string) => {
  return useQuery({
    queryKey: ['external', id],
    queryFn: () => getExternalRaws(id),
  });
};

export const useGetAllRawMaterialVendor = (id: string) => {
  return useQuery({
    queryKey: ['external_all', id],
    queryFn: () => getExternalAllRawsMaterial(id),
  });
};
export const usePostRawMaterialFromVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postExternalRaws,
    onSuccess: () => {
      toast.success('Data Saved Successfully!');
    },
    onError: () => {
      toast.error('Failed to Save Data');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['external'],
      });
      queryClient.invalidateQueries({
        queryKey: ['postrawmaterialdata'],
      });
    },
  });
};

export const useGetPostRawMaterialVendor = (id: string) => {
  return useQuery({
    queryKey: ['postrawmaterialdata', id],
    queryFn: () => getpostExternalRaws(id),
  });
};
