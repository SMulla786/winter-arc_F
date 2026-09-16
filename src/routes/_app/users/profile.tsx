import ProfileManagent from '@/pages/profile/ProfileManagent';
import ProfileManagement from '@/pages/ProfileManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/profile')({
  component: () => <ProfileManagent />,
});
