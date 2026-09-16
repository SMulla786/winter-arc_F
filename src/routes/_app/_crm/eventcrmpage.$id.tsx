import MainEventCRMPage from '@/components/CRM/EventsPageCRM';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_crm/eventcrmpage/$id')({
  component: () => <MainEventCRMPage />,
});
