/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useGetCostingManpower = (subEventId: string) => {
  return useQuery({
    queryKey: ['costingManpower'],
    queryFn: async () => {
      const response = await api.get(
        `/cateror/analysis/manpower/${subEventId}`,
      );
      return response.data;
    },
    enabled: !!subEventId,
  });
};
const useUpdateCostingManpower = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/cateror/analysis/manpower/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['costingManpower']});
      toast.success('Manpower data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Manpower data');
    },
  });
};

const useGetFoodVendor = (subEventId: string) => {
  return useQuery({
    queryKey: ['costingFoodVendor'],
    queryFn: async () => {
      const response = await api.get(
        `/cateror/analysis/food/vendors/${subEventId}`,
      );
      return response.data;
    },
    enabled: !!subEventId,
  });
};

const useUpdateFoodVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(
        `/cateror/analysis/food/vendors/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['costingFoodVendor']});
      toast.success('Food Vendor data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Food Vendor data');
    },
  });
};
const useGetFoodLabour = (subEventId: string) => {
  return useQuery({
    queryKey: ['costingFoodLabour'],
    queryFn: async () => {
      const response = await api.get(
        `/cateror/analysis/food/labours/${subEventId}`,
      );
      return response.data;
    },
    enabled: !!subEventId,
  });
};

const useUpdateFoodLabour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(
        `/cateror/analysis/food/labours/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['costingFoodLabour']});
      toast.success('Food Labour data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Food Labour data');
    },
  });
};
const useGetDisplayVendor = (subEventId: string) => {
  return useQuery({
    queryKey: ['costingDisplayVendor'],
    queryFn: async () => {
      const response = await api.get(`/cateror/analysis/display/${subEventId}`);
      return response.data;
    },
    enabled: !!subEventId,
  });
};

const useUpdateDisplayVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/cateror/analysis/display/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['costingDisplayVendor']});
      toast.success('Display Vendor data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Display Vendor data');
    },
  });
};

const useGetAdditonalVendor = (subEventId: string) => {
  return useQuery({
    queryKey: ['costingAdditonalVendor'],
    queryFn: async () => {
      const response = await api.get(
        `/cateror/analysis/additonal/${subEventId}`,
      );
      return response.data;
    },
    enabled: !!subEventId,
  });
};

const useUpdateAdditonalVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/cateror/analysis/additonal/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['costingAdditonalVendor']});
      toast.success('Additional Vendor data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Additional Vendor data');
    },
  });
};

const useGetTransport = (eventId: string) => {
  return useQuery({
    queryKey: ['Eventtransport'],
    queryFn: async () => {
      const response = await api.get(`/cateror/analysis/transport/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

const useUpdateTransport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/cateror/analysis/transport/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['Eventtransport']});
      toast.success('transport data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update  transport data');
    },
  });
};

const useGetFuel = (eventId: string) => {
  return useQuery({
    queryKey: ['Eventfuel'],
    queryFn: async () => {
      const response = await api.get(`/cateror/analysis/fuel/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

const useUpdateFuel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/cateror/analysis/fuel/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['Eventfuel']});
      toast.success('fuel data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update fuel data');
    },
  });
};
const useGetExtra = (eventId: string) => {
  return useQuery({
    queryKey: ['EventExtra'],
    queryFn: async () => {
      const response = await api.get(`/cateror/analysis/extra/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

const useUpdateExtra = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/cateror/analysis/extra/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['EventExtra']});
      toast.success('Extra data updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Extra data');
    },
  });
};

export {
  useGetCostingManpower,
  useGetFoodVendor,
  useGetFoodLabour,
  useGetDisplayVendor,
  useGetAdditonalVendor,
  useUpdateCostingManpower,
  useUpdateFoodVendor,
  useUpdateFoodLabour,
  useUpdateDisplayVendor,
  useUpdateAdditonalVendor,
  useGetTransport,
  useUpdateTransport,
  useGetFuel,
  useUpdateFuel,
  useGetExtra,
  useUpdateExtra,
};
