import {createFileRoute} from '@tanstack/react-router';
import UpdateVendorManpower from '@/pages/UpdateVendorManpower';

export const Route = createFileRoute('/_app/updatevendor/$id')({
  component: UpdateVendorManpower,
});
