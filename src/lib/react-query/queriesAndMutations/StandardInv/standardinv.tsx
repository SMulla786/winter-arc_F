import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';

export const useGetStadardInv = () =>
  useQuery({
    queryKey: ['addon_services'],
    queryFn: () => getstandard(),
  });

export const getstandard = async () => {
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
