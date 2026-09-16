/*eslint-disable*/
import {
  createDisposalVendors,
  deleteDisposalVendors,
  getDisposalVendorsbyid,
  getDisposalVendorsPo,
  updateDisposalVendors,
} from '@/lib/api/Disposalpo/dsposalpoapi';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useCreateDisposalVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDisposalVendors,
    onSuccess: () => {
      toast.success('Disposal PO Vendor created!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendors'],
      });
    },
  });
};
export const useDeleteDisposalVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisposalVendors,
    onSuccess: () => {
      toast.success('Disposal PO Vendor deleted!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendors'],
      });
    },
  });
};

export const useGetDisposalVendorsPo = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: getDisposalVendorsPo,
  });
};

export const useUpdateDisposalVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDisposalVendors,
    onSuccess: () => {
      toast.success('Disposal PO Vendor updated!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendors'],
      });
    },
  });
};

export const useGetDisposalVendorsByid = (id: string) => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => getDisposalVendorsbyid(id),
  });
};
