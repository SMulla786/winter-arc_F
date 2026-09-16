import MainPoPage from '@/components/Event/subEvent/MainPoPage';
import EventPoAndCustomPo from '@/components/POModule/EventPoAndCustomPo';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/eventpo/$id')({
  component: EventPoAndCustomPo,
});
