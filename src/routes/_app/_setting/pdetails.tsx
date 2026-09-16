import PaymentDetails from '@/components/CaterorSetting/PaymentDetails';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_setting/pdetails')({
  component: PaymentDetails,
});
