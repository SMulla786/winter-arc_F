import FoodVendorHistory from '@/components/FoodVender/FoodVendorHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_foodvendor/foodvendorhistory/$id')(
  {
    component: () => <FoodVendorHistory />,
  },
);
