import PackageUpdate from '@/components/Package/PackageUpdate';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/packages/updatepackage/$id')({
  component: PackageUpdate,
});
