import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export const getQrDesign = async () => {
  try {
    const response = await api.get(`/qr`);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get process');
    }
    throw error;
  }
};

export const saveQrDesign = async (id: string, designId: string) => {
  try {
    const response = await api.post(
      `/cateror/events/subevent/addqrdesign/${id}`,
      {designId: designId},
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get select design',
      );
    }
    throw error;
  }
};

export const getSubEventDesign = async (id: string) => {
  try {
    const response = await api.get(
      `/cateror/events/subevent/addqrdesign/${id}`,
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get design');
    }
    throw error;
  }
};
