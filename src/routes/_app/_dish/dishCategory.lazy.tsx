import DishCategoryCateror from '@/pages/DishCategoryCateror';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_dish/dishCategory')({
  component: DishCategoryCateror,
});
