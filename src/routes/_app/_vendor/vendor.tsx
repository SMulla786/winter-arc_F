import VendorPage from '@/pages/VendorPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/vendor')({
  component: VendorPage,
});
