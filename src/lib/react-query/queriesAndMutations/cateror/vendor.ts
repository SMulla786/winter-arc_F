import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_VENDOR_QUERY_KEYS} from '../../queryKeys';
import {VendorUpdate} from '@/types/cateror';
import {
  deleteVendor,
  getVendorById,
  getVendors,
  registerVendor,
  updateVendor,
} from '@/lib/api/cateror/vendor';
import toast from 'react-hot-toast';

//Hook to add Vendor
export const useAddVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerVendor,
    onSuccess: (res) => {
      toast.success('Vendor added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add Vendor');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_VENDOR_QUERY_KEYS.VENDORS], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useGetVendors = () => {
  return useQuery({
    queryKey: [CATEROR_VENDOR_QUERY_KEYS.VENDORS],
    queryFn: getVendors,
  });
};

// Hook to get Vendor by ID
export const useGetVendorById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_VENDOR_QUERY_KEYS.VENDOR, id],
    queryFn: () => getVendorById(id),
    enabled: !!id,
  });
};

// Hook to update a Vendor
export const useUpdateVendor = () => {
  return useMutation({
    mutationFn: (data: {id: string; updateData: VendorUpdate}) =>
      updateVendor(data.id, data.updateData),
    onSuccess: (res) => {
      toast.success('Vendor updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update Vendor');
    },
  });
};

// Hook to delete a Vendor
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: (res) => {
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Vendor');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_VENDOR_QUERY_KEYS.VENDORS], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};
