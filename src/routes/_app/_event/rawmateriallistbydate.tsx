import RawMaterialList from '@/components/common/RawMaterialList';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/rawmateriallistbydate')({
  component: () => <RawMaterialList />,
});
