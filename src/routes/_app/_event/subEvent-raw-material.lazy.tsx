import SubEventRawMaterialList from '@/components/Event/SubEventRawMaterialList';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_event/subEvent-raw-material')({
  component: SubEventRawMaterialList,
});
