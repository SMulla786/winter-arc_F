import AddManPower from '@/pages/AddManPower';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_setting/manpower')({
  component: AddManPower,
});
