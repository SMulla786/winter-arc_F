import ExternalVendorLayout from '@/layouts/ExternalVendorLayout';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_vendorRegister')({
  component: ExternalVendorLayout,
});
