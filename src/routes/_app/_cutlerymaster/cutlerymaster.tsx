import CutleryMaster from '@/components/CutelryMaster/CutelryMaster';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_cutlerymaster/cutlerymaster')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CutleryMaster />;
}
