import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

// const getCosting = async (subEventId: string) => {
//   try {
//     console.log('asdfasdf', subEventId);
//     const response = await api.get(
//       `/cateror/events/subevents/vendors/${subEventId}`,
//     );
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to fetch costing data');
//   }
// };

const getCosting = async (subEventId: string) => {
  try {
    const res = await api.get(
      `/cateror/events/subevents/vendors/${subEventId}`,
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getSubEventName = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/subevent/${eventId}`);

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export {getCosting, getSubEventName};
