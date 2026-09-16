import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';

export const useGetReportData = () => {
  return useQuery({
    queryKey: ['reportDataAll'],
    queryFn: async () => {
      const response = await api.get(`/cateror/events/reports`);
      console.log('firsttttt', response.data);
      return response.data;
    },
  });
};

export const useRawMaterialReport = () => {
  return useQuery({
    queryKey: ['raw_report'],
    queryFn: rawMaterialReport,
  });
};

export const useWestageReport = () => {
  return useQuery({
    queryKey: ['westage_report'],
    queryFn: westageReport,
  });
};

export const useDisposalsReport = () => {
  return useQuery({
    queryKey: ['disposals_report'],
    queryFn: disposalsReport,
  });
};

export const useUtensilsReport = () => {
  return useQuery({
    queryKey: ['utensils_report'],
    queryFn: utensilsReport,
  });
};
const rawMaterialReport = async () => {
  try {
    const response = await api.get(`/cateror/rawmaterials/report`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get');
    }
    throw error;
  }
};

const westageReport = async () => {
  try {
    const response = await api.get(`/cateror/wastages`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get');
    }
    throw error;
  }
};

const disposalsReport = async () => {
  try {
    const response = await api.get(`/cateror/disposals/report`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get');
    }
    throw error;
  }
};

const utensilsReport = async () => {
  try {
    const response = await api.get(`/cateror/utensils/missing`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get');
    }
    throw error;
  }
};
