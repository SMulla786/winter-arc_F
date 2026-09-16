import {getCosting, getSubEventName} from '@/lib/api/cateror/costing';
import {useQuery} from '@tanstack/react-query';
// const useGetCostingData = (subEventId: string) => {
//   return useQuery({
//     queryKey: ['costingData', subEventId],
//     queryFn: () => getCosting(subEventId),
//   });
// };

const useGetCostingData = (subEventId: string) => {
  return useQuery({
    queryKey: ['costingData', subEventId],
    queryFn: () => getCosting(subEventId),
  });
};

const useGetSubEventName = (eventId: string) => {
  return useQuery({
    queryKey: ['subeventName', eventId],
    queryFn: () => getSubEventName(eventId),
  });
};

export {useGetCostingData, useGetSubEventName};
