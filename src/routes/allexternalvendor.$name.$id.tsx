import ExternalVendorForAllRaw from '@/components/Vendor/ExternalVendorForAllRaw';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/allexternalvendor/$name/$id')({
  component: () => <ExternalVendorForAllRaw />,
});
