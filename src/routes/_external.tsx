import {createFileRoute} from '@tanstack/react-router';
import ExternalLayout from '@/layouts/ExternalLayout';

export const Route = createFileRoute('/_external')({
  component: ExternalLayout,
});
