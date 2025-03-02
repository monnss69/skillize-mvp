"use server";

import { createCalendarEvent } from '@/lib/actions/calendar';
import { revalidatePath } from "next/cache";

/**
 * Creates a new calendar event with potential recurrence
 * 
 * @param formData FormData object containing event details
 */
export async function createEvent(formData: FormData) {
  try {
    const userId = formData.get('user_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startTime = formData.get('start_time') as string;
    const endTime = formData.get('end_time') as string;
    const color = formData.get('color') as string;
    const isRecurring = formData.get('is_recurring') === 'true';
    const recurrenceRule = formData.get('recurrence_rule') as string | null;
    
    // Validate required fields
    if (!title || !startTime || !endTime) {
      throw new Error('Missing required fields');
    }

    const result = await createCalendarEvent({
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      color,
      is_recurring: isRecurring,
      recurrence_rule: recurrenceRule || undefined
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create event');
    }

    revalidatePath('/calendar');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create event:', error);
    throw new Error(error.message || 'Failed to create event. Please try again.');
  }
}
