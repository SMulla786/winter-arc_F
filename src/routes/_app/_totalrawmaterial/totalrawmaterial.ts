import TotalRawMAterialOrder from '@/components/POModule/TotalRawMAterialOrder';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_totalrawmaterial/totalrawmaterial',
)({
  component: TotalRawMAterialOrder,
});
