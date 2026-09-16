import {createFileRoute} from '@tanstack/react-router';
import DetailsPage from '@/pages/DetailsPage';

export const Route = createFileRoute('/_app/_setting/detail')({
  component: DetailsPage,
});
