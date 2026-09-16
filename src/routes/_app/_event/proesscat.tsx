import {createFileRoute} from '@tanstack/react-router';
import ProcessCat from '@/components/Process/ProcessCat';

export const Route = createFileRoute('/_app/_event/proesscat')({
  component: () => <ProcessCat />,
});
