import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';

export const useGetAccountAnylysis = (subEventId: string) => {
  return useQuery({
    queryKey: ['AccountAnylysis', subEventId],
    queryFn: () => getAccountAnylysis(subEventId),
  });
};

export const getAccountAnylysis = async (subEventId: string) => {
  try {
    const res = await api.get(`/cateror/analysis/${subEventId}`);
    console.log('ressssss', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};
