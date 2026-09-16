import DishManagement from '@/pages/Dish';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_dish/dish')({
  component: DishManagement,
});
