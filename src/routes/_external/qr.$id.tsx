import ExternalLayout from '@/layouts/ExternalLayout';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_external/qr/$id')({
  component: () => ExternalLayout,
});
