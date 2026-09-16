import UpdatedCustom from '@/components/POModule/UpdatedCustom';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/custom/$id')({
  component: UpdatedCustom,
});
