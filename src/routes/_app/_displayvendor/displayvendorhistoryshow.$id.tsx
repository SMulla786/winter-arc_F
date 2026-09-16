import DisplayVendorHistoryShow from '@/components/DisplayVendor/DisplayVendorHistoryShow';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_displayvendor/displayvendorhistoryshow/$id',
)({
  component: DisplayVendorHistoryShow,
});
