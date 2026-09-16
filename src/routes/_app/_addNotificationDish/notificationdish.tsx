import DisplayNotificationDishes from '@/components/NotificatioinDishes/DisplayNotificationDishes';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_addNotificationDish/notificationdish',
)({
  component: DisplayNotificationDishes,
});
