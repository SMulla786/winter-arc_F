import UpdateMaharaj from '@/components/Maharaj/UpdateMaharaj';
import {createLazyFileRoute} from '@tanstack/react-router';

// update maharaj page

export const Route = createLazyFileRoute('/_app/users/updatemaharaj')({
  component: UpdateMaharaj,
});
