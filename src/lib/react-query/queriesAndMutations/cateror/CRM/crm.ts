import {
  AddCaterorCRM,
  AddEventCRM,
  addFinalizedCancel,
  deleteCRM,
  deleteEventCRM,
  DeleteEventCRMProcess,
  getCRMById,
  GetCRMData,
  GetEventCRMData,
  GetEventHistory,
  GetEventsData,
  updateCRM,
  updateEventCRM,
  UpdateEventCRMProcess,
} from '@/lib/api/cateror/CRM/crm';
import {CRMCreate, EventCRMCreate} from '@/types/cateror';
import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useAddCaterorCRM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AddCaterorCRM,
    onSuccess: () => {
      toast.success('Cateror CRM added successfully');
      queryClient.invalidateQueries({
        queryKey: ['cateror-crm'],
      });
    },
    onError: (error) => {
      toast.error('Failed to add Cateror CRM');
    },
  });
};

export const useGetCRMData = () => {
  return useQuery({
    queryKey: ['cateror-crm'],
    queryFn: () => GetCRMData(),
  });
};

export const useDeleteCRM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCRM,
    onSuccess: () => {
      toast.success('Cateror CRM deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['cateror-crm'],
      });
    },
    onError: (error) => {
      toast.error('Failed to delete Cateror CRM');
    },
  });
};

export const useUpdateCRM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: {id: string; name: string; description?: string};
    }) => updateCRM(data),
    onSuccess: () => {
      toast.success('Cateror CRM updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['cateror-crm'],
      });
    },
    onError: (error) => {
      toast.error('Failed to update Cateror CRM');
    },
  });
};

export const useGetCRMById = (id: string) => {
  return useQuery({
    queryKey: ['cateror-crm', id],
    queryFn: () => getCRMById(id),
  });
};
/* <<<<<<<<<<<<< Event Mutation >>>>>>>>>>>>> */
export const useAddEventCRM = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eventId: string;
      employeeId: string;
      processId: string;
      note: string;
      followUpDate: string;
      followupProcessId: string; // Only string, no null
      fullname: string;
      images: string[];
      status: string;
    }) => {
      console.log('Mutation data received:', data);
      return AddEventCRM(data);
    },

    onSuccess: (response, variables) => {
      console.log('Mutation success response:', response);
      toast.success('Event CRM added successfully');
      queryClient.invalidateQueries({
        queryKey: ['event-crm', variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-events-crm'],
      });
    },

    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(error.message || 'Failed to add Event CRM');
    },
  });
};

export const useUpdateEventCRMProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      eventId: string;
      employeeId: string;
      processId: string;
      note: string;
      fullname: string;
      followUpDate: string;
      followupProcessId: string;
      images: string[];
      status: string;
    }) => {
      console.log('Update mutation data:', data);
      return UpdateEventCRMProcess(data);
    },

    onSuccess: (response, variables) => {
      console.log('Update mutation success:', response);
      toast.success('Event CRM updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['event-crm', variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-events-crm'],
      });
    },

    onError: (error: Error) => {
      console.error('Update mutation error:', error);
      toast.error(error.message || 'Failed to update Event CRM');
    },
  });
};

// Delete mutation hook - Updated to use POST method
export const useDeleteEventCRMProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventCrmProcessId: string) => {
      console.log('Deleting Event CRM process:', eventCrmProcessId);
      return DeleteEventCRMProcess(eventCrmProcessId);
    },

    onSuccess: (response, eventCrmProcessId) => {
      console.log('Delete mutation success response:', response);
      toast.success('Event CRM process deleted successfully');

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['event-crm-history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-events-crm'],
      });
    },

    onError: (error: Error, eventCrmProcessId) => {
      console.error('Delete mutation error:', error);

      // Handle foreign key constraint error specifically
      if (
        error.message.includes('foreign key constraint') ||
        error.message.includes('constraint')
      ) {
        toast.error(
          'Cannot delete this process because it is referenced by other records. Please remove dependencies first.',
        );
      } else {
        toast.error(error.message || 'Failed to delete Event CRM process');
      }
    },
  });
};

// React Query mutation hook
export const useSubmitFinalizedCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFinalizedCancel,
    onSuccess: () => {
      toast.success('CRM status updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['cateror-crm'],
      });
      queryClient.invalidateQueries({
        queryKey: ['events-crm'],
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(error.message || 'Failed to update CRM status');
    },
  });
};

export const useGetAllEventsCrm = () => {
  return useQuery({
    queryKey: ['event-crm'],
    queryFn: () => GetEventsData(),
  });
};
export const useGetEventCRMHistory = (selectedEventId: string) => {
  return useQuery({
    queryKey: ['gethistory', selectedEventId],
    queryFn: () => GetEventHistory(selectedEventId),
    enabled: !!selectedEventId, // Only fetch when eventId is available
  });
};

export const useGetEventCRMData = (id: string) => {
  return useQuery({
    queryKey: ['event-crm', id],
    queryFn: () => GetEventCRMData(id),
  });
};

export const useDeleteEventCRM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEventCRM,
    onSuccess: () => {
      toast.success('Event CRM deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['event-crm'],
      });
    },
    onError: (error) => {
      toast.error('Failed to delete Event CRM');
    },
  });
};

export const useUpdateEventCRM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({eventId, data}: {eventId: string; data: EventCRMCreate}) =>
      updateEventCRM(eventId, data),
    onSuccess: () => {
      toast.success('Event CRM updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['event-crm'],
      });
    },
    onError: (error) => {
      toast.error('Failed to update Event CRM');
    },
  });
};
