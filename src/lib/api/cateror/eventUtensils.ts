import {bulkAddUtensilToEventSchema} from '@/lib/validation/eventSchema';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import z from 'zod';

type bulkAddUtensilToEventSchemaTypes = z.infer<
  typeof bulkAddUtensilToEventSchema
>;

const bulkAddEventUtensils = async (data: bulkAddUtensilToEventSchemaTypes) => {
  try {
    const response = await api.post('/cateror/events/utensils/bulk', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to Add Event Utensils',
      );
    }
    throw error;
  }
};

const getEventUtensils = async (id: string) => {
  try {
    const response = await api.get(`/cateror/events/utensilsByEventId/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Utensils',
      );
    }
    throw error;
  }
};

export const deleteUtensils = async (id: string) => {
  try {
    const res = await api.delete(`/cateror/events/utensils/${id}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Utensils',
      );
    }
    throw error;
  }
};

const bulkReturnEventUtensils = async (
  data: bulkAddUtensilToEventSchemaTypes,
) => {
  try {
    const response = await api.post('/cateror/events/utensils/bulk/return', {
      eventId: data.eventId,
      utensils: data.utensils,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Utensils',
      );
    }
    throw error;
  }
};

export {bulkAddEventUtensils, getEventUtensils, bulkReturnEventUtensils};
