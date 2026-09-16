import EventTypeMaster from '@/pages/EventType/EventTypeMaster';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_eventype/eventtypemaster')({
  component: EventTypeMaster,
});
