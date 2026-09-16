import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export interface DressCodeAssignment {
  roleId: string;
  dressId: string;
}

export const useAssignDressCode = (subeventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DressCodeAssignment[]) =>
      assignDressCode(subeventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dresscode-assignments'],
      });
      toast.success('Dress codes assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign dress codes');
      console.error('Dress code assignment error:', error);
    },
  });
};

// Query for getting counter and vendor services
export const useGetAssignedDressCode = (subEventId: string) => {
  return useQuery({
    queryKey: ['assigned-dresscodes', subEventId],
    queryFn: () => getAssignedDressCode(subEventId),
    enabled: !!subEventId,
  });
};
export const useGetCounterandVendor = (id: string) => {
  return useQuery({
    queryKey: ['counter-vendor-services', id],
    queryFn: () => getService(id),
    enabled: !!id,
  });
};

// Query for getting manager and manpower services
export const useGetManagerandMenpower = (id: string) => {
  return useQuery({
    queryKey: ['manager-manpower-services', id],
    queryFn: () => getServiceDresscode(id),
    enabled: !!id,
  });
};

// Query for getting dress codes
export const useGetDressCode = () => {
  return useQuery({
    queryKey: ['dresscodes'],
    queryFn: () => getDressCode(),
  });
};

export const assignDressCode = async (
  subeventId: string,
  data: DressCodeAssignment[],
) => {
  try {
    const response = await api.post(
      `cateror/dresscode/subevent/${subeventId}`,
      data,
    );
    console.log('Assigning dress codes to subevent:', subeventId, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign dress codes',
      );
    }
    throw error;
  }
};
export const getAssignedDressCode = async (subeventId: string) => {
  try {
    const response = await api.get(`cateror/dresscode/subevent/${subeventId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign dress codes',
      );
    }
    throw error;
  }
};

// API function to get counter and vendor services
export const getService = async (id: string) => {
  try {
    const response = await api.get(`/cateror/counter/all/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get services',
      );
    }
    throw error;
  }
};

// API function to get manager and manpower services
export const getServiceDresscode = async (id: string) => {
  try {
    const response = await api.get(
      `/cateror/events/managerposts/manpower/${id}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get manager services',
      );
    }
    throw error;
  }
};

// API function to get dress codes
export const getDressCode = async () => {
  try {
    const response = await api.get(`/cateror/dresscode`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get dress codes',
      );
    }
    throw error;
  }
};
