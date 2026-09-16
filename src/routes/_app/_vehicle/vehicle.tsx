import VehicleList from '@/pages/VehicleList';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_vehicle/vehicle')({
  component: VehicleList,
});
