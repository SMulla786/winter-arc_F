import MenPowerManagement from '@/pages/MenPowermanagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/menpowermanagement')({
  component: MenPowerManagement,
});
