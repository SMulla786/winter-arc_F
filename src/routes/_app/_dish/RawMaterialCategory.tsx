import RawMaterialCategoryCat from '@/pages/RawMaterialCategoryCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dish/RawMaterialCategory')({
  component: RawMaterialCategoryCat,
});
