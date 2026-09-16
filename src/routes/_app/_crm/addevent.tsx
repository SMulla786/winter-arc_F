import EventModal from '@/components/Event/EventModal';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_crm/addevent')({
  component: EventModal,
});
