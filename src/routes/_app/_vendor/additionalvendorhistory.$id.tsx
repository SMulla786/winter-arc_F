import AdditionalVendorHistory from '@/components/FoodVender/AdditionalVendorHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_vendor/additionalvendorhistory/$id',
)({
  component: AdditionalVendorHistory,
});
