import RawMaterialReport from '@/pages/RawMaterialReport';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_reports/rawmaterialreport')({
  component: () => <RawMaterialReport />,
});
