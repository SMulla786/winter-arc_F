import UtensilManagementCateror from '@/pages/UtensilManagementCateror';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_utensils/utensils')({
  component: UtensilManagementCateror,
});
