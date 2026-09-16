import {createFileRoute} from '@tanstack/react-router';
import Store from '@/components/Store/store';
import StoreWrapper from '@/components/Store/StoreWrapper';

export const Route = createFileRoute('/_app/_store/store')({
  component: () => <StoreWrapper />,
});
