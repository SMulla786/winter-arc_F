import ClientManagement from '@/pages/ClientManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_client/client')({
  component: ClientManagement,
});
