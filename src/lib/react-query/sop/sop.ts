import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';

export const useGetSOPManagement = (id: string) => {
  return useQuery({
    queryKey: ['getsop'],
    queryFn: () => getSopdata(id),
  });
};

const getSopdata = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/sop/${eventId}`);
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
