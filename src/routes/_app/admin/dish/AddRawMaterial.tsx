import AddRawMaterialPage from '@/pages/AddRawMaterial';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/dish/AddRawMaterial')({
  component: AddRawMaterialPage,
});
