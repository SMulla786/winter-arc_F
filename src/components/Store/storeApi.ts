import {api} from '@/utils/axios';
import {useMutation, useQuery} from '@tanstack/react-query';

const fetchRawMaterialReturnByEventId = async (eventId: string) => {
  try {
    const response = await api.get(`/cateror/store/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const fetchPOByPOId = async (poId: string) => {
  try {
    const response = await api.get(`/cateror/store/po/${poId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const fetchAllPO = async () => {
  try {
    const response = await api.get(`/cateror/purchase/all`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const submitWastage = async (
  wastages: {materialId: string; quantity: number}[],
) => {
  try {
    const response = await api.post(`/cateror/store/wastage`, wastages);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getOutwardEvent = async (eventId: string) => {
  try {
    const response = await api.get(`/cateror/store/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getInwordHistory = async () => {
  try {
    const response = await api.get(`/cateror/store/inwords`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getOutwordHistory = async () => {
  try {
    const response = await api.get(`/cateror/store/outwords`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const useRawMaterialReturnByEventId = (eventId: string) => {
  return useQuery({
    queryKey: ['raw-material-return', eventId],
    queryFn: () => fetchRawMaterialReturnByEventId(eventId),
  });
};
export const usePOByPOId = (poId: string) => {
  return useQuery({
    queryKey: ['po', poId],
    queryFn: () => fetchPOByPOId(poId),
  });
};

export const useAllPO = () => {
  return useQuery({
    queryKey: ['po'],
    queryFn: () => fetchAllPO(),
  });
};
export const useSubmitWastage = () => {
  return useMutation({
    mutationFn: (wastages: {materialId: string; quantity: number}[]) =>
      submitWastage(wastages),
    onSuccess: (data) => {
      console.log('Wastage submitted successfully with data:', data);
    },
    onError: (error, wastages) => {
      console.error('Error submitting wastage for', wastages, ':', error);
    },
  });
};
export const useOutwardEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['outward-event', eventId],
    queryFn: () => getOutwardEvent(eventId),
  });
};

export const useInwordHistory = () => {
  return useQuery({
    queryKey: ['inword-history'],
    queryFn: () => getInwordHistory(),
  });
};
export const useOutwordHistory = () => {
  return useQuery({
    queryKey: ['outword-history'],
    queryFn: () => getOutwordHistory(),
  });
};
