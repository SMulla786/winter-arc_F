import WestageReport from '@/pages/WestageReport';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_reports/westagereport')({
  component: () => <WestageReport />,
});
