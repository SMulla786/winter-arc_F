import UpdateEventPo from '@/components/POModule/UpdateEventPo';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/updatevent/$id')({
  component: UpdateEventPo,
});
