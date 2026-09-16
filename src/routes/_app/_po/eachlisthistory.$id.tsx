import EachRawListHistory from '@/components/POModule/EachRawListHistory';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_po/eachlisthistory/$id')({
  component: () => <EachRawListHistory />,
});
