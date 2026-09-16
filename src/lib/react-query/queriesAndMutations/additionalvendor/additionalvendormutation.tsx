import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
export interface CategoryRow {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  address?: string;
  additionalVendorCatrgories?: Array<{
    additionalVendorCategory: CategoryRow;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVendorData {
  name: string;
  phone: string;
  address?: string;
  categories: string[];
}

export interface UpdateVendorData extends CreateVendorData {
  id: string;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  id: string;
  name: string;
}

export interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// ──────────────────────────────────────────────────────────────
// Vendor Mutations
// ──────────────────────────────────────────────────────────────
export const useVendorMutations = () => {
  const queryClient = useQueryClient();

  const createVendor = useMutation({
    mutationFn: vendoradd,
    onSuccess: () => toast.success('Successfully Added Additional Vendor'),
    onError: (error: ApiError) =>
      toast.error(error.message || 'Failed to add Additional Vendor'),
    onSettled: () =>
      queryClient.invalidateQueries({queryKey: ['additional-vendors']}),
  });

  const updateVendor = useMutation({
    mutationFn: (data: UpdateVendorData) => vendorUpdate(data.id, data),
    onSuccess: () => toast.success('Successfully Updated Vendor'),
    onError: (error: ApiError) =>
      toast.error(error.message || 'Failed to update Vendor'),
    onSettled: () =>
      queryClient.invalidateQueries({queryKey: ['additional-vendors']}),
  });

  const deleteVendor = useMutation({
    mutationFn: (id: string) => vendorDelete(id),
    onSuccess: () => toast.success('Successfully Deleted Vendor'),
    onError: (error: ApiError) =>
      toast.error(error.message || 'Failed to delete Vendor'),
    onSettled: () =>
      queryClient.invalidateQueries({queryKey: ['additional-vendors']}),
  });

  return {
    createVendor,
    updateVendor,
    deleteVendor,
    isSuccess:
      createVendor.isSuccess ||
      updateVendor.isSuccess ||
      deleteVendor.isSuccess,
    isPending:
      createVendor.isPending ||
      updateVendor.isPending ||
      deleteVendor.isPending,
    error: createVendor.error || updateVendor.error || deleteVendor.error,
  };
};

// ──────────────────────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────────────────────
export const useGetAdditionalVendors = () =>
  useQuery({
    queryKey: ['additional-vendors'],
    queryFn: getVendors,
  });

export const useGetAdditionalCats = () =>
  useQuery({
    queryKey: ['additional-categories'],
    queryFn: getCategories,
  });

// ──────────────────────────────────────────────────────────────
// Category Mutations (unchanged)
// ──────────────────────────────────────────────────────────────
export const useSaveAdditionalCat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AddCategory,
    onSuccess: () => toast.success('Successfully Added Additional Category'),
    onError: (e: ApiError) =>
      toast.error(e.message || 'Failed to add Additional Category'),
    onSettled: () =>
      qc.invalidateQueries({queryKey: ['additional-categories']}),
  });
};

export const useUpdateAdditionalCat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, name}: UpdateCategoryData) => updateCategory(id, {name}),
    onSuccess: () => toast.success('Successfully Updated Category'),
    onError: (e: ApiError) =>
      toast.error(e.message || 'Failed to update Category'),
    onSettled: () =>
      qc.invalidateQueries({queryKey: ['additional-categories']}),
  });
};

export const useDeleteAdditionalCat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => toast.success('Successfully Deleted Category'),
    onError: (e: ApiError) =>
      toast.error(e.message || 'Failed to delete Category'),
    onSettled: () =>
      qc.invalidateQueries({queryKey: ['additional-categories']}),
  });
};

// ──────────────────────────────────────────────────────────────
// API Functions (only the ones that needed fixing)
// ──────────────────────────────────────────────────────────────
export const getVendors = async (): Promise<Vendor[]> => {
  try {
    const res = await api.get('/Cateror/additional/vendor');

    // Axios interceptor may return { data: [...] } OR just [...]
    const vendors = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

    return vendors;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(
      apiError.response?.data?.message || 'Failed to fetch vendors',
    );
  }
};

export const vendoradd = async (data: CreateVendorData): Promise<Vendor> => {
  try {
    const payload = {
      name: data.name,
      phone: data.phone,
      address: data.address ?? '',
      category: (data.categories ?? []).map((id) => ({id})),
    };

    const res = await api.post('/Cateror/additional/vendor', payload);

    // Return the **full** created vendor (including categories)
    return res.data?.data ?? res.data;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(
      apiError.response?.data?.message || 'Failed To Add Additional Vendor',
    );
  }
};

export const vendorUpdate = async (
  id: string,
  data: CreateVendorData,
): Promise<Vendor> => {
  try {
    const payload = {
      name: data.name,
      phone: data.phone,
      address: data.address ?? '',
      category: (data.categories ?? []).map((id) => ({id})),
    };
    const res = await api.put(`/Cateror/additional/vendor/${id}`, payload);
    return res.data?.data ?? res.data;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(
      apiError.response?.data?.message || 'Failed To Update Vendor',
    );
  }
};

export const vendorDelete = async (id: string): Promise<void> => {
  try {
    await api.delete(`/Cateror/additional/vendor/${id}`);
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(
      apiError.response?.data?.message || 'Failed To Delete Vendor',
    );
  }
};

export const AddCategory = async (data: CreateCategoryData) => {
  const res = await api.post('/Cateror/additional', data);
  return res.data?.data ?? res.data;
};

export const getCategories = async (): Promise<CategoryRow[]> => {
  try {
    const res = await api.get('/Cateror/additional');

    const categories = Array.isArray(res.data)
      ? res.data
      : (res.data?.data ?? []);

    return categories;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(
      apiError.response?.data?.message || 'Failed to fetch categories',
    );
  }
};

export const updateCategory = async (id: string, data: CreateCategoryData) => {
  const res = await api.put(`/Cateror/additional/${id}`, data);
  return res.data?.data ?? res.data;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/Cateror/additional/${id}`);
};
