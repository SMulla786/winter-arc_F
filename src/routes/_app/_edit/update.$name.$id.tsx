import Update from '@/components/Update/Update';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_edit/update/$name/$id')({
  component: Update,
});
