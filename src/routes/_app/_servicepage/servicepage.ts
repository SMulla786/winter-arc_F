import {createFileRoute} from '@tanstack/react-router';
import ServicePage from '@/components/ManagerPost/ServicePage';

export const Route = createFileRoute('/_app/_servicepage/servicepage')({
  component: ServicePage,
});
