import {CRMCreate, CRMFinilizedCancel, EventCRMCreate} from '@/types/cateror';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const AddCaterorCRM = (data: CRMCreate) => {
  try {
    const res = api.post('cateror/crm', data);

    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add CRM');
    }
    throw error;
  }
};

export const GetCRMData = () => {
  try {
    const res = api.get('cateror/crm');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get CRM');
    }
    throw error;
  }
};

export const updateCRM = (data: {
  id: string;
  name: string;
  description?: string;
}) => {
  try {
    const res = api.put(`cateror/crm/${data.id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update CRM');
    }
    throw error;
  }
};

export const deleteCRM = (id: string) => {
  try {
    const res = api.delete(`cateror/crm/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete CRM');
    }
    throw error;
  }
};

export const getCRMById = (id: string) => {
  try {
    const res = api.get(`cateror/crm/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get CRM');
    }
    throw error;
  }
};
/* <<<<<<<<<<<<<<<<< Event CRM API >>>>>>>>>>>>>>> */
export const AddEventCRM = async (data: {
  eventId: string;
  employeeId: string;
  processId: string;
  note: string;
  fullname: string;
  followUpDate: string;
  followupProcessId: string; // Only string, no null
  images: string[];
  status: string;
}) => {
  try {
    // Validate required fields
    if (!data.eventId || !data.employeeId || !data.processId) {
      throw new Error(
        'Missing required fields: eventId, employeeId, or processId',
      );
    }

    const payload = {
      eventId: data.eventId,
      employeeId: data.employeeId,
      processId: data.processId,
      note: data.note || '',
      fullname: data.fullname,
      followUpDate: data.followUpDate,
      followupProcessId: data.followupProcessId, // Always a string
      images: data.images || [],
      status: data.status,
    };

    console.log('API Payload being sent:', payload);

    const res = await api.post(`cateror/crm/event/${data.eventId}`, payload);
    console.log('API Response:', res.data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || 'Failed to add Event CRM';
      console.error('API Error Details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        payload: data,
      });
      throw new Error(errorMessage);
    }
    console.error('Non-Axios Error:', error);
    throw error;
  }
};
// If same API endpoint is used for delete (POST method)
export const DeleteEventCRMProcess = async (eventCrmProcessId: string) => {
  try {
    const res = await api.delete(`cateror/crm/event/${eventCrmProcessId}`);
    console.log('Delete API Response:', res.data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete Event CRM process';
      console.error('Delete API Error Details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(errorMessage);
    }
    console.error('Non-Axios Delete Error:', error);
    throw error;
  }
};

export const UpdateEventCRMProcess = async (data: {
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
  try {
    const payload = {
      employeeId: data.employeeId,
      processId: data.processId,
      note: data.note,
      fullname: data.fullname,
      followUpDate: data.followUpDate,
      followupProcessId: data.followupProcessId,
      images: data.images,
      status: data.status,
    };

    console.log('Update API Payload:', payload);

    const res = await api.put(`cateror/crm/event/${data.id}`, payload);

    console.log('Update API Response:', res.data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update Event CRM';
      console.error('Update API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

interface FinalizePayload {
  eventId: string;
  tentativeAmount: number;
  processId: string;
  status: string;
}

interface CancelPayload {
  eventId: string;
  cancelledReason: string;
  processId: string;
  status: string;
}
// API function
export const addFinalizedCancel = async (
  data: FinalizePayload | CancelPayload,
) => {
  try {
    console.log('Sending payload to API:', data);
    const res = await api.put(
      `cateror/crm/event/finilize/${data.eventId}`,
      data,
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update CRM status',
      );
    }
    throw error;
  }
};

export const GetEventsData = () => {
  try {
    const res = api.get(`cateror/crm/event`);
    console.log('daasdds', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event CRM',
      );
    }
    throw error;
  }
};
export const GetEventHistory = async (eventId: string) => {
  try {
    const res = await api.get(`cateror/crm/event/finilize/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch CRM history',
      );
    }
    throw error;
  }
};
export const GetEventCRMData = (id: string) => {
  try {
    const res = api.get(`cateror/crm/event/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event CRM',
      );
    }
    throw error;
  }
};

export const updateEventCRM = (eventId: string, data: EventCRMCreate) => {
  try {
    const res = api.put(`cateror/crm/event/${eventId}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Event CRM',
      );
    }
    throw error;
  }
};

export const deleteEventCRM = (id: string) => {
  try {
    const res = api.delete(`cateror/crm/event/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Event CRM',
      );
    }
    throw error;
  }
};

export const getEventCRMById = (id: string) => {
  try {
    const res = api.get(`cateror/crm/event/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event CRM',
      );
    }
    throw error;
  }
};

export const AddEventCRMById = (id: string, data: EventCRMCreate) => {
  try {
    const res = api.post(`cateror/crm/event/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add Event CRM',
      );
    }
    throw error;
  }
};
