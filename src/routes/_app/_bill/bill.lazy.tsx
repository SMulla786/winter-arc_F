import BillingPage from '@/pages/BillingPage';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_bill/bill')({
  component: BillingPage,
});
