import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_PROCESS_QUERY_KEYS} from '../../queryKeys';
import {
  addProcess,
  deleteProcess,
  getProcess,
  getProcessById,
  updateProcess,
} from '@/lib/api/cateror/process';
import {ProcessUpdate} from '@/types/cateror';
import toast from 'react-hot-toast';

//Hook to add process
export const useAddProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProcess,
    onSuccess: (res) => {
      toast.success('Process added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add Process');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_PROCESS_QUERY_KEYS.PROCESSES],
      });
    },
  });
};

//Hook to get all processes
export const useGetProcesses = () => {
  return useQuery({
    queryKey: [CATEROR_PROCESS_QUERY_KEYS.PROCESSES],
    queryFn: () => getProcess(),
  });
};

// Hook to get Process by ID
export const useGetProcessById = (id: string) => {
  return useQuery({
    queryFn: () => getProcessById(id),
    queryKey: [CATEROR_PROCESS_QUERY_KEYS.PROCESS],
  });
};

// Hook to update a Process
export const useUpdateProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {id: string; updateData: ProcessUpdate}) =>
      updateProcess(data.id, data.updateData),
    onSuccess: (res) => {
      toast.success('Process updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update process');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_PROCESS_QUERY_KEYS.PROCESSES],
      });
    },
  });
};

// Hook to delete a process
export const useDeleteProcess = () => {
  return useMutation({
    mutationFn: deleteProcess,
    onSuccess: (res) => {
      toast.success('Process deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Process');
    },
  });
};
