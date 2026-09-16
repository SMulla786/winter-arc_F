/* eslint-disable */
import toast from 'react-hot-toast';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {QUATATION_KEYS} from '../../queryKeys';
import {
  AddGstquotationdetail,
  createQuotationDesign,
  getQuatation,
  getQuatationImage,
  getQuotationUploadImg,
  updateQuatation,
} from '@/lib/api/cateror/quatation';
import {GstBillData, GstQuotationData, subEventCost} from '@/types/cateror';

const useUpdateQuatation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateQuatation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUATATION_KEYS.GET_QUATATION],
      });
      toast.success('Quatation Updated Successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    },
  });
};

const useGetQuatation = (id: string) => {
  return useQuery({
    queryKey: [QUATATION_KEYS.GET_QUATATION],
    queryFn: () => getQuatation(id),
  });
};

const useCreateQuotationDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuotationDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['image']});
      toast.success('Successfully Created!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload');
    },
    onSettled: () => {
      toast.dismiss();
    },
  });
};

const useGetQuatationImage = (id: string) => {
  return useQuery({
    queryKey: ['image'],
    queryFn: () => getQuatationImage(id),
  });
};

const useGetQuatationUploadImg = () => {
  return useQuery({
    queryKey: ['image'],
    queryFn: () => getQuotationUploadImg(),
  });
};

const useAddGstDetails = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({data}: {data: subEventCost}) =>
      AddGstquotationdetail(eventId, data),
    onSuccess: () => {
      toast.success('GST Added Successfully');
      queryClient.invalidateQueries({queryKey: [QUATATION_KEYS.GET_QUATATION]});
      queryClient.invalidateQueries({queryKey: ['quotation']});
    },
    onError: () => {
      toast.error('Failed To Add GST');
    },
  });
};

export {
  useAddGstDetails,
  useUpdateQuatation,
  useGetQuatation,
  useCreateQuotationDesign,
  useGetQuatationImage,
  useGetQuatationUploadImg,
};
