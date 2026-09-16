import UpdateDisplayVendorForm from '@/components/DisplayVendor/UpdateDisplayVendorForm';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_displayvendor/updatedisplayvendor/$id',
)({
  component: () => <UpdateDisplayVendorForm />,
});
