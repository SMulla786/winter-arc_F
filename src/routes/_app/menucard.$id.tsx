import MenuCard from '@/components/Event/MenuCard';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/menucard/$id')({
  component: MenuCard,
});
