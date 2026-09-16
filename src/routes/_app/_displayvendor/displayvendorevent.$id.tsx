import DisplayEventHistory from '@/components/DisplayVendor/DisplayEventHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_displayvendor/displayvendorevent/$id',
)({
  component: () => <DisplayEventHistory />,
});
