import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import toast from 'react-hot-toast';
import {api} from '@/utils/axios';
import {
  AddOnService,
  DeleteAddOnService,
  getAddOnService,
  saveAddOnService,
  servicePayload,
} from '@/lib/api/cateror/addonservice';

export const useGetAddOnServices = (id: string) =>
  useQuery<AddOnService[]>({
    queryKey: ['addon_services', id],
    queryFn: () => getAddOnService(id),
    enabled: !!id,
  });

export const useDeleteAddOnService = (roleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DeleteAddOnService(id),

    onSuccess: () => {
      toast.success('Addon Sevice Deleted');
      queryClient.invalidateQueries({queryKey: ['addon_services', roleId]});
    },
    onError: () => {
      toast.error('Failed To Delete Addon service');
    },
  });
};

export const useSaveAddonService = (roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: servicePayload) => saveAddOnService(roleId, data),
    onSuccess: () => {
      toast.success('Addon service Saved Succesfully');
      queryClient.invalidateQueries({queryKey: ['addon_services', roleId]});
    },
    onError: () => {
      toast.error('Failed To Save Addon service');
    },
  });
};

export const useUpdateAddOnService = (roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: servicePayload}) =>
      api.put(`cateror/additionalService/${id}`, data),
    onSuccess: () => {
      toast.success('Addon service Updated Succesfully');
      queryClient.invalidateQueries({queryKey: ['addon_services', roleId]});
    },
    onError: () => {
      toast.error('Failed To Update Addon service');
    },
  });
};
