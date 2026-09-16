import SubEventForm from '@/components/Event/SubEvent';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_event/subEvent')({
  component: SubEventForm,
});
