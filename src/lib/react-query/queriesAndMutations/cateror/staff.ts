import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CATEROR_STAFF_KEYS} from '../../queryKeys';
import {
  deleteStaff,
  getStaffById,
  getStaffs,
  registerStaff,
  updateStaff,
} from '@/lib/api/cateror/staff';
import {StaffUpdate} from '@/types/cateror';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

// Hook to create a Staff
const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerStaff,
    onSuccess: () => {
      toast.success('Staff created successfully');
    },
    onError: (error: AxiosError) => {
      toast.error('Failed to create staff');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_STAFF_KEYS.GET_ALL_STAFFS],
      });
    },
  });
};

// Custom hook to fetch all staff
const useGetAllStaff = () => {
  return useQuery({
    queryKey: [CATEROR_STAFF_KEYS.GET_ALL_STAFFS],
    queryFn: getStaffs,
  });
};

// Hook to get Staff by id
const useGetStaffById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_STAFF_KEYS.GET_STAFF_BY_ID, id], // Dynamic query key using id
    queryFn: () => getStaffById(id), // Fetch staff by ID
    enabled: !!id, // Only run if ID is available
  });
};

// Hook to update a Staff
const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Mutation function to update staff by ID
    mutationFn: ({id, data}: {id: string; data: StaffUpdate}) =>
      updateStaff(id, data),

    // Callback on success
    onSuccess: () => {
      toast.success('Staff updated successfully');
    },

    // Callback on error
    onError: (error: AxiosError) => {
      toast.error('Failed to update staff');
    },

    // Invalidate and refetch the staff list on mutation success or failure
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_STAFF_KEYS.GET_ALL_STAFFS], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

// Hook to delete a Staff
const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Mutation function to delete staff by ID
    mutationFn: (id: string) => deleteStaff(id),

    // Callback on success
    onSuccess: () => {
      toast.success('Staff deleted successfully');
    },

    // Callback on error
    onError: (error: AxiosError) => {
      toast.error('Failed to delete staff');
    },

    // Invalidate and refetch the staff list on mutation success or failure
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_STAFF_KEYS.GET_ALL_STAFFS], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};
export {
  useCreateStaff,
  useDeleteStaff,
  useGetStaffById,
  useGetAllStaff,
  useUpdateStaff,
};
