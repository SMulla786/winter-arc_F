import FoodvendorEventHistory from '@/components/FoodVender/FoodvendorEventHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_foodvendor/foodvendoreventhisory/$id',
)({
  component: () => <FoodvendorEventHistory />,
});
