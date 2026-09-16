import EventPoModule from '@/components/POModule/EventPoModule';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/pomodule')({
  component: EventPoModule,
});
