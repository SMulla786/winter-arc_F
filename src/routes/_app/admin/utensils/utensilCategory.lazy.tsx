import UtensilCategoryManagement from '@/pages/UtensilCategoryManagement';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute(
  '/_app/admin/utensils/utensilCategory',
)({
  component: UtensilCategoryManagement,
});
