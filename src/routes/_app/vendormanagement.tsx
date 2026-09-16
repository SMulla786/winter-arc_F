import ManageVendor from '@/pages/ManageVendor';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/vendormanagement')({
  component: ManageVendor,
});
