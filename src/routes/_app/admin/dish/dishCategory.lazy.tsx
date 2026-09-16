import DishCategoryPage from '@/pages/DishCategory';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/admin/dish/dishCategory')({
  component: DishCategoryPage,
});
