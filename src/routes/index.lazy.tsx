import {Calendar} from '@/components/common';
import {createLazyFileRoute} from '@tanstack/react-router';
import LandingPage from '@/pages/LandingPage';

export const Route = createLazyFileRoute('/')({
  // component: Calendar,
  component: LandingPage,
});
