/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

const getExternalSubeventbyId = async (subEventId: string) => {
  try {
    const res = await api.get(`/external/subevent/${subEventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Subevent',
      );
    }
    throw error;
  }
};

const updateExternalSubevent = async (
  subEventId: string,
  data: {
    dishes: {dishId: string}[];
    packageId?: string | null;
    addon?: {id: string}[];
    note: string;
    lastUpdated: Date;
  },
) => {
  try {
    // clone and strip nullish packageId
    const payload: typeof data = {
      dishes: data.dishes,
      note: data.note,
      ...(data.packageId ? {packageId: data.packageId} : {}),
      ...(data.addon ? {addon: data.addon} : {}),
      lastUpdated: data.lastUpdated,
    };

    const res = await api.patch(`/external/subevent/${subEventId}`, payload);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Subevent',
      );
    }
    throw error;
  }
};

const getExternalDishesByCaterorId = async (caterorId: string) => {
  try {
    const res = await api.get(`/external/dishes/${caterorId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Dishes');
    }
    throw error;
  }
};

const getExternalAllPackagesByCaterorId = async (caterorId: string) => {
  try {
    const res = await api.get(`/external/allPackages/${caterorId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get All Packages',
      );
    }
    throw error;
  }
};
const getExternalAllPackagesBySubEventId = async (
  caterorId: string,
  subEventId: string,
) => {
  try {
    const res = await api.get(`/packages/${caterorId}/${subEventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get All Packages',
      );
    }
    throw error;
  }
};

const getExternalSinglePackageById = async (packageId: string) => {
  try {
    const res = await api.get(`/external/package/${packageId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Single Package',
      );
    }
    throw error;
  }
};

const getExternalAddonServicesByCaterorId = async (caterorId: string) => {
  try {
    const res = await api.get(`/external/additional/${caterorId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Addon Services',
      );
    }
    throw error;
  }
};

export const useGetExternalAddonServicesByCaterorId = (caterorId: string) => {
  return useQuery({
    queryKey: ['externalAddonServicesByCaterorId', caterorId],
    queryFn: () => getExternalAddonServicesByCaterorId(caterorId),
    enabled: !!caterorId,
  });
};

export const useGetExternalSubeventById = (subEventId: string) => {
  return useQuery({
    queryKey: ['externalSubeventById', subEventId],
    queryFn: () => getExternalSubeventbyId(subEventId),
    enabled: !!subEventId,
  });
};

export const useGetExternalDishesByCaterorId = (caterorId: string) => {
  return useQuery({
    queryKey: ['externalDishesByCaterorId', caterorId],
    queryFn: () => getExternalDishesByCaterorId(caterorId),
    enabled: !!caterorId,
  });
};

export const useGetExternalAllPackagesByCaterorId = (caterorId: string) => {
  return useQuery({
    queryKey: ['externalAllPackagesByCaterorId', caterorId],
    queryFn: () => getExternalAllPackagesByCaterorId(caterorId),
    enabled: !!caterorId,
  });
};

export const useGetExternalSinglePackageById = (packageId: string) => {
  return useQuery({
    queryKey: ['externalSinglePackageById', packageId],
    queryFn: () => getExternalSinglePackageById(packageId),
    enabled: !!packageId,
  });
};

export const useUpdateExternalSubevent = (subEventId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateExternalSubevent(subEventId, data),
    onSuccess: () => {
      toast.success('Subevent updated successfully');
      qc.invalidateQueries({
        queryKey: ['externalSubeventById', subEventId],
      });
    },
    onError: () => {
      toast.error('Failed to update Subevent');
    },
  });
};

export const useGetExternalAllPackagesBySubEventId = (
  caterorId: string,
  subEventId: string,
) => {
  return useQuery({
    queryKey: ['externalAllPackagesBySubEventId', subEventId],
    queryFn: () => getExternalAllPackagesBySubEventId(caterorId, subEventId),
    enabled: !!subEventId,
  });
};
