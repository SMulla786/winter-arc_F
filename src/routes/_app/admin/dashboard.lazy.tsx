import {Home} from '@/pages';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/admin/dashboard')({
  component: Home,
});
