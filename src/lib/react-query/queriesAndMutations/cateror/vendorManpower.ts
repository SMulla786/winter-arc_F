import {manpowerPayPayload} from '@/lib/api/cateror/foodvender';
import {
  addVendorManpowerRole,
  deleteKitchenManpower,
  deleteVendorManpower,
  deleteVendorManpowerRole,
  getAllKitchenVendorManpowerRole,
  getAllVendorManpowerRole,
  getKItchenManpower,
  getManpowerEvent,
  getManPowerVendorAllHistory,
  getManPowerVendorHistoryById,
  getVendorManpower,
  getVendorManpowerById,
  getVendorManpowerRole,
  newKitchenManpower,
  payMenPowerVendor,
  payMultiManPowerVendor,
  payPendingVendorManpower,
  registerVendorManpower,
  saveManPowerVendorAdvancePay,
  saveManPowerVendorPay,
  savemenPower,
  updateKitchenManpower,
  updateVendorManpower,
  updateVendorManpowerRole,
  vendorPay,
} from '@/lib/api/cateror/vendorManpower';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-hot-toast';

export interface VendorManpowerUpdate {
  name: string;
  phone: string;
  address: string;
}

export type manPowerVendorPayPayload = {
  amount: number;
  eventId: string;
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

export type manPowerVendorPayAllPayload = {
  amount: number;
  eventId: {id: string}[];
  walletAmount: number;
  totalAmount: number;
  vendorId: string;
  bonus?: number;
};

export const useAddVendorManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerVendorManpower,
    onSuccess: (res) => {
      toast.success('Vendor Manpower added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add Vendor Manpower');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};
export const useAddVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorPay,
    onSuccess: (res) => {
      toast.success('Vendor Manpower added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add Vendor Manpower');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useGetVendorManpower = () => {
  return useQuery({
    queryKey: ['vendor-manpower'],
    queryFn: getVendorManpower,
  });
};

export const useSaveMenPowerData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savemenPower,
    onSuccess: (res) => {
      toast.success('Vendor Manpower added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add Vendor Manpower');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useGetManpowerEvent = (id: string) => {
  return useQuery({
    queryKey: ['vendor-manpower', id],
    queryFn: () => getManpowerEvent(id),
    // enabled: !!id,
  });
};

export const useGetVendorManpowerById = (id: string) => {
  return useQuery({
    queryKey: ['vendor-manpower', id],
    queryFn: () => getVendorManpowerById(id),
    enabled: !!id,
  });
};

export const useUpdateVendorManpower = () => {
  return useMutation({
    mutationFn: (data: {id: string; data: VendorManpowerUpdate}) =>
      updateVendorManpower(data.id, data.data),
    onSuccess: (res) => {
      toast.success('Vendor Manpower updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update Vendor Manpower');
    },
  });
};

// Hook to delete a Vendor
export const useDeleteVendorManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendorManpower,
    onSuccess: (res) => {
      toast.success('Vendor Manpower deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Vendor Manpower');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useGetAllVendorManpowerRole = () => {
  return useQuery({
    queryKey: ['vendor-manpower-role'],
    queryFn: getAllVendorManpowerRole,
    // enabled: !!id,
  });
};
export const useGetAllKitchenVendorManpowerRole = (subEventId: string) => {
  return useQuery({
    queryKey: ['kitchen-vendor-manpower-role'],
    queryFn: () => getAllKitchenVendorManpowerRole(subEventId),
    enabled: !!subEventId,
  });
};
export const useGetVendorManpowerRole = (vendorId: string) => {
  console.log('id', vendorId);
  return useQuery({
    queryKey: ['vendor-manpower-role', vendorId],
    queryFn: () => getVendorManpowerRole(vendorId),
    // enabled: !!id,
  });
};
export const useAddVendorManpowerRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {name: string; price: number; roleType: string}) =>
      addVendorManpowerRole(data),
    onSuccess: (res) => {
      toast.success('Vendor Manpower Role added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add Vendor Manpower Role');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower-role'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useDeleteVendorManpowerRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendorManpowerRole,
    onSuccess: (res) => {
      toast.success('Vendor Manpower Role deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Vendor Manpower Role');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower-role'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useUpdateVendorManpowerRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      price: number;
      roleType: string;
    }) => updateVendorManpowerRole(data),
    onSuccess: (res) => {
      toast.success('Vendor Manpower Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update Vendor Manpower Role');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower-role'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const usePayPendingVendorManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {id: string; amount: number}) =>
      payPendingVendorManpower(data),
    onSuccess: (res) => {
      toast.success('Vendor Manpower paid successfully');
    },
    onError: (error) => {
      toast.error('Failed to pay Vendor Manpower');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-manpower'], // Adjust STAFF_KEYS to the correct constant if not yet defined
      });
    },
  });
};

export const useSaveVendorManpowerPay = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: manpowerPayPayload) => payMenPowerVendor(data),
    onSuccess: () => {
      toast.success('Food Vendor Payed Succesfully');
      queryClient.invalidateQueries({
        queryKey: ['foodvendor_history', vendorId],
      });
    },
    onError: () => {
      toast.error('Failed To Payed Food Vendor');
    },
  });
};

export const useGetManPowerVendorHistoryById = (id: string) => {
  return useQuery({
    queryKey: ['manPowerVendorHistory', id],
    queryFn: () => getManPowerVendorHistoryById(id),
    // enabled: !!id,
  });
};

export const useSaveManPowerVendorAdvancePay = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {amount: number}) =>
      saveManPowerVendorAdvancePay(id, data),
    onSuccess: () => {
      toast.success('Man Power Vendor Advance Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['manPowerVendorHistory']});
    },
    onError: () => {
      toast.error('Failed To Payed Man Power Vendor');
    },
  });
};

export const useSaveManPowerVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: manPowerVendorPayPayload) => saveManPowerVendorPay(data),
    onSuccess: () => {
      toast.success('ManPower Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['manPowerVendorHistory']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed ManPower Vendor');
    // },
  });
};

export const useSaveMultiManPowerVendorPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: manPowerVendorPayAllPayload) =>
      payMultiManPowerVendor(data),
    onSuccess: () => {
      toast.success('ManPower Vendor Payed Succesfully');
      queryClient.invalidateQueries({queryKey: ['manPowerVendorHistory']});
    },
    // onError: () => {
    //   toast.error('Failed To Payed ManPower Vendor');
    // },
  });
};

export const useGetManPowerVendorAllHistory = (id: string) =>
  useQuery({
    queryKey: ['manPowerVendorAllHistory', id],
    queryFn: () => getManPowerVendorAllHistory(id),
    enabled: !!id,
  });
export const useGetKItchenManpower = (subEventId: string) =>
  useQuery({
    queryKey: ['kitchenManpower', subEventId],
    queryFn: () => getKItchenManpower(subEventId),
    enabled: !!subEventId,
  });

export const useNewKItchenManpower = (subEventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      vendorId?: string;
      employeeId?: string;
      serviceId: string;
      quantity: number;
      price: number;
      transport: number;
      total: number;
    }) => newKitchenManpower(subEventId, data),
    onSuccess: () => {
      toast.success('Kitchen Manpower added successfully');
      queryClient.invalidateQueries({queryKey: ['kitchenManpower']});
    },
    onError: () => {
      toast.error('Failed to add Kitchen Manpower');
    },
  });
};

export const useUpdateKItchenManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      employeeId?: string;
      serviceId: string;
      quantity: number;
      price: number;
      transport: number;
      total: number;
    }) => updateKitchenManpower(data),
    onSuccess: () => {
      toast.success('Kitchen Manpower updated successfully');
      queryClient.invalidateQueries({queryKey: ['kitchenManpower']});
    },
    onError: () => {
      toast.error('Failed to update Kitchen Manpower');
    },
  });
};

export const useDeleteKItchenManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteKitchenManpower(id),
    onSuccess: () => {
      toast.success('Kitchen Manpower deleted successfully');
      queryClient.invalidateQueries({queryKey: ['kitchenManpower']});
    },
    onError: () => {
      toast.error('Failed to delete Kitchen Manpower');
    },
  });
};
