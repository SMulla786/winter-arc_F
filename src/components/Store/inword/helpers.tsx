import {addMinutes, parseISO, format} from 'date-fns';

export const toIST = (utc: string) => addMinutes(parseISO(utc), 330);
export const formatIST = (utc: string, f = 'dd MMM yyyy, hh:mm a') =>
  format(toIST(utc), f);
export const formatQuantityDisplay = (quantity?: number) =>
  quantity === undefined || quantity === null
    ? ''
    : parseFloat((quantity as number).toFixed(1)).toString();

export const formatTimeDisplay = (timeString?: string) => {
  if (!timeString) return '-';
  try {
    if (timeString.includes('T'))
      return new Date(timeString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    if (timeString.includes(':')) {
      const [h, m] = timeString.split(':');
      const hh = parseInt(h, 10);
      const ampm = hh >= 12 ? 'PM' : 'AM';
      return `${hh % 12 || 12}:${m} ${ampm}`;
    }
    return timeString;
  } catch {
    return '-';
  }
};

export const formatDateDisplay = (s?: string) => {
  if (!s) return '-';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
};
