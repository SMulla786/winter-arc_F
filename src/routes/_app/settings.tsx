import SettingManagement from '@/pages/SettingMangement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings')({
  component: () => <SettingManagement />,
});
