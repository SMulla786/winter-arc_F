import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

export async function postFeedback(
  subId: string,
  data: {
    rating: number;
    name: string;
    phone?: string;
    email?: string;
    feedback: string;
  },
) {
  try {
    const response = await api.post(`subEvent/feedback/${subId}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch feedbacks',
      );
    }
    throw error;
  }
}
export async function getFeedback(eventId: string) {
  try {
    const response = await api.get(
      `cateror/events/subEvents/feedback/${eventId}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch feedbacks',
      );
    }
    throw error;
  }
}

export async function updateQrPageCount(eventId: string) {
  try {
    const response = await api.put(`/subevent/feedback/count/${eventId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch feedbacks',
      );
    }
    throw error;
  }
}
export async function updateGooglePageCount(eventId: string) {
  try {
    const response = await api.post(`/subevent/feedback/count/${eventId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch feedbacks',
      );
    }
    throw error;
  }
}
