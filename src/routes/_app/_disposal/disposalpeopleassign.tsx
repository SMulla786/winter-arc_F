import DisposalPeopleAssign from '@/components/Disposal/DisposalPeopleAssign';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_disposal/disposalpeopleassign')({
  component: DisposalPeopleAssign,
});
