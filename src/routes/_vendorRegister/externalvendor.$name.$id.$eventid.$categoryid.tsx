import ExternalVendor from '@/components/Vendor/ExternalVendor';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_vendorRegister/externalvendor/$name/$id/$eventid/$categoryid',
)({
  component: () => <ExternalVendor />,
});
