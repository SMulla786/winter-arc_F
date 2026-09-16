import AddPriceRawmaterial from '@/components/Dish/AddPriceRawmaterial';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/users/_addrawmaterialprice/rawprice',
)({
  component: AddPriceRawmaterial,
});
