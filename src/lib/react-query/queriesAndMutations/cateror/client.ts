import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_CLIENT_KEYS} from '../../queryKeys';
import {
  clientHistory,
  deleteClient,
  getClientById,
  getClients,
  registerClient,
  updateClient,
} from '@/lib/api/cateror/client';
import {ClientUpdate} from '@/types/cateror';
import toast from 'react-hot-toast';

// Hook to create client
const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerClient,
    onSuccess: () => {
      toast.success('Client created!');
      queryClient.invalidateQueries({
        queryKey: [CATEROR_CLIENT_KEYS.GET_ALL_CLIENT],
      });
    },
    onError: (error) => {
      toast.error(error?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_CLIENT_KEYS.GET_ALL_CLIENT],
      });
    },
  });
};

// Hook to get all clients
const useGetAllClient = () => {
  return useQuery({
    queryKey: [CATEROR_CLIENT_KEYS.GET_ALL_CLIENT],
    queryFn: () => getClients(),
  });
};

// Hook to get a client by ID
const useGetClientById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_CLIENT_KEYS.GET_ALL_CLIENT], // Unique key for client by ID
    queryFn: () => getClientById(id),
    enabled: !!id, // Only run query if ID is provided
  });
};

const useGetClientHistory = (id: string) => {
  return useQuery({
    queryKey: ['client_history'],
    queryFn: () => clientHistory(id),
    enabled: !!id,
  });
};

// Hook to update a client
const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ClientUpdate}) =>
      updateClient(id, data),
    onSuccess: () => {
      toast.success('Client updated!');
    },
    onError: () => {
      toast.error('Failed to update client!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_CLIENT_KEYS.GET_ALL_CLIENT],
      });
    },
  });
};

// Hook to delete a client
const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success('Client deleted!');
    },
    onError: () => {
      toast.error('Failed to delete client!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_CLIENT_KEYS.GET_ALL_CLIENT],
      });
    },
  });
};

export {
  useCreateClient,
  useDeleteClient,
  useGetClientById,
  useGetAllClient,
  useUpdateClient,
  useGetClientHistory,
};
