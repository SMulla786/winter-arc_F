import InventoryPage from '@/pages/InventoryPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dish/inventorydisplay')({
  component: InventoryPage,
});