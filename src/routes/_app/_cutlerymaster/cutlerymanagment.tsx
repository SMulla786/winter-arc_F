import CutleryCatManagment from '@/components/CutelryMaster/CutleryCatManagment';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_cutlerymaster/cutlerymanagment')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CutleryCatManagment />;
}
