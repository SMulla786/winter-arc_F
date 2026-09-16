import UpdateBanquet from '@/components/Banquet/UpdateBanquet';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_banquet/updatebanquet/$id/$name')({
  component: () => <UpdateBanquet />,
});
