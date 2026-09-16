import Event from '@/components/Event/Event';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_event/event')({
  component: Event,
});
