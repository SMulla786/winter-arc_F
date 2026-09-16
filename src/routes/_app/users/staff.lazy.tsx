import {StaffManagement} from '@/pages';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/users/staff')({
  component: StaffManagement,
});
