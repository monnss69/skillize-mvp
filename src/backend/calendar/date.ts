import { format, toZonedTime } from 'date-fns-tz';
import { DateTime } from 'luxon';

/**
 * Converts a date to Singapore timezone (UTC+8) with ISO format
 */
export function toSingaporeISOString(date: Date = new Date()): string {
  const timeZone = 'Asia/Singapore';
  const zonedDate = toZonedTime(date, timeZone);
  
  // Format in ISO-like format
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS", { timeZone });
}

/**
 * Converts a date to Singapore timezone with custom format
 */
export function formatInSingaporeTime(
  date: Date = new Date(),
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  const timeZone = 'Asia/Singapore';
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, formatStr, { timeZone });
}

/**
 * Converts a date to Singapore timezone
 */
export function toSingaporeTime(date: Date = new Date()): string | null {
  return DateTime.fromJSDate(date)
    .setZone('Asia/Singapore')
    .toISO();
}

/**
 * Formats a date in Singapore timezone
 */
export function formatSingaporeTime(
  date: Date = new Date(),
  format: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  return DateTime.fromJSDate(date)
    .setZone('Asia/Singapore')
    .toFormat(format);
} 