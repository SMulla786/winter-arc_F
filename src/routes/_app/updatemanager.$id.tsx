import UpdateManager from '@/components/ManagerPost/UpdateManager';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/updatemanager/$id')({
  component: UpdateManager,
});
