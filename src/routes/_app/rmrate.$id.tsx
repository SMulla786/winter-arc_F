import {createFileRoute} from '@tanstack/react-router';
import RawMaterialRateCompare from '@/components/Event/RawMaterialRateCompare';

export const Route = createFileRoute('/_app/rmrate/$id')({
  component: RawMaterialRateCompare,
});
