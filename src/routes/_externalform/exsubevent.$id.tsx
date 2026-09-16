import ExternalSubEventForm from '@/components/Event/ExternalSubEventForm';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_externalform/exsubevent/$id')({
  component: () => <ExternalSubEventForm />,
});
