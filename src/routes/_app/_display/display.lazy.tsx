import {createLazyFileRoute} from '@tanstack/react-router';
import DisplayManagement from '@/components/Display/DisplayManagement';

export const Route = createLazyFileRoute('/_app/_display/display')({
  component: DisplayManagement,
});
