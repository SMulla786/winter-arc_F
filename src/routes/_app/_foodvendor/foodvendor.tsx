import FoodVender from '@/components/FoodVender/FoodVender';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_foodvendor/foodvendor')({
  component: () => <FoodVender />,
});
