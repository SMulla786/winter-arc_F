import EventManagement from '@/components/Event/EventManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/events/$id')({
  component: EventManagement,
});
