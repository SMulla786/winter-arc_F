import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ADMIN_PROCESS_QUERY_KEYS} from '../../queryKeys';
import {ProcessUpdate} from '@/types/admin';
import {
  addProcess,
  deleteProcess,
  getProcess,
  getProcessById,
  updateProcess,
} from '@/lib/api/admin/process';
import toast from 'react-hot-toast';

// Hook to add a process
export const useAddProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProcess,
    onSuccess: () => {
      toast.success('Process added successfully');
    },
    onError: () => {
      toast.error('Failed to add process');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_PROCESS_QUERY_KEYS.PROCESSES],
      });
    },
  });
};

// Hook to get all processes
export const useGetProcesses = () => {
  return useQuery({
    queryKey: [ADMIN_PROCESS_QUERY_KEYS.PROCESSES],
    queryFn: getProcess,
  });
};

// Hook to get a process by ID
export const useGetProcessById = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_PROCESS_QUERY_KEYS.PROCESS, id],
    queryFn: () => getProcessById(id),
    enabled: !!id,
  });
};

// Hook to update a process
export const useUpdateProcess = () => {
  return useMutation({
    mutationFn: ({id, updateData}: {id: string; updateData: ProcessUpdate}) =>
      updateProcess(id, updateData),
    onSuccess: () => {
      toast.success('Process updated successfully');
    },
    onError: () => {
      toast.error('Failed to update process');
    },
  });
};

// Hook to delete a process
export const useDeleteProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProcess,
    onSuccess: () => {
      toast.success('Process deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete process');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_PROCESS_QUERY_KEYS.PROCESSES],
      });
    },
  });
};
