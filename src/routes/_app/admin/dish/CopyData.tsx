import CopyData from '@/pages/CopyData';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/dish/CopyData')({
  component: CopyData,
});
