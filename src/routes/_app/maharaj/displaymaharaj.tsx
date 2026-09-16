import DisplayMaharaj from '@/components/Maharaj/DisplayMaharaj';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/maharaj/displaymaharaj')({
  component: DisplayMaharaj,
});
