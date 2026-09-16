import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

type DisplayEventHistoryPayload = {
  eventId: string;
  vendorId: string;
};

const getAdditionalVendorEventHistory = async (
  payload: DisplayEventHistoryPayload,
) => {
  const {eventId, vendorId} = payload;

  const response = await api.post(
    `/cateror/additional/eventWise/history/${eventId}`,
    {
      vendorId, // 👈 payload in body
    },
  );

  return response.data;
};

export const useGetDisplayAdditionalVendorEventHistory = (
  payload: DisplayEventHistoryPayload | null,
) => {
  return useQuery({
    queryKey: [
      'displayAdditionalVendorEventHistory',
      payload?.eventId,
      payload?.vendorId,
    ],
    queryFn: () => getAdditionalVendorEventHistory(payload!),
    enabled: !!payload?.eventId && !!payload?.vendorId, // ✅ VERY IMPORTANT
  });
};
