import UtensilCategoryManagementCat from '@/pages/UtensilCategoryManagementCat';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_utensils/utensilCategory')({
  component: UtensilCategoryManagementCat,
});
