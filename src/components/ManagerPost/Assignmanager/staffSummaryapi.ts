import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

const getOutSourceVendor = async (subeventId: string) => {
  try {
    const response = await api.get(
      `/cateror/events/subevents/foodVendors/${subeventId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};
const updateOutSourceVendor = async (
  subeventId: string,
  data: {dishId: string; count: number}[],
) => {
  try {
    const response = await api.put(
      `/cateror/events/subevents/foodVendors/${subeventId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

const useGetOutSourceVendor = (subeventId: string) => {
  return useQuery({
    queryKey: ['outsourceVendors', subeventId],
    queryFn: () => getOutSourceVendor(subeventId),
    enabled: !!subeventId,
  });
};

const useUpdateOutSourceVendor = (subeventId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {dishId: string; count: number}[]) =>
      updateOutSourceVendor(subeventId, data),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['outsourceVendors', subeventId]});
      toast.success('Outsourced vendors updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update outsourced vendors');
      console.error('Error updating outsourced vendors:', error);
    },
  });
};

export {useGetOutSourceVendor, useUpdateOutSourceVendor};
