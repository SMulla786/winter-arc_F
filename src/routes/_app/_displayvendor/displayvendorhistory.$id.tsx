import DisplayVendorHistory from '@/components/DisplayVendor/DisplayVendorHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_displayvendor/displayvendorhistory/$id',
)({
  component: DisplayVendorHistory,
});
