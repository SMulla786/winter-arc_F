// hooks/useClientCelebrations.ts
import {useMemo} from 'react';

type Client = {
  id: string;
  fullname: string;
  name: string;
  phoneNumber: string;
  address: string;
  caste: string;
  pendingAmount: string;
  events: string | number;
  birthday?: string | null;
  anniversary?: string | null;
  secondaryPhoneNumber?: string;
  email?: string;
};

export const useClientCelebrations = (clients: Client[]) => {
  // Format a date as YYYY-MM-DD
  const formatDate = (dateString?: string | null): string | undefined => {
    if (!dateString) return undefined;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return undefined;
      }

      // Handle invalid years (like "0002" from your data)
      const year = date.getFullYear();
      if (year < 1000 || year > 2100) {
        console.warn('Invalid year in date:', dateString, year);
        return undefined;
      }

      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return undefined;
    }
  };

  // Check if the given date's month/day match today's (for current year)
  const isToday = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;

      const today = new Date();

      // For birthdays/anniversaries, we compare month and day only
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
      );
    } catch (error) {
      console.error('Error checking if today:', dateStr, error);
      return false;
    }
  };

  // Check if the date is upcoming (within next 7 days) for current year
  const isUpcoming = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);

      // Create comparison date with current year but same month/day
      const comparisonDate = new Date(date);
      comparisonDate.setFullYear(today.getFullYear());

      return comparisonDate >= today && comparisonDate <= nextWeek;
    } catch (error) {
      console.error('Error checking if upcoming:', dateStr, error);
      return false;
    }
  };

  // Filter clients with valid birthdays or anniversaries
  const clientsWithCelebrations = useMemo(() => {
    return clients.filter((client) => {
      const hasValidBirthday = client.birthday && client.birthday !== '-';
      const hasValidAnniversary =
        client.anniversary && client.anniversary !== '-';

      return hasValidBirthday || hasValidAnniversary;
    });
  }, [clients]);

  // Filter clients with today's celebrations
  const clientsWithTodayCelebrations = useMemo(() => {
    return clientsWithCelebrations.filter((client) => {
      const isBirthdayToday = client.birthday && isToday(client.birthday);
      const isAnniversaryToday =
        client.anniversary && isToday(client.anniversary);

      return isBirthdayToday || isAnniversaryToday;
    });
  }, [clientsWithCelebrations]);

  // Filter clients with upcoming celebrations (next 7 days)
  const clientsWithUpcomingCelebrations = useMemo(() => {
    return clientsWithCelebrations.filter((client) => {
      const isBirthdayUpcoming = client.birthday && isUpcoming(client.birthday);
      const isAnniversaryUpcoming =
        client.anniversary && isUpcoming(client.anniversary);

      return isBirthdayUpcoming || isAnniversaryUpcoming;
    });
  }, [clientsWithCelebrations]);

  return {
    clientsWithCelebrations,
    clientsWithTodayCelebrations,
    clientsWithUpcomingCelebrations,
    isToday,
    isUpcoming,
    formatDate,
  };
};
