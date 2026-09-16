import PackagebyId from '@/pages/PackagebyId';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/packages/packagedata/$id')({
  component: PackagebyId,
});
