import {
  assignCounter,
  assignExtraVendor,
  AssignManager,
  assignManagerPost,
  CounterPayload,
  createDressCode,
  createManagerPost,
  createManageServicePost,
  deleteAssignCounterById,
  deleteAssignManagerPost,
  deleteDressCode,
  deleteManagerPost,
  deleteManageServicePost,
  ExtraVendorPayload,
  getAllAssignManagerPost,
  getAssignCounterById,
  getAssignExtraVendorById,
  getAssignManagerPostById,
  getDressCode,
  getDressCodeById,
  getManagerPost,
  getManagerPostById,
  getManageServicePost,
  getManageServicePostById,
  Manager,
  Service,
  updateAssignedCounter,
  updateAssignExtraVendorPost,
  updateAssignManagerPost,
  updateDressCode,
  updateManagerPost,
  updateManageServicePost,
} from '@/lib/api/cateror/managerpost';
import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useCreateManagerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createManagerPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerpost'],
      });
      toast.success('Manager created successfully');
    },
    onError: (error) => toast.error('Failed to create Manager'),
  });
};

export const useUpdateManagerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, ...data}: {id: string} & Manager) =>
      updateManagerPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerpost'],
      });
      toast.success('Dress Code updated successfully');
    },
    onError: (error) => toast.error('Failed to update Dress Code'),
  });
};

export const useDeleteManagerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteManagerPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerpost'],
      });
      toast.success('Manager deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete Manager'),
  });
};

// export const useGetManagerPostById = (id: string) => {
//   return useQuery({
//     queryKey: ['managerpost', id],
//     queryFn: () => getManagerPostById(id),
//     // enabled: !!id,
//   });
// };

export const useGetManagerPost = () => {
  return useQuery({
    queryKey: ['managerpost'],
    queryFn: () => getManagerPost(),
    // enabled: !!id,
  });
};

export const useGetManagerPostById = (id: string) => {
  return useQuery({
    queryKey: ['managerpost', id],
    queryFn: () => getManagerPostById(id),
    // enabled: !!id,
  });
};

export const useCreateDressCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDressCode,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerpost'],
      });
      toast.success('Dress Code created successfully');
    },
    onError: (error) => toast.error('Failed to create Manager'),
  });
};

export const useUpdateDressCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, ...data}: {id: string} & Manager) =>
      updateDressCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerpost'],
      });
      toast.success('Dress Code updated successfully');
    },
    onError: (error) => toast.error('Failed to update Manager'),
  });
};

export const useDeleteDressCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDressCode,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerpost'],
      });
      toast.success('Dress Code deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete Manager'),
  });
};

// export const useGetManagerPostById = (id: string) => {
//   return useQuery({
//     queryKey: ['managerpost', id],
//     queryFn: () => getManagerPostById(id),
//     // enabled: !!id,
//   });
// };

export const useGetDressCode = () => {
  return useQuery({
    queryKey: ['managerpost'],
    queryFn: () => getDressCode(),
    // enabled: !!id,
  });
};

export const useGetDressCodeById = (id: string) => {
  return useQuery({
    queryKey: ['managerpost', id],
    queryFn: () => getDressCodeById(id),
    // enabled: !!id,
  });
};

export const useCreateManageServicePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createManageServicePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerServicepost'],
      });
      toast.success('Manager created successfully');
    },
    onError: (error) => toast.error('Failed to create Manager'),
  });
};

export const useUpdateManageServicePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, ...data}: {id: string} & Service) =>
      updateManageServicePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerServicepost'],
      });
      toast.success('Manager updated successfully');
    },
    onError: (error) => toast.error('Failed to update Manager'),
  });
};

export const useDeleteManageServicePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteManageServicePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['managerServicepost'],
      });
      toast.success('Manager deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete Manager'),
  });
};

export const useGetManageServicePost = () => {
  return useQuery({
    queryKey: ['managerServicepost'],
    queryFn: () => getManageServicePost(),
    // enabled: !!id,
  });
};

export const useGetManageServicePostById = (id: string) => {
  return useQuery({
    queryKey: ['managerServicepost', id],
    queryFn: () => getManageServicePostById(id),
    // enabled: !!id,
  });
};

/**
   <<<<<<<<<<<<<<<<<<<<<<<<Assign MANAGER FOR EMPLOYEE >>>>>>>>>>>>>>>>>>>>>>>>>
  */

export const useAssignManagerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: AssignManager[]}) =>
      assignManagerPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignmanagerpost'],
      });
      toast.success('Managers assigned successfully');
    },
    onError: (error) => toast.error('Failed to assign Managers'),
  });
};

export const useUpdateAssignManagerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, ...data}: {id: string} & AssignManager) =>
      updateAssignManagerPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignmanagerpost'],
      });
      toast.success('Manager updated successfully');
    },
    onError: (error) => toast.error('Failed to update Manager'),
  });
};

export const useDeleteAssignManagerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAssignManagerPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignmanagerpost'],
      });
      toast.success('Manager deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete Manager'),
  });
};

export const useGetAssignManagerPost = () => {
  return useQuery({
    queryKey: ['assignmanagerpost'],
    queryFn: () => getAllAssignManagerPost(),
    // enabled: !!id,
  });
};

export const useGetAssignManagerPostById = (id: string) => {
  return useQuery({
    queryKey: ['assignmanagerpost', id],
    queryFn: () => getAssignManagerPostById(id),
    // enabled: !!id,
  });
};

// <<<<<<<<<<<<<<<<<<<<<<<<Assign COUNTER >>>>>>>>>>>>>>>>>>>>>>>>>

export const useAssignCounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: CounterPayload}) =>
      assignCounter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['assigncounter']});
      toast.success('Counter assigned successfully');
    },
    onError: (error) => toast.error('Failed to assign Counter'),
  });
};

interface CounterService {
  serviceId: string;
  vendorId: {id: string}[];
  employeeId: {id: string}[];
  maharajId: {id: string}[];
  count: number;
  price: number;
}

interface CounterData {
  name: string;
  dishes: {id: string}[];
  services: CounterService[];
}

interface Data extends CounterData {}

interface UpdatedCounter extends CounterData {
  counterId: string;
}
[];

export const useUpdateAssignedCounter = (subEventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatedCounter) =>
      updateAssignedCounter(subEventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['assigncounter']});
      toast.success('Counter assigned successfully');
    },
    onError: () => toast.error('Failed to assign Counter'),
  });
};

export const useGetAssignCounterById = (id: string) => {
  return useQuery({
    queryKey: ['assigncounter', id],
    queryFn: () => getAssignCounterById(id),
  });
};

export const useDeleteAssignCounterById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssignCounterById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['assigncounter']});
      toast.success('Counter deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete Counter'),
  });
};

// <<<<<<<<<<<<<<<<<<<<<<<< Extra Vendor >>>>>>>>>>>>>>>>>>>>>>>>>

export const useAssignExtraVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ExtraVendorPayload}) =>
      assignExtraVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['assignextravendor']});
      toast.success('Extra Vendor assigned successfully');
    },
    onError: (error) => toast.error('Failed to assign Extra Vendor'),
  });
};

export const useGetAssignExtraVendorById = (id: string) => {
  return useQuery({
    queryKey: ['assignextravendor', id],
    queryFn: () => getAssignExtraVendorById(id),
  });
};

export const useUpdateAssignExtraVendorPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ExtraVendorPayload}) =>
      updateAssignExtraVendorPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['assignextravendor']});
      toast.success('Extra Vendor updated successfully');
    },
    onError: (error) => toast.error('Failed to update Extra Vendor'),
  });
};
