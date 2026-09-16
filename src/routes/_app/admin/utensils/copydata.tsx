import {createFileRoute} from '@tanstack/react-router';
import CopyDataUtensils from './../../../../components/Utensils/CopyDataUtensils';

export const Route = createFileRoute('/_app/admin/utensils/copydata')({
  component: CopyDataUtensils,
});
