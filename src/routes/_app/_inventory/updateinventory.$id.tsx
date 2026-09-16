import UpdateInventory from '@/components/Inventory/UpdateInventory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_inventory/updateinventory/$id')({
  component: UpdateInventory,
});
