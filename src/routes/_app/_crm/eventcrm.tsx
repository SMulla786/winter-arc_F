import EventCrmADDisplay from '@/pages/EventCrmADDDisplay';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_crm/eventcrm')({
  component: EventCrmADDisplay,
});
