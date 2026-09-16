import AddDisplayVender from '@/components/FoodVender/AddDisplayVender';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/adddisplayvender')({
  component: AddDisplayVender,
});
