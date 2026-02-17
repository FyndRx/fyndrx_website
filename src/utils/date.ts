import { format, isValid, parseISO } from 'date-fns';

export function formatDate(
  dateString: string | number | Date | null | undefined,
  formatStr: string = 'MMM dd, yyyy'
): string {
  if (!dateString) return '';

  try {
    let date: Date;

    if (typeof dateString === 'string') {
      // Try parsing as ISO string first
      date = parseISO(dateString);
      // If invalid, try new Date constructor (fallback for other formats)
      if (!isValid(date)) {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (!isValid(date)) {
      console.warn('Invalid date value:', dateString);
      return '';
    }

    return format(date, formatStr);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
}

