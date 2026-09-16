import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

type DisplayManpowerEventHistoryPayload = {
  eventId: string;
  vendorId: string;
};
const getDisplayFoodvendorEventHistory = async (
  payload: DisplayManpowerEventHistoryPayload,
) => {
  const {eventId, vendorId} = payload;

  const response = await api.post(
    `/cateror/vendors/food/history/event/${eventId}`,
    {
      vendorId, // 👈 payload in body
    },
  );

  return response.data;
};

export const useGetDisplayFoodvendorEventHistory = (
  payload: DisplayManpowerEventHistoryPayload | null,
) => {
  return useQuery({
    queryKey: ['displayFoodvendorHistory', payload?.eventId, payload?.vendorId],
    queryFn: () => getDisplayFoodvendorEventHistory(payload!),
    enabled: !!payload?.eventId && !!payload?.vendorId, // ✅ VERY IMPORTANT
  });
};
