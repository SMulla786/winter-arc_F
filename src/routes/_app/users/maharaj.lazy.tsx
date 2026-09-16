import {MaharajManagement} from '@/pages';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/users/maharaj')({
  component: MaharajManagement,
});
