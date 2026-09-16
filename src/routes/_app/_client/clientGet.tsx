import {createFileRoute} from '@tanstack/react-router';
import ClientGet from './../../../components/client/ClientGet';

export const Route = createFileRoute('/_app/_client/clientGet')({
  component: ClientGet,
});
