import {useQuery} from '@tanstack/react-query';
import {NOTIFICATION_QUERY_KEYS} from '../queryKeys';
import {
  getAmountNotification,
  getFollowupDate,
  getNotification,
  getNotificationById,
  getNotificationForTendor,
} from '@/lib/api/Notification';

const useGetNotification = () => {
  return useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.GET_NOTIFICATION],
    queryFn: () => getNotification(),
  });
};

const useGetNotificationById = (id: string) => {
  return useQuery({
    queryKey: ['notificationById', id],
    queryFn: () => getNotificationById(id),
  });
};
const useGetAmountNotificationById = (id: string) => {
  return useQuery({
    queryKey: ['notification'],
    queryFn: () => getAmountNotification(id),
  });
};
const useGetFollowupDate = () => {
  return useQuery({
    queryKey: ['followupDate'],
    queryFn: () => getFollowupDate(),
  });
};

const useGetNotificationForTendor = () => {
  return useQuery({
    queryKey: ['notificationForTendor'],
    queryFn: () => getNotificationForTendor(),
  });
};

export {
  useGetNotification,
  useGetNotificationById,
  useGetAmountNotificationById,
  useGetFollowupDate,
  useGetNotificationForTendor,
};
