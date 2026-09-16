import ProcessManagementCat from '@/pages/ProcessManagementCat';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_dish/process')({
  component: ProcessManagementCat,
});
