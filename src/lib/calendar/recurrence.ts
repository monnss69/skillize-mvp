import { Event } from "@/types";
import { isBefore, isSameDay } from "date-fns";

/**
 * Parses an RRULE string and returns a structured recurrence object
 */
export function parseRecurrenceRule(rrule: string | null): {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
    interval: number;
    count: number | null;
    until: Date | null;
    byDay: string[] | null;
} {
    if (!rrule) return { frequency: null, interval: 1, count: null, until: null, byDay: null };

    const parts = rrule.split(';');
    const result = {
        frequency: null as 'daily' | 'weekly' | 'monthly' | 'yearly' | null,
        interval: 1,
        count: null as number | null,
        until: null as Date | null,
        byDay: null as string[] | null
    };

    parts.forEach(part => {
        const [key, value] = part.split('=');

        // Handle RRULE:FREQ prefix if present
        if (key === 'RRULE:FREQ' || key === 'FREQ') {
            switch (value) {
                case 'DAILY': result.frequency = 'daily'; break;
                case 'WEEKLY': result.frequency = 'weekly'; break;
                case 'MONTHLY': result.frequency = 'monthly'; break;
                case 'YEARLY': result.frequency = 'yearly'; break;
            }
        }
        else if (key === 'INTERVAL') {
            result.interval = parseInt(value, 10) || 1;
        }
        else if (key === 'COUNT') {
            result.count = parseInt(value, 10) || null;
        }
        else if (key === "BYDAY") {
            // BYDAY can be a single value like 'TU' or multiple values like 'MO,WE,FR'
            result.byDay = value.split(',');
        }
        else if (key === 'UNTIL') {
            // UNTIL in RRULE is typically in format: 20240630T235959Z
            try {
                // Extract date components
                const year = parseInt(value.substring(0, 4), 10);
                const month = parseInt(value.substring(4, 6), 10) - 1; // 0-based month
                const day = parseInt(value.substring(6, 8), 10);

                // Extract time if present
                let hours = 0, minutes = 0, seconds = 0;
                if (value.length > 8 && value.includes('T')) {
                    const timeStr = value.split('T')[1];
                    hours = parseInt(timeStr.substring(0, 2), 10);
                    minutes = parseInt(timeStr.substring(2, 4), 10);
                    seconds = parseInt(timeStr.substring(4, 6), 10);
                }

                result.until = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
            } catch (e) {
                console.error("Error parsing UNTIL date:", e);
            }
        }
    });

    return result;
}

/**
* Converts day of week to the corresponding BYDAY value
* @param day - The day of the week to convert
* @returns The BYDAY value for the given day of the week
*/
export function getDayOfWeekCode(day: number): string {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return days[day];
}

/**
 * Checks if a recurring event should appear on the given date
 * @param event - The event to check
 * @param targetDate - The date to check
 * @returns True if the event should appear on the given date, false otherwise
 */
export function shouldShowRecurringEvent(
    event: Event,
    targetDate: Date
): boolean {
    if (!event.recurrence_rule) return false;

    // Parse the recurrence rule
    const recurrence = parseRecurrenceRule(event.recurrence_rule);
    if (!recurrence.frequency) return false;

    const startDate = new Date(event.start_time);

    // Don't show if target date is before the first occurrence
    if (isBefore(targetDate, startDate)) return false;

    // Don't show if target date is after the until date
    if (recurrence.until && isBefore(recurrence.until, targetDate)) return false;

    // Check if event is excluded on this date
    if (event.recurrence_exception_dates?.some(date =>
        isSameDay(new Date(date), targetDate)
    )) {
        return false;
    }

    // Get the day of week code for the target date
    const targetDayCode = getDayOfWeekCode(targetDate.getDay());

    // Match based on frequency and interval
    switch (recurrence.frequency) {
        case 'daily':
            const daysDiff = Math.floor(
                (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysDiff % recurrence.interval === 0;

        case 'weekly':
            // If BYDAY is specified, the event occurs only on those days
            if (recurrence.byDay && recurrence.byDay.length > 0) {
                // Check if today's day code is in the BYDAY list
                if (!recurrence.byDay.includes(targetDayCode)) {
                    return false;
                }
            } else {
                // Without BYDAY, the event occurs on the same day of week as the start date
                const startDayOfWeek = startDate.getDay();
                const targetDayOfWeek = targetDate.getDay();

                if (targetDayOfWeek !== startDayOfWeek) {
                    return false;
                }
            }

            // Calculate weeks since start to check interval
            const weeksDiff = Math.floor(
                (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
            );
            return weeksDiff % recurrence.interval === 0;

        case 'monthly':
            // If BYDAY is specified (e.g., 2TU for second Tuesday)
            if (recurrence.byDay && recurrence.byDay.length > 0) {
                for (const byDay of recurrence.byDay) {
                    // Check for patterns like "2TU" (second Tuesday)
                    const match = byDay.match(/^(-?\d+)([A-Z]{2})$/);
                    if (match) {
                        const occurrence = parseInt(match[1], 10);
                        const dayCode = match[2];

                        // Skip if not the right day of week
                        if (dayCode !== targetDayCode) continue;

                        // Calculate which occurrence this is (1st, 2nd, 3rd, etc.)
                        const targetOccurrence = Math.ceil(targetDate.getDate() / 7);
                        if (occurrence !== targetOccurrence) continue;
                    } else if (byDay !== targetDayCode) {
                        // Simple day code match
                        continue;
                    }
                }
            } else {
                // Default monthly behavior: same day of month
                const startDay = startDate.getDate();
                const targetDay = targetDate.getDate();
                if (targetDay !== startDay) return false;
            }

            const startMonth = startDate.getMonth() + startDate.getFullYear() * 12;
            const targetMonth = targetDate.getMonth() + targetDate.getFullYear() * 12;
            const monthsDiff = targetMonth - startMonth;

            return monthsDiff % recurrence.interval === 0;

        case 'yearly':
            // For yearly recurrence, must be same month and day, and year interval must match
            if (targetDate.getMonth() !== startDate.getMonth() ||
                targetDate.getDate() !== startDate.getDate()) {
                return false;
            }

            const yearsDiff = targetDate.getFullYear() - startDate.getFullYear();
            return yearsDiff % recurrence.interval === 0;

        default:
            return false;
    }
}

/**
 * Generates a virtual event instance for a recurring event on the specified date
 * @param event - The event to generate an instance for
 * @param targetDate - The date to generate the instance for
 * @returns The generated event instance
 */
export function generateRecurringEventInstance(
    event: Event,
    targetDate: Date
): Event {
    const originalStart = new Date(event.start_time);
    const originalEnd = new Date(event.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();

    // Create a new start time on the target date but keeping the original time
    const newStart = new Date(targetDate);
    newStart.setHours(
        originalStart.getHours(),
        originalStart.getMinutes(),
        originalStart.getSeconds(),
        originalStart.getMilliseconds()
    );

    // Calculate the new end time based on the original duration
    const newEnd = new Date(newStart.getTime() + duration);

    return {
        ...event,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        id: `${event.id}-recurring-${targetDate.toISOString().split('T')[0]}`,
        is_recurring: true
    };
}