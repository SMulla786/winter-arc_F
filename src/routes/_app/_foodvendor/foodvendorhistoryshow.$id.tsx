import FoodVendorHistoryShow from '@/components/FoodVender/FoodVendorHistoryShow';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_foodvendor/foodvendorhistoryshow/$id',
)({
  component: () => <FoodVendorHistoryShow />,
});
