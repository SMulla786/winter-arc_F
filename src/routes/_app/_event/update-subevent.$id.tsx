import UpdateSubEvent from '@/components/Event/UpdateSubEvent';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/update-subevent/$id')({
  component: UpdateSubEvent,
});
