import {createFileRoute} from '@tanstack/react-router';
import CreateBanquet from '@/components/Banquet/CreateBanquet';

export const Route = createFileRoute('/_app/_banquet/createbanquet')({
  component: CreateBanquet,
});
