import {getIncomeAndExpenditure} from '@/lib/api/cateror/income&expenditure';
import {useQuery} from '@tanstack/react-query';

export const useGetIncomeAndExpenditure = (id: string) => {
  return useQuery({
    queryKey: ['cateror', id],
    queryFn: () => getIncomeAndExpenditure(id),
  });
};
