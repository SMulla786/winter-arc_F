import MaharajById from '@/components/Maharaj/MaharajById';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/maharaj/maharajdata/$id')({
  component: MaharajById,
});
