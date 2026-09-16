import {addMinutes, parseISO, format} from 'date-fns';

export const toIST = (utc: string) => addMinutes(parseISO(utc), 330);
export const formatIST = (utc: string, f = 'dd MMM yyyy, hh:mm a') =>
  format(toIST(utc), f);
