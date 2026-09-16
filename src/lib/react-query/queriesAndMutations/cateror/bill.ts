import {useMutation, useQuery} from '@tanstack/react-query';
import {BILL_KEYS} from '../../queryKeys';
import {AddGstBill, getBill, getGstBill} from '@/lib/api/cateror/bill';
import {GstBillData} from '@/types/cateror';
import toast from 'react-hot-toast';
const useGetBill = (id: string) => {
  return useQuery({
    queryKey: [BILL_KEYS.GET_BILL],
    queryFn: () => getBill(id),
  });
};

const useAddGstBill = (eventId: string) => {
  const {refetch: refetchGST} = useGetGstBill(eventId);
  return useMutation({
    mutationFn: (data: GstBillData) => AddGstBill(eventId, data),
    onSuccess: () => {
      toast.success('Bill Added Successfully');
      refetchGST();
    },
    onError: () => {
      toast.error('Failed To Add Bill');
    },
  });
};

const useGetGstBill = (eventId: string) => {
  return useQuery({
    queryKey: ['getGstBill'],
    queryFn: () => getGstBill(eventId),
  });
};

export {useGetBill, useAddGstBill, useGetGstBill};
