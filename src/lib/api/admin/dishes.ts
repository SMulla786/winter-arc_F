import {languageId} from '@/lib/contants';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getRawMaterialCaterorAdmin = async (languageId: string) => {
  try {
    const res = await api.get(`/admin/rawmaterials/language/${languageId}`);
    // console.log('res.data', res);
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

export const getProcessesadmin = async (languageId: string | undefined) => {
  try {
    const response = await api.get('/admin/process', {params: {languageId}});
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const addMultipleDishRawMaterialsadmin = async (data: {
  caterorid: string;
  dishName: string;
  dishCategoryId: string;
  vegNonveg: 'VEG' | 'NONVEG';
  description: string | undefined;
  prices: {
    people: number;
    kg: number;
    rawMaterials: {
      rawMaterialId: string;
      processId: string;
      quantity: number;
    }[];
  }[];
}) => {
  try {
    const response = await api.post(`admin/dishes/new/${data.caterorid}`, {
      ...(data.prices ? data : {...data, prices: []}),
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to add multiple raw materials to dish',
      );
    }
    throw error;
  }
};

export const updateMultipleDishRawMaterialsadmin = async (data: {
  dishId: string;
  dishName: string;
  dishCategoryId: string;
  vegNonveg: 'VEG' | 'NONVEG';
  description: string | undefined;
  prices: {
    people: number;
    kg: number;
    rawMaterials: {
      rawMaterialId: string;
      processId: string;
      quantity: number;
    }[];
  }[];
}) => {
  try {
    const {dishId, ...body} = data;
    const res = await api.put(`admin/dishes/new/${dishId}`, body);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ??
          'Failed to update raw materials for dish',
      );
    }
    throw error;
  }
};

export const predictRawMaterialForDishadmin = async (params: {
  dishId: string;
  people?: number;
  price?: number;
  kg?: number;
}) => {
  try {
    const response = await api.get(`/admin/dishes/rawmaterials/predict`, {
      params: {
        dishId: params.dishId,
        people: params.people,
        price: params.price,
        kg: params.kg,
      },
    });
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to predict raw materials for dish',
      );
    }
    throw error;
  }
};
