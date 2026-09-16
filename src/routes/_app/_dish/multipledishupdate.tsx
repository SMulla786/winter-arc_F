import MultipleDishUpdate from '@/components/NewMultipleDish/MultipleDishUpdate';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dish/multipledishupdate')({
  component: MultipleDishUpdate,
});
