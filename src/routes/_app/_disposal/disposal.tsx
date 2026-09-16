import DisposalManagementCat from '@/pages/DisposalManagementCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_disposal/disposal')({
  component: DisposalManagementCat,
});
