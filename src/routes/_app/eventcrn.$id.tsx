import UpdateEventCRM from '@/components/CRM/UpdateEventCRM';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/eventcrn/$id')({
  component: UpdateEventCRM,
});
