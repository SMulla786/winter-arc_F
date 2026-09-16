import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

type DisplayEventHistoryPayload = {
  eventId: string;
  vendorId: string;
};

const getDisplayEventHistory = async (payload: DisplayEventHistoryPayload) => {
  const {eventId, vendorId} = payload;

  const response = await api.post(`/cateror/display/history/event/${eventId}`, {
    vendorId, // 👈 payload in body
  });

  return response.data;
};

export const useGetDisplayEventHistory = (
  payload: DisplayEventHistoryPayload | null,
) => {
  return useQuery({
    queryKey: ['displayEventHistory', payload?.eventId, payload?.vendorId],
    queryFn: () => getDisplayEventHistory(payload!),
    enabled: !!payload?.eventId && !!payload?.vendorId, // ✅ VERY IMPORTANT
  });
};
