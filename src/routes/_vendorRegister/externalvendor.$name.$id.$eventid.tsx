import {createFileRoute} from '@tanstack/react-router';
import ExternalVendor from '@/components/Vendor/ExternalVendor';

export const Route = createFileRoute(
  '/_vendorRegister/externalvendor/$name/$id/$eventid',
)({
  component: () => <ExternalVendor />,
});
