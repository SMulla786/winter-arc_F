import {
  bulkAddDisposalToEventSchema,
  bulkReturnDisposalToEventSchema,
} from '@/lib/validation/eventSchema';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {z} from 'zod';

type bulkAddDisposalToEventSchemaTypes = z.infer<
  typeof bulkAddDisposalToEventSchema
>;

export const bulkAddEventDisposal = async (data: {
  eventId: string;
  disposals: {disposalId: string; taken: number}[];
}) => {
  try {
    const response = await api.post('/cateror/events/disposals/bulk', data);
    console.log('api resss', response);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add Event Disposals',
      );
    }
    throw error;
  }
};

export const getEventDisposal = async (id: string) => {
  try {
    const response = await api.get(`/cateror/events/disposals/${id}`);
    console.log('response.data', response.data);

    return response.data;
  } catch (error) {
    throw new Error('Failed to return disposals');
  }
};

export const deleteDisposal = async (id: string) => {
  console.log(id);

  try {
    const res = await api.delete(`/cateror/events/disposals/${id}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete Event Disposals',
      );
    }
    throw error;
  }
};

export const bulkReturnEventDisposals = async (
  data: z.infer<typeof bulkReturnDisposalToEventSchema>,
) => {
  try {
    console.log('Sending data:', data);
    const response = await api.post(
      '/cateror/events/disposals/bulk/return',
      data,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to return Event Disposals',
      );
    }
    throw error;
  }
};
