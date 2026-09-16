import AddRawMaterialCat from '@/components/Dish/AddRawMaterialCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/addrawmaterialcat')({
  component: AddRawMaterialCat,
});
