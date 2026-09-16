import QuatationPage from '@/pages/Quotation';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_quatation/quatation')({
  component: QuatationPage,
});
