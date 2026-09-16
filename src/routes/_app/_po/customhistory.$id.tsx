import CustomHistory from '@/components/POModule/CustomRMHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/customhistory/$id')({
  component: () => <CustomHistory />,
});
