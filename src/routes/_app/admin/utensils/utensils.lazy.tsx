import UtensilManagement from '@/pages/UtensilManagement';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/admin/utensils/utensils')({
  component: UtensilManagement,
});
