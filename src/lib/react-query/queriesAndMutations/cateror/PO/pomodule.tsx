/*eslint-disable*/
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  getPoEventcat,
  getdateforevent,
  getRawMaterialforevent,
  getcustomereport,
  getCustomById,
  updatePurchaseOrder,
  getAllEventsWithSubEventspo,
  getRawMaterialByDatePo,
  submitPurchaseorderEvent,
  createVendors,
  updateVendors,
  deleteVendors,
  getVendorsPo,
  deletecustom,
  getHistoryeventPo,
  updateEventPo,
  UpdateEventPoPayload,
  getEventById,
  submitStore,
  getStoreRawMaterials,
  submitPurchaseorderEventInward,
  submitRawmaterialReturn,
  getRawMaterialforeventPo,
  submitPurchaseOrder,
  getHistoryeventPoById,
  // getcustomereportById,
  submitPurchaseorder,
  submitPurchaseorderByEvent,
  getPurchaseorder,
  submitPurchaseorderCustom,
  getPurchaseorderCustom,
  deletePurchaseOrderCustom,
  getpomaindata,
  getcustomereportById,
  submitExternalPo,
  submitExternalPoNew,
  getExternalRMPoNew,
} from '@/lib/api/cateror/PO/pomodule';
import toast from 'react-hot-toast';
import {getVendors} from '@/lib/api/cateror/vendor';

export const useGetPoEventCategory = (eventId: string) =>
  useQuery({
    queryKey: ['Poeventcategory', eventId],
    queryFn: () => getPoEventcat(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });

export const useGetEventsByDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getdateforevent,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['date-get'],
      });
    },
    onSuccess: () => toast.success('Purchase order generated successfully!'),
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to generate purchase order'),
  });
};

export const useGetAllEventsWithSubEventsPO = () => {
  return useQuery({
    queryKey: ['eventgetall'],
    queryFn: () => getAllEventsWithSubEventspo(),
  });
};

export const useGetStoreRawMaterials = () => {
  return useQuery({
    queryKey: ['eventgetall'],
    queryFn: () => getStoreRawMaterials(),
  });
};

export const useSubmitCustomStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitStore,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['rawmaterials'],
      });
    },
    onSuccess: () => toast.success('Costum generated successfully!'),
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to generate purchase order'),
  });
};
export const useGetRawMaterialsByDatePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getRawMaterialByDatePo,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['rawMaterials'],
      });
    },
    onSuccess: () => toast.success('Purchase order generated successfully!'),
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to generate purchase order'),
  });
};

export const useGetEventRawMaterials = (eventId: string) =>
  useQuery({
    queryKey: ['geteventdata', eventId],
    queryFn: () => getRawMaterialforevent(eventId),
    enabled: !!eventId,
  });

export const useGetEventRawMaterialsPO = (id: string) =>
  useQuery({
    queryKey: ['geteventdata', id],
    queryFn: () => getRawMaterialforeventPo(id),
    enabled: !!id,
  });

export const useSubmitEventPOInward = () => {
  return useMutation({
    mutationFn: (data: any) => submitPurchaseorderEventInward(data),
    onSuccess: () => {
      toast.success('Event PO Inward submitted successfully');
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Event PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};

export const useSubmitReturnStore = () => {
  return useMutation({
    mutationFn: (data: any) => submitRawmaterialReturn(data),
    onSuccess: () => {
      toast.success('Raw Material Return Inward submitted successfully');
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Event PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};

export const useSubmitEventPO = (eventId: string) => {
  return useMutation({
    mutationFn: (data: any) => submitPurchaseorderEvent(data, eventId, false), // Regular PO
    onSuccess: () => {
      toast.success('Event PO submitted successfully');
    },
  });
};

export const useSaveEventPODraft = (eventId: string) => {
  return useMutation({
    mutationFn: (data: any) => submitPurchaseorderEvent(data, eventId, false), // Regular PO
    onSuccess: () => {
      toast.success('Event PO submitted successfully');
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Event PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};

export const useSubmitExternalventPO = (ListId: string) => {
  return useMutation({
    mutationFn: (data: any) => submitExternalPo(data, ListId),
    onSuccess: () => {
      toast.success('Event PO submitted successfully');
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Event PO: ${error.message || 'Unknown error'}`,
      );
    },
  });
};
export const useSubmitExternalventPONew = (ListId: string) => {
  return useMutation({
    mutationFn: (data: any) => submitExternalPoNew(data, ListId),
    onSuccess: () => {
      toast.success('Event PO submitted successfully');
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Event PO: ${error.message || 'Unknown error'}`,
      );
    },
  });
};

export const useGetExternalRMNew = (listId: string) => {
  return useQuery({
    queryKey: ['customdata-get', listId],
    queryFn: () => getExternalRMPoNew(listId),
    enabled: !!listId,
  });
};

export const useGetPoMainData = (id: string) => {
  return useQuery({
    queryKey: ['eventPoHistoryById', id],
    queryFn: () => getpomaindata(id),
    enabled: !!id,
  });
};

export const useGetHistory = () => {
  return useQuery({
    queryKey: ['eventPoHistory'],
    queryFn: () => getHistoryeventPo(),
  });
};

export const useGetHistoryeventPoById = (id: string) => {
  return useQuery({
    queryKey: ['eventPoHistoryById', id],
    queryFn: () => getHistoryeventPoById(id),
    enabled: !!id,
  });
};

export const useGetPurchaseorder = () => {
  return useQuery({
    queryKey: ['purchaseorder'],
    queryFn: () => getPurchaseorder(),
  });
};

export const submitOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitPurchaseOrder,
    onSuccess: () => {
      toast.success('Custom PO submitted successfully');
      queryClient.invalidateQueries({queryKey: ['rawmaterials']});
      queryClient.invalidateQueries({queryKey: ['getdate']});
      queryClient.invalidateQueries({queryKey: ['Poeventcategory']});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Custom PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};

export const useSubmitPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitPurchaseorder,
    onSuccess: () => {
      toast.success('Custom PO submitted successfully');
      queryClient.invalidateQueries({queryKey: ['rawmaterials']});
      queryClient.invalidateQueries({queryKey: ['getdate']});
      queryClient.invalidateQueries({queryKey: ['Poeventcategory']});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Custom PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};
export const useSubmitPurchaseOrderCustom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitPurchaseorderCustom,
    onSuccess: () => {
      toast.success('Custom PO submitted successfully');
      queryClient.invalidateQueries({queryKey: ['customrawmaterials']});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Custom PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};

export const useGetSubmitPurchaseOrderCustom = () => {
  return useQuery({
    queryKey: ['customrawmaterials'],
    queryFn: getPurchaseorderCustom,
  });
};

export const useDeleteSubmitPurchaseOrderCustom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePurchaseOrderCustom,
    onSuccess: () => {
      toast.success('Custom PO deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['customrawmaterials'],
      });
    },
  });
};

export const useSubmitPurchaseOrderEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => submitPurchaseorderEvent(data, eventId, true), // Emergency PO
    onSuccess: () => {
      toast.success('Emergency PO submitted successfully');
      queryClient.invalidateQueries({queryKey: ['rawmaterials']});
      queryClient.invalidateQueries({queryKey: ['getdate']});
      queryClient.invalidateQueries({queryKey: ['Poeventcategory']});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Emergency PO: ${error.message || 'Unknown error'}`,
      );
      console.error('Submission error:', error);
    },
  });
};

export const useGetcustomReport = () => {
  return useQuery({
    queryKey: ['getcustomreport'],
    queryFn: getcustomereport,
  });
};
export const useGetcustomReportById = (id: string) => {
  return useQuery({
    queryKey: ['getcustomreportById'],
    queryFn: () => getcustomereportById(id),
    enabled: !!id,
  });
};

export const useCustomById = (id: string) => {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => getCustomById(id),
    // enabled: !!id,
  });
};
export const useDeleteCustom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletecustom,
    onSuccess: () => {
      toast.success('Custom PO deleted!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['custom-purchase-orders'],
      });
    },
  });
};
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      updatePurchaseOrder(id, data),
    onSuccess: () => {
      toast.success('Purchase Order updated successfully!');
      queryClient.invalidateQueries({queryKey: ['custom-purchase-orders']});
      queryClient.invalidateQueries({queryKey: ['custom-report']});
      queryClient.invalidateQueries({queryKey: ['custom-by-id']});
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update purchase order',
      );
    },
  });
};

export const useGetVendorsPo = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: getVendorsPo,
  });
};

export const useEventById = (id: string) => {
  return useQuery({
    queryKey: ['eventById', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
};

export const useUpdateEventPo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateEventPoPayload}) =>
      updateEventPo(id, data),
    onSuccess: () => {
      toast.success('Update Event PO');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['eventPoHistory'],
      });
    },
  });
};

export const useCreateVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendors,
    onSuccess: () => {
      toast.success('PO Vendor created!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendors'],
      });
    },
  });
};

export const useUpdateVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVendors,
    onSuccess: () => {
      toast.success('PO Vendor updated!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendors'],
      });
    },
  });
};

export const useDeleteVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendors,
    onSuccess: () => {
      toast.success('PO Vendor deleted!');
    },
    onError: (error: any) => {
      toast.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendors'],
      });
    },
  });
};
