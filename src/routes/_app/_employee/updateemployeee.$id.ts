import UpdateEmp from '@/components/Employeepanel/UpdateEmp';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_employee/updateemployeee/$id')({
  component: UpdateEmp,
});
