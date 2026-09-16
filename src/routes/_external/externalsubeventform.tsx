import ExternalSubEventForm from '@/components/Event/ExternalSubEventForm';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_external/externalsubeventform')({
  component: () => <ExternalSubEventForm />,
});
