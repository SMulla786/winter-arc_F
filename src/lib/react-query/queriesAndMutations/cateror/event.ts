import {
  addEvent,
  addSubEventDishRawMaterial,
  bulkAddEventDishWastage,
  createExtraCost,
  createSubevent,
  createSubeventExternal,
  deleteEvent,
  deleteExtraCost,
  deleteSubEventById,
  getActualPeople,
  getallDishCategoriesWithDishes,
  getAllDishProcess,
  getallEvents,
  getAllRawMaterialFromSubEvent,
  getAllRawmaterialsFromEvent,
  getEventById,
  getExtraCost,
  getFoodVendorAssignments,
  getQrData,
  getQuotation,
  getSubEvent,
  getSubEventById,
  getWastages,
  subEventPrediction,
  updateActualPeople,
  updateBillingCost,
  updateEvent,
  updateQuotation,
  updateSubEvent,
  updateSubeventCost,
  postassign,
  pinData,
  updateFoodVendorAssignments,
  getShareDataBySubeventId,
  addCutleryInSubEvent,
  getCutleryInSubEvent,
  getEventSummary,
  getallexternalpo,
  postMultiPackagesToSubEvent,
  getMultiPackagesToSubEvent,
  getallexternalpodata,
  getAllRawmaterialsUsageFromEvent,
} from '@/lib/api/cateror/event';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {EVENT_KEYS, EVENT_RAW_MATERIAL, QUATATION_KEYS} from '../../queryKeys';
import {BsWindowSidebar} from 'react-icons/bs';

const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addEvent,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_EVENTS],
      });
      toast.success('Event created successfully!');
    },
  });
};

const useGetEventById = (id: string) => {
  return useQuery({
    queryKey: [EVENT_KEYS.GET_EVENT_BY_ID, id],
    queryFn: () => getEventById(id),
  });
};

const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_EVENTS],
      });
      toast.success('Event updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });
};

const useGetAllEvents = (options?: {enabled?: boolean}) => {
  return useQuery({
    queryKey: [EVENT_KEYS.GET_ALL_EVENTS],
    queryFn: () => getallEvents(),
    enabled: options?.enabled ?? true,
  });
};

export const useAssignPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: pinData) => postassign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assign-pin'],
      });
    },
  });
};

const useGetAllDishCategoriesWithDishes = () => {
  return useQuery({
    queryKey: [EVENT_KEYS.GET_ALL_DISH_CATEGORIES_WITH_DISHES],
    queryFn: () => getallDishCategoriesWithDishes(),
  });
};

const useCreateSubevent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubevent,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
      });
      toast.success('Sub Event created successfully!');
    },
    onError: (error) => {
      toast.error(error);
    },
  });
};

export const useCreateSubeventExternal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubeventExternal,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
      });
      toast.success('Sub Event created successfully!');
    },
    onError: (error) => {
      toast.error(error);
    },
  });
};

const useUpdateSubEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSubEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update sub event');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
      });
      toast.success('Sub Event Updated successfully!');
    },
  });
};

export const useAddCutleryInSubEvent = (subEventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn(data:{cutlery: {id: string}[]}): addCutleryInSubEvent,
    mutationFn: (data: {id: string}[]) =>
      addCutleryInSubEvent(subEventId, data),

    onSuccess: () => {
      toast.success('Cutlery added in subevent successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update sub event cutlery');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['cutleryInSubEvent', subEventId],
      });
    },
  });
};

export const useGetCutleryInSubEvent = (subEventId: string) => {
  return useQuery({
    queryKey: ['cutleryInSubEvent', subEventId],
    queryFn: () => getCutleryInSubEvent(subEventId),
  });
};

export const useDeleteSubEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubEventById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
      });
      toast.success('Sub Event deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete sub event');
    },
  });
};

export const useAddSubEventDishRawMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSubEventDishRawMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
      });
      queryClient.invalidateQueries({
        queryKey: ['eventRawMaterial'],
      });
      toast.success('Sub Event Dish RawMaterial Added Successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add Sub Event Dish Raw Material');
    },
  });
};

const useGetSubevent = (eventId: string) => {
  return useQuery({
    queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
    queryFn: () => getSubEvent(eventId),
  });
};

const useGetSubeventById = (subEventId: string) => {
  return useQuery({
    queryKey: [EVENT_KEYS.GET_ALL_SUBEVENTS],
    queryFn: () => getSubEventById(subEventId),
  });
};

const useGetShareDataBySubeventId = (subEventId: string) => {
  return useQuery({
    queryKey: ['shareData', subEventId],
    queryFn: () => getShareDataBySubeventId(subEventId),
    enabled: !!subEventId,
  });
};

const useGetAllRawMaterialFromSubEvent = (EventId: string) => {
  return useQuery({
    queryKey: [EVENT_RAW_MATERIAL.GET_ALL_EVENT_RAW_MATERIAL],
    queryFn: () => getAllRawMaterialFromSubEvent(EventId),
  });
};

export const useGetEventRawMaterial = (eventId: string) => {
  return useQuery({
    queryKey: ['eventRawMaterial'],
    queryFn: () => getAllRawmaterialsFromEvent(eventId),
  });
};
export const useGetAllRawmaterialsUsageFromEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['eventRawMaterialUsage'],
    queryFn: () => getAllRawmaterialsUsageFromEvent(eventId),
  });
};

export const useGetExternalPoById = (listId: string) => {
  return useQuery({
    queryKey: ['eventRawMaterial'],
    queryFn: () => getallexternalpo(listId),
  });
};

export const useGetExternalPoDataById = (listId: string) => {
  return useQuery({
    queryKey: ['getdatapo'],
    queryFn: () => getallexternalpodata(listId),
  });
};

export const useGetFoodVendorAssignments = (eventId: string) => {
  return useQuery({
    queryKey: ['foodVendorAssignments'],
    queryFn: () => getFoodVendorAssignments(eventId),
  });
};

// export const updateFoodVendorAssignments = (data: any) => {
//   return useMutation({
//     mutationFn: ({subEventId,data}: any) =>
//       updateFoodVendorAssignments(subEventId, data),
//   });
// };

export const useUpdateFoodVendorAssignments = (subEventId: string) =>
  // data: {
  // id: string;
  // actual: string;}
  {
    return useMutation({
      mutationFn: ({
        // subEventId,
        data,
      }: {
        // subEventId: string;
        data: {id: string; actual: number};
      }) => updateFoodVendorAssignments(subEventId, data),
      onSuccess: async () => {
        toast.success('Vendor Assignments Updated!');
      },
      onError: () => {
        toast.error('Failed to update Vendor Assignments');
      },
    });
  };

// const useBulkAddDishWastage = () => {
//   return useMutation({
//     mutationFn: bulkAddEventDishWastage,
//     onSuccess: () => {
//       toast.success('Dish Wastage Created!');
//     },
//     onError: () => {
//       toast.error('Failed to create dish wastage');
//     },
//   });
// };

const useBulkAddDishWastage = (EventId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAddEventDishWastage,
    onSuccess: async () => {
      toast.success('Dish Wastage Created!');
      // 🔄 Refetch wastages after successful save
      if (EventId) {
        await queryClient.invalidateQueries({queryKey: ['wastages', EventId]});
      }
    },
    onError: () => {
      toast.error('Failed to create dish wastage');
    },
  });
};

const useGetWastages = (id: string) => {
  return useQuery({
    queryKey: ['wastages'],
    queryFn: () => getWastages(id),
  });
};

export const useGetAllDishProcess = (id: string) => {
  return useQuery({
    queryKey: ['wastages'],
    queryFn: () => getAllDishProcess(id),
  });
};
// after event

const useUpdateActualPeople = () => {
  return useMutation({
    mutationFn: updateActualPeople,
    onSuccess: () => {
      toast.success('Actual people updated!');
    },
    onError: () => {
      toast.error('Failed to update people');
    },
  });
};
const useUpdateSubeventCost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSubeventCost,
    onSuccess: () => {
      toast.success('Cost updated!');
    },
    onError: () => {
      toast.error('Cost Update Failed!');
    },
    onSettled: () => {
      // window.location.reload();
      queryClient.invalidateQueries({
        queryKey: ['quotation'],
      });
      queryClient.invalidateQueries({queryKey: [QUATATION_KEYS.GET_QUATATION]});
    },
  });
};

export const useUpdateBillingCost = () => {
  return useMutation({
    mutationFn: updateBillingCost,
    onSuccess: () => {
      toast.success('Billing Cost updated!');
    },
    onError: () => {
      toast.error('Billing Cost Update Failed!');
    },
  });
};
const useCreateExtraCost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExtraCost,
    onSuccess: () => {
      toast.success('Extra Cost Created!');
    },
    onError: () => {
      toast.error('This Extra Cost Already Exists!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['ExtraCost'],
      });
    },
  });
};

const useGetExtraCost = (eventId: string) => {
  return useQuery({
    queryKey: ['ExtraCost'],
    queryFn: () => getExtraCost(eventId),
  });
};

const useDeleteExtraCost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExtraCost,
    onSuccess: () => {
      toast.success('Extra Cost Deleted!');
    },
    onError: () => {
      toast.error('Failed to delete extra cost');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['ExtraCost'],
      });
    },
  });
};

const useGetActualPeople = (eventId: string) => {
  return useQuery({
    queryKey: ['actualPeople'],
    queryFn: () => getActualPeople(eventId),
  });
};

const useGetQuotation = (eventId: string) => {
  return useQuery({
    queryKey: ['quotation'],
    queryFn: () => getQuotation(eventId),
  });
};

export const useGetQuotationForBill = (eventId: string) => {
  return useQuery({
    queryKey: ['getBill'],
    queryFn: () => getQuotation(eventId),
  });
};
const useUpdateQuotation = (EventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateQuotation(EventId, data),
    onSuccess: () => {
      toast.success('Bill Updated!');
    },
    onError: () => {
      toast.error('Failed to update quotation!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['quotation'],
      });
      queryClient.invalidateQueries({queryKey: ['getGstBill']});
    },
  });
};
export const useGetQrCode = (eventId: string) => {
  return useQuery({
    queryKey: ['qrCode'],
    queryFn: () => getQrData(eventId),
  });
};

export const useSubEventPrediction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subEventId,
      preparationPeople,
    }: {
      subEventId: string;
      preparationPeople: number;
    }) => subEventPrediction(subEventId, preparationPeople),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['prediction'],
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_KEYS.GET_ALL_EVENTS],
      });
    },
  });
};

const useGetEventSummary = (id: string) =>
  useQuery({
    queryKey: ['eventSummary', id],
    // queryFn: () => api.get(`/event/${id}/summary`),
    queryFn: () => getEventSummary(id),
  });

const usePostMultiPackagesToSubEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({subEventId, data}: {subEventId: string; data: string[]}) =>
      postMultiPackagesToSubEvent(subEventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['multiPackages'],
      });
      toast.success('Packages added successfully!');
    },
  });
};

const useGetMultiPackagesToSubEvent = (
  subEventId: string,
  options?: {enabled?: boolean},
) =>
  useQuery({
    queryKey: ['multiPackageds', subEventId],
    queryFn: () => getMultiPackagesToSubEvent(subEventId),
    enabled: options?.enabled ?? true,
  });

export {
  // useGetAllRawMaterialFromEvent,
  useBulkAddDishWastage,
  useCreateEvent,
  useCreateExtraCost,
  useCreateSubevent,
  useDeleteExtraCost,
  useGetActualPeople,
  useGetAllDishCategoriesWithDishes,
  useGetAllEvents,
  useGetAllRawMaterialFromSubEvent,
  useGetShareDataBySubeventId,
  useGetExtraCost,
  useGetQuotation,
  useGetSubevent,
  useGetSubeventById,
  useGetWastages,
  useUpdateActualPeople,
  useUpdateQuotation,
  useUpdateSubEvent,
  useUpdateSubeventCost,
  useUpdateEvent,
  useGetEventById,
  useGetEventSummary,
  usePostMultiPackagesToSubEvent,
  useGetMultiPackagesToSubEvent,
};
