import DisposalInventory from '@/components/CaterorDisposal/DisposalInventory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/disposalinventory')({
  component: DisposalInventory,
});
