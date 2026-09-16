import EventCostAnalysisDashboard from '@/components/Analysis/EventCostAnalysisDashboard';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/analysis')({
  component: EventCostAnalysisDashboard,
});
