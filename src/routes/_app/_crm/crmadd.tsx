import EventCRM from '@/components/CRM/EventCRM';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_crm/crmadd')({
  component: EventCRM,
});
