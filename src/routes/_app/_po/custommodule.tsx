import Custommodule from '@/components/POModule/Custommodule';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/custommodule')({
  component: Custommodule,
});
