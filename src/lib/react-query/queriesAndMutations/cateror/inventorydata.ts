/* eslint-disable */
import {getDisposalCategories} from '@/lib/api/admin/disposal';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {
  addRawMaterialReturn,
  bulkAddRawMaterialToInventory,
  delteInventoryData,
  getInventoryData,
  getInventoryDataById,
  getRawMaterialReturn,
  saveRawMaterialReturn,
  updateInventoryData,
} from '@/lib/api/cateror/inventory';
import toast from 'react-hot-toast';

export const useGetInventoryData = () => {
  return useQuery({
    queryKey: ['InventoryData'],
    queryFn: getInventoryData,
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: delteInventoryData,
    onSuccess: () => {
      toast.success('Cateror Deleted!');
    },
    onError: () => {
      toast.error('Failed to delete cateror');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['InventoryData'],
      });
    },
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      updateInventoryData(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['InventoryData'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to Update Inventory'),
  });
};

export const useAddRawMaterialReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRawMaterialReturn,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['RawMaterialReturn'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useGetInventoryDataById = (id: string) => {
  return useQuery({
    queryKey: ['InventoryData'],
    queryFn: () => getInventoryDataById(id),
    enabled: !!id,
  });
};

export const useAddRawMaterialToInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkAddRawMaterialToInventory,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['InventoryData'],
      });
    },
    onSuccess: () =>
      toast.success('Raw Material added to inventory successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useSaveRawMaterialReturn = (EventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: {
        id: string;
        quantity: number;
        vendorName?: string;
      }[],
    ) => saveRawMaterialReturn(EventId, data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['RawMaterialReturn'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useGetRawMaterialReturn = (EventId: string) => {
  return useQuery({
    queryKey: ['RawMaterialReturn'],
    queryFn: () => getRawMaterialReturn(EventId),
    enabled: !!EventId,
  });
};
