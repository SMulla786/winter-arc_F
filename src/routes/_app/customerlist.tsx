import CustomerManagement from '@/pages/CustomerManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/customerlist')({
  component: () => <CustomerManagement />,
});
