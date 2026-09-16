import {createLazyFileRoute} from '@tanstack/react-router';
import DisplayVendorManagement from '@/components/DisplayVendor/DisplayVendorManagement';

export const Route = createLazyFileRoute('/_app/_displayvendor/displayvendor')({
  component: DisplayVendorManagement,
});
