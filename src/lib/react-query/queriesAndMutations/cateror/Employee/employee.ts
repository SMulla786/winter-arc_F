import {
  CreateEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeeById,
  updateEmployee,
  updateEmployeeSetting,
} from '@/lib/api/cateror/employee/employee';
import {ClientCreate, EmployeeCreate, EmployeeSetting} from '@/types/cateror';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CreateEmployee,
    onSuccess: () => {
      toast.success('Employee created!');
      queryClient.invalidateQueries({
        queryKey: ['employee'],
      });
    },
    onError: (error) => {
      toast.error(error?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee'],
      });
    },
  });
};

export const useGetAllEmployee = () => {
  return useQuery({
    queryKey: ['employee'],
    queryFn: () => getEmployee(),
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success('Employee deleted!');
    },
    onError: () => {
      toast.error('Failed to delete Employee!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee'],
      });
    },
  });
};

export const useGetEmployeeById = (id: string) => {
  return useQuery({
    queryKey: ['employee'], // Unique key for client by ID
    queryFn: () => getEmployeeById(id),
    enabled: !!id, // Only run query if ID is provided
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: EmployeeCreate}) =>
      updateEmployee(id, data),
    onSuccess: () => {
      toast.success('Employee updated!');
    },
    onError: () => {
      toast.error('Failed to update Employee!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee'],
      });
    },
  });
};

export const useUpdateEmployeeSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: EmployeeSetting}) =>
      updateEmployeeSetting(id, data),
    onSuccess: () => {
      toast.success('Employee updated!');
    },
    onError: () => {
      toast.error('Failed to update Employee!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee'],
      });
    },
  });
};
