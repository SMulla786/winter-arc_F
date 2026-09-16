import UtensilsReport from '@/pages/UtensilsReport';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_reports/utensilsreport')({
  component: () => <UtensilsReport />,
});
