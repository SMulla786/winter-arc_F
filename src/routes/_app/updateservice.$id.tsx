import UpdateServicePage from '@/components/ManagerPost/UpdateServicePage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/updateservice/$id')({
  component: UpdateServicePage,
});
