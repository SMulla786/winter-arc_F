import UpdateCustomerList from '@/components/Customer/UpdateCustomerList';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/updatecustomer/$id')({
  component: UpdateCustomerList,
});
