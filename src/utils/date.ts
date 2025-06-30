import { format, isToday, isYesterday, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Hôm nay';
  }
  if (isYesterday(date)) {
    return 'Hôm qua';
  }
  return format(date, 'dd/MM/yyyy', { locale: vi });
};

export const formatDateShort = (date: Date): string => {
  return format(date, 'dd/MM', { locale: vi });
};

export const formatMonth = (date: Date): string => {
  return format(date, 'MM/yyyy', { locale: vi });
};

export const getMonthRange = (date: Date) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
};

export const isCurrentMonth = (date: Date): boolean => {
  return isSameMonth(date, new Date());
};