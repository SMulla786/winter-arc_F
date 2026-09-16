import UploadExcel from '@/components/Dish/UploadExcel';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_dish/uploadexcel')({
  component: () => <UploadExcel />,
});
