import AdditionalCategory from '@/components/FoodVender/AdditionalvendorCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/additionalvendorcat')({
  component: AdditionalCategory,
});
