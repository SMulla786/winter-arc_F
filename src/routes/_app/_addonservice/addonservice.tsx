import AddOnService from '@/components/AddOnService/AddOnService';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_addonservice/addonservice')({
  component: () => <AddOnService />,
});
