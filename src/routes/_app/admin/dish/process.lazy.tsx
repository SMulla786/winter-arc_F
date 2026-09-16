import {ProcessManagement} from '@/pages';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/admin/dish/process')({
  component: ProcessManagement,
});
