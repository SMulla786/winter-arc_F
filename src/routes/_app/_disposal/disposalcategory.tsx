import DisposalCategoryManagementCat from '@/pages/DisposalCategoryManagementCat';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_disposal/disposalcategory')({
  component: DisposalCategoryManagementCat,
});
