import ClientEventHistory from '@/components/client/ClientEventHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_client/clienthistory/$id')({
  component: () => <ClientEventHistory />,
});
