import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

type DisplayManpowerEventHistoryPayload = {
  eventId: string;
  vendorId: string;
};

const getDisplayManpowerEventHistory = async (
  payload: DisplayManpowerEventHistoryPayload,
) => {
  const {eventId, vendorId} = payload;

  const response = await api.post(
    `/cateror/vendors/manpower/history/event/${eventId}`,
    {
      vendorId, // 👈 payload in body
    },
  );

  return response.data;
};

export const useGetDisplayManpowerEventHistory = (
  payload: DisplayManpowerEventHistoryPayload | null,
) => {
  return useQuery({
    queryKey: ['displayEventHistory', payload?.eventId, payload?.vendorId],
    queryFn: () => getDisplayManpowerEventHistory(payload!),
    enabled: !!payload?.eventId && !!payload?.vendorId, // ✅ VERY IMPORTANT
  });
};
