import {DisposalManagement} from '@/pages';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/disposals/disposal')({
  component: DisposalManagement,
});
