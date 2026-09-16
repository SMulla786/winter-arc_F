import DisplayPackage from '@/pages/DisplayPackage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/packages/displayPackageTable')({
  component: DisplayPackage,
});
