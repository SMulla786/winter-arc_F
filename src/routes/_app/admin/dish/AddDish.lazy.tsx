import NewDishMasterAdmin from '@/components/Dish/NewDishMasterAdmin/NewDishMasterAdmin';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/admin/dish/AddDish')({
  // component: DishMasterManagement,
  component: NewDishMasterAdmin,
});
