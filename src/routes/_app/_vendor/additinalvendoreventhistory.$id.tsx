import AdditionalVendorEventHistory from '@/components/FoodVender/AdditionalVendorEventHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_vendor/additinalvendoreventhistory/$id',
)({
  component: () => <AdditionalVendorEventHistory />,
});
