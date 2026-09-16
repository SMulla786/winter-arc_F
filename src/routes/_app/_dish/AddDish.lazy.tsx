import DishMasterManagement from '@/components/Dish/NewDishMaster/DishMasterManagement';
import MultipleDishAdd from '@/components/Dish/NewDishMaster/MultipleDishAdd';
import NewDishMaster from '@/components/Dish/NewDishMaster/NewDishMaster';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_dish/AddDish')({
  // component: DishMasterManagementCateror,
  // component: NewDishMaster,
  // component: MultipleDishAdd,
  component: DishMasterManagement,
});
