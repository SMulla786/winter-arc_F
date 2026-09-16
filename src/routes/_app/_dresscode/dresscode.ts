import CreateDressCode from '@/components/ManagerPost/CreateDressCode';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dresscode/dresscode')({
  component: CreateDressCode,
});
