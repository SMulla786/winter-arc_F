import DisposalCategoryManagement from '@/pages/DisposalCategoryManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/disposals/disposalcategory')({
  component: DisposalCategoryManagement,
});
