import CustomRM from '@/components/POModule/CustomRM';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/customrawmaterial')({
  component: () => <CustomRM />,
});
