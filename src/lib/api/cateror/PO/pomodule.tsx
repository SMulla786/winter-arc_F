/*eslint-disable*/
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export const getPoEventcat = async (eventId: string) => {
  try {
    const response = await api.get(`/cateror/purchase/${eventId}`);
    // console.log('Categories API Response:', response.data);
    const categories = Array.from(
      new Set(response.data.materials.map((m: any) => m.category || 'General')),
    );
    return categories;
  } catch (error: any) {
    toast.error(
      `Failed to fetch categories: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};
type RawMaterialByDatePayload = {
  from: string;
  to: string;
  subeventIds: string[];
};
export const getdateforevent = async (data: RawMaterialByDatePayload) => {
  try {
    const res = await api.post(`/cateror/events/rawmateriallist`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch raw materials',
      );
    }
    throw error;
  }
};
export const getAllEventsWithSubEventspo = async () => {
  try {
    const res = await api.get(`cateror/events/dishcalculation`);
    // console.log(res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

export const getStoreRawMaterials = async () => {
  try {
    const res = await api.get(`cateror/store`);
    // console.log(res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

export const submitStore = async (data: any) => {
  try {
    const response = await api.post(`/cateror/store`, data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const submitPurchaseorderEventInward = async (data: any) => {
  try {
    const response = await api.post(`/cateror/store`, data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const submitRawmaterialReturn = async (data: any) => {
  try {
    const response = await api.post(`/cateror/store`, data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};
type RawMaterialByDatePOPayload = {
  startDate: string;
  //  endDate: string;
  subeventIds: string[];
};

export const getRawMaterialByDatePo = async (
  data: RawMaterialByDatePOPayload,
) => {
  try {
    const res = await api.post(`/cateror/events/rawmateriallist`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch raw materials',
      );
    }
    throw error;
  }
};

export const getRawMaterialforevent = async (eventId: string) => {
  try {
    const response = await api.get(`/cateror/purchase/event/${eventId}`);
    console.log('getetttt raw materil', response);
    return response.data;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const getRawMaterialforeventPo = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/event/${id}`);
    console.log('API Response:', response);
    return response.data;
  } catch (error: unknown) {
    const message =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message || 'Unknown error'
        : error instanceof Error
          ? error.message
          : 'Unknown error';
    const errMsg = `Failed to fetch raw materials: ${message}`;
    toast.error(errMsg);
    throw error;
  }
};

// Submit PO function
export const submitPurchaseOrder = async (orderData: any) => {
  try {
    const response = await api.post('/cateror/purchase', orderData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add purchase order',
      );
    }
    throw error;
  }
};

export const submitPurchaseorderEvent = async (
  data: any,
  eventId: string,
  isEmergency: boolean = false,
) => {
  try {
    const payload = {
      ...data,
      isEmergency, // Add the emergency flag
    };
    const response = await api.post(
      `/cateror/purchase/event/${eventId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add purchase order event',
      );
    }
    throw error;
  }
};

export const submitExternalPo = async (data: any, ListId: string) => {
  try {
    const response = await api.post(`/cateror/purchase/event/${ListId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const submitExternalPoNew = async (data: any, ListId: string) => {
  try {
    const response = await api.post(`/cateror/purchase/rmlist/${ListId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExternalRMPoNew = async (listId: string) => {
  try {
    const response = await api.get(`/cateror/purchase/RMlistId/${listId}`);
    return response;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const getpomaindata = async (eventId: string) => {
  try {
    const response = await api.get(`/cateror/events/main/${eventId}`);

    return response.data;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const getHistoryeventPo = async () => {
  try {
    const response = await api.get(`/cateror/purchase/event`);
    console.log('getpodataaa', response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const getHistoryeventPoById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/event/purchase/${id}`);
    console.log('Submit PO Response:', response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const submitPurchaseorder = async (data: any) => {
  try {
    const response = await api.post('/cateror/purchase', data);
    // console.log('Submit PO Response:', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};
export const submitPurchaseorderCustom = async (data: any) => {
  try {
    const response = await api.post('/cateror/rawmaterials/template', data);
    // console.log('Submit PO Response:', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const getPurchaseorderCustom = async () => {
  try {
    const response = await api.get('/cateror/rawmaterials/template');
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const deletePurchaseOrderCustom = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/rawmaterials/template/${id}`);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to delete Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};
export const getPurchaseorder = async () => {
  try {
    const response = await api.get('/cateror/purchase');
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const submitPurchaseorderByEvent = async (
  data: any,
  eventId: string,
) => {
  console.log('dataddddddd', data);
  try {
    const response = await api.post(`/cateror/purchase/event/${eventId}`, data);
    // console.log('Submit PO Response:', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const getcustomereport = async () => {
  try {
    const response = await api.get('/cateror/purchase');
    console.log('custome dataa', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to fetch custtom report: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};
export const getcustomereportById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/event/emergency/${id}`);
    console.log('emergency dataa', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to fetch custtom report: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const getCustomById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/${id}`);
    // console.log('byidddd', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to fetch purchase order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const deletecustom = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/purchase/${id}`);
    // console.log('byidddd', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to fetch purchase order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

/// Update purchase order API function with proper payload
export const updatePurchaseOrder = async (id: string, data: any) => {
  try {
    console.log('Updating purchase order with data:', {id, data});

    const response = await api.put(`/cateror/purchase/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Update purchase order error:', error);
    if (error instanceof Error) {
      throw new Error(
        error.message || `Failed to update purchase order with ID: ${id}`,
      );
    }
    throw error;
  }
};

export const getVendorsPo = async () => {
  try {
    const response = await api.get(`/cateror/RMvendors`);
    // console.log('vendors dataaaaaa', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Vendors');
    }
    throw error;
  }
};

export const getEventById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/${id}`);
    console.log('byidddd', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to fetch purchase order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

// Payload type for updating an Event PO
export interface UpdateEventPoPayload {
  eventId: string;
  eventName: string;
  materials: {
    materialId: string;
    materialName: string;
    vendorId?: string;
    vendorName?: string;
    unit: string;
    quantity: number;
    category: string;
    subeventId: string;
    subeventName: string;
    date: string;
    time: string;
    venue: string;
  }[];
}

export const updateEventPo = async (id: string, data: UpdateEventPoPayload) => {
  try {
    const response = await api.put(`/cateror/purchase/${data.eventId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Update purchase order error:', error);
    if (error instanceof Error) {
      throw new Error(
        error.message || `Failed to update purchase order with ID: ${id}`,
      );
    }
    throw error;
  }
};

export const createVendors = async (data: {
  name: string;
  phone: string;
  address: string;
  categories: string[];
}) => {
  try {
    const response = await api.post(`/cateror/RMvendors`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to create Vendor',
      );
    }
    throw error;
  }
};

export const updateVendors = async (data: {
  id: string;
  name: string;
  phone: string;
  address: string;
}) => {
  try {
    const response = await api.put(`/cateror/RMvendors/${data.id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Vendor',
      );
    }
    throw error;
  }
};

export const deleteVendors = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/RMvendors/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Vendor',
      );
    }
    throw error;
  }
};
