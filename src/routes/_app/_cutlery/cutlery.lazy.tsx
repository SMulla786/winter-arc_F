import CutleryManagement from '@/components/Cutlery/CutleryManagement';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/_cutlery/cutlery')({
  component: CutleryManagement,
});
