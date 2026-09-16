import RawMaterialList from '@/components/Event/RawMaterialList';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_event/raw-material-list')({
  component: RawMaterialList,
});
