import {updateCaterorProfile} from '@/lib/api/cateror/caterorprofile';
import {CaterorProfile} from '@/types/cateror';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useUpdateCaterorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caterorId,
      fullname,
      email,
      phoneNumber,
      address,
      state,
      city,
      username,
      password,
      googleRating,
      facebook,
      instagram,
      youtube,
      image,
    }: {
      caterorId: string;
      fullname: string;
      email: string;
      phoneNumber: string;
      address: string;
      state: string;
      city: string;
      username: string;
      googleRating: string;
      facebook: string;
      instagram: string;
      youtube: string;
      password?: string;
      image?: string;
    }) =>
      updateCaterorProfile(
        caterorId,
        fullname,
        email,
        phoneNumber,
        address,
        state,
        city,
        username,
        googleRating,
        facebook,
        instagram,
        youtube,
        password ?? '',
        image,
      ),

    onSuccess: () => {
      toast.success('Cateror Updated!');
    },

    onError: () => {
      toast.error('Failed to update cateror');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['CATEROR_PROFILE'],
      });
    },
  });
};
