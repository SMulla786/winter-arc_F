import CopyDataDisposal from '@/components/Disposal/CopyDataDisposal';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/disposals/copydatadisposal')({
  component: CopyDataDisposal,
});
