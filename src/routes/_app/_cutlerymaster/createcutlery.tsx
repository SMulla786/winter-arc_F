import CreateMasterCutlery from '@/components/CutelryMaster/CreateMasterCutlery';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_cutlerymaster/createcutlery')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateMasterCutlery />;
}
