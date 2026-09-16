import CreateClient from '@/components/client/CreateClient';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_crm/addclient')({
  component: CreateClient,
});
