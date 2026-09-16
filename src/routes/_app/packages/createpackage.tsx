import CreatePackage from '@/pages/CreatePackage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/packages/createpackage')({
  component: CreatePackage,
});
