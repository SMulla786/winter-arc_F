import UtensilsInventory from '@/components/CaterorUtensils/UtensilsInventory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/utensilsinventory')({
  component: UtensilsInventory,
});
