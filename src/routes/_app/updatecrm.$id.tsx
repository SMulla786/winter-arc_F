import {createFileRoute} from '@tanstack/react-router';
import UpdateCRM from '@/components/CRM/UpdateCRM';

export const Route = createFileRoute('/_app/updatecrm/$id')({
  component: UpdateCRM,
});
