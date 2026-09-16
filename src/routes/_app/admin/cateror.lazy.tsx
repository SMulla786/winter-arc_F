import {CatererManagement} from '@/pages';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/admin/cateror')({
  component: CatererManagement,
});
