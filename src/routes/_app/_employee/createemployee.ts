import {createFileRoute} from '@tanstack/react-router';
import CreateEmployeManagment from '@/pages/CreateEmployee';

export const Route = createFileRoute('/_app/_employee/createemployee')({
  component: CreateEmployeManagment,
});
