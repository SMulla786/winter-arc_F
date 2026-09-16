import TermCondition from '@/components/CaterorSetting/TermCondition';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_setting/tandc')({
  component: TermCondition,
});
