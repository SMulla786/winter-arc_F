import toast from 'react-hot-toast';
import {
  getAllEventsWithSubEvents,
  dishCountTotal,
  getAllDishHistory,
  getAllRawMaterialHistory,
  getRawListHistory,
  getAllRawMaterialHistoryById,
  updateRawHistory,
  rawRegularHistory,
  rawExtraHistory,
} from '../../admin/totaldishcountandrawmaterial';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AddExtraRawMaterial} from '@/types/dish';
import {addExtraRawMaterial} from '../../admin/totaldishcountandrawmaterial';

export const useGetAllEventsWithSubEvents = () => {
  return useQuery({
    queryKey: ['dishcountcalculation'],
    queryFn: () => getAllEventsWithSubEvents(),
  });
};

export const useDishCountTotal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dishCountTotal,
    // onSuccess: () => {
    //   toast.success('Save successfully');
    // },
    onError: (error) => {
      toast.error('Failed to save');
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishcountcalculation'],
      });
    },
  });
};

export const useAddExtraRawMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddExtraRawMaterial) => addExtraRawMaterial(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['AddExtraRawMaterial'],
      });
    },
    onSuccess: () => toast.success('Raw Material get successfully!'),
    onError: () => toast.error('Failed to get raw material'),
  });
};

export const useGetDishListHistory = () => {
  return useQuery({
    queryKey: ['dishlisthistory'],
    queryFn: () => getAllDishHistory(),
  });
};

export const useGetRawListHistory = () => {
  return useQuery({
    queryKey: ['rawlist_history'],
    queryFn: () => getRawListHistory(),
  });
};
export const useGetRawListHistoryById = (id: string) => {
  return useQuery({
    queryKey: ['rawlist_history'],
    queryFn: () => getAllRawMaterialHistoryById(id),
  });
};

export const useGetRawMaterialHistory = () => {
  return useQuery({
    queryKey: ['rawmaterialhistory'],
    queryFn: () => getAllRawMaterialHistory(),
  });
};

export const useUpdateRawMaterialHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      extramaterials,
      materials,
    }: {
      id: string;
      extramaterials: rawExtraHistory;
      materials: rawRegularHistory;
    }) => updateRawHistory(id, extramaterials, materials),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['update_history'],
      });
    },
    onSuccess: () => toast.success('Raw Material updated successfully!'),
    onError: () => toast.error('Failed to update raw material'),
  });
};
