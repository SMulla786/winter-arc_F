import IncomeExpenditureManagement from '@/pages/IncomeExpenditureManagement';
import IncomeHeadManagement from '@/pages/IncomeHeadManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/incomeexpenditure')({
  component: () => (
    <>
      {/* <IncomeHeadManagement /> */}
      <IncomeExpenditureManagement />
    </>
  ),
});
