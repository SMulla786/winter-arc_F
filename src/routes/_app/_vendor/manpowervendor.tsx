import VendorManagementPage from '@/pages/VendorManagementPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/manpowervendor')({
  component: VendorManagementPage,
});
