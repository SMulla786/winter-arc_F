import ModuleWise from '@/components/moduleswise/ModuleWise';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_models/modelswise')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ModuleWise />;
}
