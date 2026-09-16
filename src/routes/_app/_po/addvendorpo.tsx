import AddVendorPo from '@/components/POModule/AddVendorPo';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/addvendorpo')({
  component: AddVendorPo,
});
