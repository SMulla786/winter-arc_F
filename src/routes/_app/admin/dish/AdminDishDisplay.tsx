import DisplayDish from '@/components/Dish/DisplayDish';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/dish/AdminDishDisplay')({
  component: DisplayDish,
});
