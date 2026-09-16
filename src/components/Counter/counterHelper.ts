import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface CounterService {
  serviceId: string;
  vendorId: {id: string}[];
  employeeId: {id: string}[];
  maharajId: {id: string}[];
  count: number;
  price: number;
}

interface CounterData {
  name: string;
  display: number;
  perDishQuantity: number;
  dishes: {id: string}[];
  services: CounterService[];
  range: {from: number; to: number; count: number}[];
}

interface Data extends CounterData {}

const getEmployeeandMaharaj = async () => {
  try {
    const response = await api.get('/cateror/employee/maharaj');
    return response.data;
  } catch (error) {
    console.error('Error fetching employeeandmaharaj:', error);
    throw error;
  }
};
const saveNewcounter = async (data: Data) => {
  try {
    const response = await api.post('/cateror/counter/cateror', data);
    return response.data;
  } catch (error) {
    console.error('Errorrrrrr', error);
    throw error?.response?.data?.message || 'Failed to add counter';
  }
};

const getCounter = async () => {
  try {
    const response = await api.get('/cateror/counter/cateror');
    return response.data;
  } catch (error) {
    console.error('Error fetching employeeandmaharaj:', error);
    throw error;
  }
};

const getCounterById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/counter/cateror/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employeeandmaharaj:', error);
    throw error;
  }
};
export const getCounterByCounterId = async (counterid: string) => {
  try {
    const response = await api.get(`/cateror/counter/predict/${counterid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employeeandmaharaj:', error);
    throw error;
  }
};

const updateCounter = async (id: string, data: Data) => {
  try {
    const response = await api.put(`/cateror/counter/cateror/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching employeeandmaharaj:', error);
    throw error;
  }
};

const deleteCounter = async (id: string) => {
  try {
    const response = await api.delete(`/cateror/counter/cateror/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employeeandmaharaj:', error);
    throw error;
  }
};

const useGetEmployeeandMaharaj = () => {
  return useQuery({
    queryFn: getEmployeeandMaharaj,
    queryKey: ['employeeandmaharaj'],
  });
};

const useSaveNewcounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveNewcounter,
    onSuccess: () => {
      toast.success('Counter created successfully');
      queryClient.invalidateQueries({queryKey: ['counter']});
    },
    onError: (err) => {
      toast.error(`Dish  ${err || 'Unknown error'}`);
    },
  });
};

const useGetCounter = () => {
  return useQuery({
    queryFn: getCounter,
    queryKey: ['counter'],
  });
};

const useGetCounterById = (id: string) => {
  return useQuery({
    queryFn: () => getCounterById(id),
    queryKey: ['counter', id],
  });
};

const useGetCounterByCounterId = (id: string) => {
  return useQuery({
    queryFn: () => getCounterByCounterId(id),
    queryKey: ['counter', id],
    enabled: !!id,
  });
};

const useUpdateCounter = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Data) => updateCounter(id, data),
    onSuccess: () => {
      toast.success('Counter updated successfully');
      queryClient.invalidateQueries({queryKey: ['counter']});
    },
    onError: () => {
      toast.error('Failed to update counter');
    },
  });
};

const useDeleteCounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCounter(id),
    onSuccess: () => {
      toast.success('Counter deleted successfully');
      queryClient.invalidateQueries({queryKey: ['counter']});
    },
    onError: () => {
      toast.error('Failed to delete counter');
    },
  });
};

export {
  useGetEmployeeandMaharaj,
  useSaveNewcounter,
  useGetCounter,
  useGetCounterById,
  useUpdateCounter,
  useDeleteCounter,
  useGetCounterByCounterId,
};
