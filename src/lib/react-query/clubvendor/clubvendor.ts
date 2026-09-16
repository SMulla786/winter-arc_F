/*eslint-disable*/
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
export type SubPackage = {
  count: number;
  category?: string | null;
  dishes: string[];
};

export type Package = {
  name: string;
  price: number;
  subpackages: SubPackage[]; // ← Change to lowercase 'p' here too
};

export type ClubVendor = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  isClubVendor: boolean;
  packages?: Package[];
};

export const useSaveClubVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClubVendor) => saveClubVendor(data),
    onSuccess: () => {
      toast.success('Club Vendor Saved Successfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
      qc.invalidateQueries({queryKey: ['club-vendors']});
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.errors[0] || 'Failed To Save Club Vendor',
      );
    },
  });
};

export const useUpdateClubVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ClubVendor}) =>
      updateClubVendor(id, data),
    onSuccess: () => {
      toast.success('Club Vendor Updated Successfully');
      qc.invalidateQueries({queryKey: ['food-vendors']});
      qc.invalidateQueries({queryKey: ['club-vendors']});
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.errors[0] || 'Failed To Update Club Vendor',
      );
    },
  });
};

export const saveClubVendor = async (data: ClubVendor) => {
  try {
    const response = await api.post('cateror/vendors/clubVendor', data);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.errors[0] || 'Failed to add club vendor');
    throw error;
  }
};

export const updateClubVendor = async (id: string, data: ClubVendor) => {
  try {
    const response = await api.put(`cateror/vendors/clubVendor/${id}`, data);
    return response.data;
  } catch (error: any) {
    toast.error(
      error.response?.data?.errors[0] || 'Failed to update club vendor',
    );
    throw error;
  }
};

export const useGetClubVendor = (id: string) => {
  return useQuery({
    queryKey: ['club-vendor', id],
    queryFn: () => getClubVendor(id),
    enabled: !!id,
  });
};
export const getClubVendor = async (id: string) => {
  try {
    const response = await api.get(`cateror/vendors/clubVendor/${id}`);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error) {
    toast.error('Failed to fetch club vendor');
    throw error;
  }
};
