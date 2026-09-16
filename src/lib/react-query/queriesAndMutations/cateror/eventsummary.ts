/* eslint-disable */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  addAdditional,
  addTransport,
  createVehicle,
  deleteAdditional,
  deleteTransport,
  deleteVehicle,
  getAdditional,
  getTransport,
  getVehicles,
  updateVehicle,
  updateTransport,
  updateAdditional,
  addFuel,
  deleteFuel,
  getFuel,
  updateFuel,
} from '@/lib/api/cateror/eventsummary';

export type AdditionalType = {
  vendorName: string;
  particular: string;
  price: number;
  quantity: number;
  total: number;
};

export type TransportType = {
  transportId?: string;
  vendorName?: string;
  trip?: number;
  vehicleNumber?: string;
  total?: number;
  type: 'OWN' | 'RENTAL';
  distance?: number;
};

type FuelType = {
  name: string;
  price: number;
  quantity: number;
  total: number;
};

// VEHICLE
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      toast.success('Vehicle created successfully');
      queryClient.invalidateQueries({queryKey: ['vehicle']});
    },
    onError: () => {
      toast.error('Failed to create vehicle');
    },
  });
};

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ['vehicle'],
    queryFn: getVehicles,
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      updateVehicle(id, data),
    onSuccess: () => {
      toast.success('Vehicle updated successfully');
      queryClient.invalidateQueries({queryKey: ['vehicle']});
    },
    onError: () => {
      toast.error('Failed to update vehicle');
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id}: {id: string}) => deleteVehicle(id),
    onSuccess: () => {
      toast.success('Vehicle deleted successfully');
      queryClient.invalidateQueries({queryKey: ['vehicle']});
    },
    onError: () => {
      toast.error('Failed to delete vehicle');
    },
  });
};

// ADDITIONAL
export const useAddAdditional = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdditionalType) => addAdditional(eventId, data),
    onSuccess: () => {
      toast.success('Additional added successfully');
      queryClient.invalidateQueries({queryKey: ['additional']});
    },
    onError: () => {
      toast.error('Failed to Add additional');
    },
  });
};

export const useGetAdditional = (eventId: string) => {
  return useQuery({
    queryKey: ['additional', eventId],
    queryFn: () => getAdditional(eventId),
  });
};

export const useUpdateAdditional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: AdditionalType}) =>
      updateAdditional(id, data),
    onSuccess: () => {
      toast.success('Additional updated successfully');
      queryClient.invalidateQueries({queryKey: ['additional']});
    },
    onError: () => {
      toast.error('Failed to update additional');
    },
  });
};

export const useDeleteAdditional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id}: {id: string}) => deleteAdditional(id),
    onSuccess: () => {
      toast.success('Additional deleted successfully');
      queryClient.invalidateQueries({queryKey: ['additional']});
    },
    onError: () => {
      toast.error('Failed to delete additional');
    },
  });
};

// TRANSPORT
export const useAddTransport = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransportType) => addTransport(eventId, data),
    onSuccess: () => {
      toast.success('Transport added successfully');
      queryClient.invalidateQueries({queryKey: ['transport']});
    },
    onError: () => {
      toast.error('Failed to Add Transport');
    },
  });
};

export const useGetTransport = (eventId: string) => {
  return useQuery({
    queryKey: ['transport', eventId],
    queryFn: () => getTransport(eventId),
  });
};

export const useDeleteTransport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id}: {id: string}) => deleteTransport(id),
    onSuccess: () => {
      toast.success('Transport deleted successfully');
      queryClient.invalidateQueries({queryKey: ['transport']});
    },
    onError: () => {
      toast.error('Failed to delete Transport');
    },
  });
};

export const useUpdateTransport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: TransportType}) =>
      updateTransport(id, data),
    onSuccess: () => {
      toast.success('Transport updated successfully');
      queryClient.invalidateQueries({queryKey: ['transport']});
    },
    onError: () => {
      toast.error('Failed to update Transport');
    },
  });
};

//////////////////////////////////////////////
// Fuel Mutations
//////////////////////////////////////////////

export const useAddFuel = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FuelType) => addFuel(eventId, data),
    onSuccess: () => {
      toast.success('Fuel added successfully');
      queryClient.invalidateQueries({queryKey: ['fuel']});
    },
    onError: () => {
      toast.error('Failed to add fuel');
    },
  });
};

export const useDeleteFuel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id}: {id: string}) => deleteFuel(id),
    onSuccess: () => {
      toast.success('Fuel deleted successfully');
      queryClient.invalidateQueries({queryKey: ['fuel']});
    },
    onError: () => {
      toast.error('Failed to delete fuel');
    },
  });
};

export const useGetFuel = (eventId: string) => {
  return useQuery({
    queryKey: ['fuel', eventId],
    queryFn: () => getFuel(eventId),
    enabled: !!eventId,
  });
};

export const useUpdateFuel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: FuelType}) =>
      updateFuel(id, data),
    onSuccess: () => {
      toast.success('Fuel updated successfully');
      queryClient.invalidateQueries({queryKey: ['fuel']});
    },
    onError: () => {
      toast.error('Failed to update fuel');
    },
  });
};
