import RawMaterialCategoryPage from '@/pages/RawMaterialCategory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/dish/RawMaterialCategory')({
  component: RawMaterialCategoryPage,
});
