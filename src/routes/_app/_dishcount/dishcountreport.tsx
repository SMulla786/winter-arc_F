import {createFileRoute} from '@tanstack/react-router';
import TotalDishCountList from '@/components/POModule/TotalDishCountList';
import DishCountPage from '@/components/POModule/DishCountPage';

export const Route = createFileRoute('/_app/_dishcount/dishcountreport')({
  component: DishCountPage,
});
