import DataEntryPageAdmin from '@/components/Dish/NewDishMasterAdmin/DataEntryPageAdmin';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dataentry/dataentry')({
  component: DataEntryPageAdmin,
});
