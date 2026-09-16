import CreateManager from '@/components/ManagerPost/CreateDressCode';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_managerpost/managerpost')({
  component: CreateManager,
});
