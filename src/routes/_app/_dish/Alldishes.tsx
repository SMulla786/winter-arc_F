import DisplayDishCat from '@/components/Dish/DisplayDishCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dish/Alldishes')({
  component: DisplayDishCat,
});
