import {createFileRoute} from '@tanstack/react-router';
import AdditionalVendorHistoryShow from '@/components/FoodVender/AdditionalVendorHistoryShow';

export const Route = createFileRoute(
  '/_app/_vendor/additionalvendorhistoryshow/$id',
)({
  component: AdditionalVendorHistoryShow,
});
