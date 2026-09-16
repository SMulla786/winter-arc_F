// import AddPackage from '@/pages/AddPackage';
import DisplayPackage from '@/pages/DisplayPackage';
import PackageManagement from '@/pages/PackageManagment';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/packages/displaypackage')({
  component: PackageManagement,
});
