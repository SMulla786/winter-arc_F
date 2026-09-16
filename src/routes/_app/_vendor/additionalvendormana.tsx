import AdditionalVendorsManagement from '@/components/FoodVender/AdditionalVendorsManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/additionalvendormana')({
  component: AdditionalVendorsManagement,
});
