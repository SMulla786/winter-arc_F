import {VendorManagement} from '@/pages';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/users/vendor')({
  component: VendorManagement,
});
