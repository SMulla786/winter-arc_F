import CounterManagement from '@/components/Counter/CounterManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_counter/countermanagement')({
  component: CounterManagement,
});
