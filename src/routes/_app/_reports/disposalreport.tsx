import DisposalReport from '@/pages/DisposalReport';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_reports/disposalreport')({
  component: () => <DisposalReport />,
});
