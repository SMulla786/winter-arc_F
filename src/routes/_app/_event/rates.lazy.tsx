import Rates from '@/components/Event/Rates';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_event/rates')({
  component: Rates,
});
