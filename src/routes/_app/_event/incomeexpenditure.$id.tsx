import MainIncomeExpense from '@/pages/MainIncomeExpense';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/incomeexpenditure/$id')({
  component: MainIncomeExpense,
});
