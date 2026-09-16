import {GstBillData, GstQuotationData, subEventCost} from '@/types/cateror';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

const getQuatation = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/quotations/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get quatation',
      );
    }
    throw error;
  }
};

const updateQuatation = async (eventId: string) => {
  try {
    const res = await api.patch(`/cateror/events/quotations/${eventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update quatation',
      );
    }
    throw error;
  }
};

const createQuotationDesign = async (formData: FormData) => {
  try {
    const res = await api.post(`/cateror/cateror/QuotationDesign`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('secondtttttt', res.data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to create quotation design',
      );
    }
    throw error;
  }
};

const getQuatationImage = async (id: string) => {
  try {
    const res = await api.get(`/cateror/cateror/QuotationDesign/${id}`);
    console.log('firsttttttt', res.data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get quotation design',
      );
    }
    throw error;
  }
};

const getQuotationUploadImg = async () => {
  try {
    const res = await api.get(`quotation`);
    console.log('firsttttttt', res.data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get quotation design',
      );
    }
    throw error;
  }
};

export const AddGstquotationdetail = async (
  eventId: string,
  data: subEventCost,
) => {
  try {
    const res = await api.put(`/cateror/events/quotations/${eventId}`, data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add gst');
    }
    throw error;
  }
};

export {
  getQuatation,
  updateQuatation,
  createQuotationDesign,
  getQuatationImage,
  getQuotationUploadImg,
};
