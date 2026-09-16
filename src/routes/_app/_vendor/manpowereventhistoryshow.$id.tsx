import ManpowerEventHistoryShow from '@/pages/ManpowerEventHistoryShow';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/_vendor/manpowereventhistoryshow/$id',
)({
  component: () => <ManpowerEventHistoryShow />,
});
