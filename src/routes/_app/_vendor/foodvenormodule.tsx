import FoodVenderModule from '@/components/FoodVender/FoodVenderModule';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vendor/foodvenormodule')({
  component: FoodVenderModule,
});
