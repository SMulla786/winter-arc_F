import EventUtensilPage from '@/pages/EventUtensilPage';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_event/event-utensil')({
  component: EventUtensilPage,
});
