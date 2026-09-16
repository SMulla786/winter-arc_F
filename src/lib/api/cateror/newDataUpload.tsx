import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

type Item = {
  name: string;
  description: string;
  type: string;
  categoryId: string;
};

export type fileUploadPayload = {
  items: Item[];
};

type ItemRaw = {
  name: string;
  unit: string;
  categoryId: string;
};

export type fileUploadPayloadRaw = {
  items: ItemRaw[];
};

type category = {
  name: string;
};

export type categoryPayload = {
  items: category[];
};

export const uploadFiledish = async (data: fileUploadPayload) => {
  try {
    const res = await api.post(`/cateror/dishes/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileRawMaterial = async (data: fileUploadPayloadRaw) => {
  try {
    const res = await api.post(`/cateror/rawmaterials/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileDisposals = async (data: fileUploadPayloadRaw) => {
  try {
    const res = await api.post(`/cateror/disposals/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileUtensils = async (data: fileUploadPayloadRaw) => {
  try {
    const res = await api.post(`/cateror/utensils/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileDishCat = async (data: categoryPayload) => {
  try {
    const res = await api.post(`/cateror/dishes/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileRawCat = async (data: categoryPayload) => {
  try {
    const res = await api.post(`/cateror/rawmaterials/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileUtensilsCat = async (data: categoryPayload) => {
  try {
    const res = await api.post(`/cateror/utensils/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadFileDisposalsCat = async (data: categoryPayload) => {
  try {
    const res = await api.post(`/cateror/disposals/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};
