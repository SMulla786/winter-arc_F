import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {deleteTerms, getTerms} from '@/lib/api/cateror/termcondition';
import {
  addPaymentDetailsc,
  getPaymentDetails,
} from '@/lib/api/cateror/paymentdetails';
import {PaymentDetailsC} from '@/types/cateror';

export const useAddPaymentDetailsC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: PaymentDetailsC}) =>
      addPaymentDetailsc(id, data),
    onSuccess: () => {
      toast.success('Payment details added successfully');
      queryClient.invalidateQueries({
        queryKey: ['paymentDetails'], // Use appropriate query key
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add payment details');
    },
  });
};

export const useGetPaymentDetails = (id: string) => {
  return useQuery({
    queryKey: ['paymentDetails', id],
    queryFn: () => getPaymentDetails(id),
  });
};

export const useDeleteTerms = () => {
  return useMutation({
    mutationFn: deleteTerms,
    onSuccess: (res) => {
      toast.success('Process deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Process');
    },
  });
};
