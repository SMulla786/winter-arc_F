import AdditionalvendorCat from '@/components/FoodVender/AdditionalvendorCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/additionalcat')({
  component: AdditionalvendorCat,
});
