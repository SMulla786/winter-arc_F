import {createFileRoute} from '@tanstack/react-router';
import CustomExternalVendor from '@/components/Vendor/ExVendor/CustomExternalVendor';

export const Route = createFileRoute('/customvendor_tender/$name/$id')({
  component: () => <CustomExternalVendor />,
});
