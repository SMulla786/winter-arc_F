import CostAnalysisDashboard from '@/components/AccountAnalysis/AccountAnalysis';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/accountanalysis')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CostAnalysisDashboard />;
}
