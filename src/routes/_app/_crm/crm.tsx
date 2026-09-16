import AddCustomerCRM from '@/components/CRM/AddCustomerCRM';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_crm/crm')({
  component: AddCustomerCRM,
});
