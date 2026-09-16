import {createFileRoute} from '@tanstack/react-router';
import EmployeeSetting from '@/components/Employeepanel/EmployeeSetting';

export const Route = createFileRoute('/_app/_employee/employeesetting')({
  component: EmployeeSetting,
});
