import {AfterEventPage} from '@/pages';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/after-event')({
  component: AfterEventPage,
});
