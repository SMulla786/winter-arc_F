import AdditionalVendors from '@/components/FoodVender/Additionalvendors';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/additionalvendor')({
  component: AdditionalVendors,
});
