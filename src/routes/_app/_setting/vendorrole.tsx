import VendorRole from '@/components/CaterorSetting/VendorRole';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_setting/vendorrole')({
  component: VendorRole,
});
