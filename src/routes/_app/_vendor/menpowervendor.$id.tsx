import {createFileRoute} from '@tanstack/react-router';
import ManPowerVendorHistory from '@/components/Vendor/VendorInfo';

export const Route = createFileRoute('/_app/_vendor/menpowervendor/$id')({
  component: ManPowerVendorHistory,
});
