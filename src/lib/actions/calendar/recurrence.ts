'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EventResult } from './events';

/**
 * Schema for validating recurrence exception data
 */
const recurrenceExceptionSchema = z.object({
  id: z.string(),
  exception_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Invalid date format" }
  ),
});

export type RecurrenceExceptionInput = z.infer<typeof recurrenceExceptionSchema>;

/**
 * Adds an exception date to a recurring event
 * 
 * @param input Object containing event id and exception date
 * @returns Result object with success status
 */
export async function addRecurrenceException(input: RecurrenceExceptionInput): Promise<EventResult<any>> {
  'use server';
  try {
    // Validate the input data
    const validationResult = recurrenceExceptionSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }

    // Get the validated data
    const { id, exception_date } = validationResult.data;
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Get the event to ensure it exists and belongs to the user
    const { data: eventData, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    if (!eventData) {
      return {
        success: false,
        error: 'Event not found or not authorized',
      };
    }

    // Create a cancelled event instance for this exception date
    const cancelledEvent = {
      id: `${id}-${exception_date}`,
      user_id: userId,
      title: eventData.title,
      start_time: exception_date,
      end_time: exception_date, // Using exception_date as both start and end times
      is_completed: false,
      recurrence_rule: null,
      is_recurring: false,
      recurrence_id: id, // Reference to the parent recurring event
      source: 'local',
      status: "cancelled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the cancelled event into the database
    const { data: cancelledEventData, error: cancelledEventError } = await supabase
      .from('events')
      .insert(cancelledEvent)
      .select();

    if (cancelledEventError) {
      return {
        success: false,
        error: cancelledEventError.message,
      };
    }
    
    // If the event is from Google Calendar, also create a cancelled instance in Google Calendar
    let googleCalendarResult = null;
    if (eventData.source === 'google' && session.user.accessToken) {
      try {
        // Parse the exception date string to a Date object
        const exceptionDate = new Date(exception_date);
        
        // Format the original date time in ISO format
        const originalStartTime = {
          dateTime: exceptionDate.toISOString(),
          timeZone: 'UTC'
        };
        
        // Create a cancelled instance in Google Calendar
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.user.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'cancelled',
              summary: eventData.title,
              recurringEventId: eventData.google_event_id || id,
              originalStartTime: originalStartTime,
              start: originalStartTime,
              end: originalStartTime
            })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to create exception in Google Calendar: ${errorData.error?.message || response.statusText}`);
        }
        
        googleCalendarResult = await response.json();
      } catch (googleError: any) {
        console.error('Error creating exception in Google Calendar:', googleError);
        // We don't return an error here as the main operation succeeded
      }
    }
    
    // Revalidate the calendar page to show updated data
    revalidatePath('/calendar');
    
    // Return success response
    return {
      success: true,
      data: {
        localEvent: cancelledEventData,
        googleEvent: googleCalendarResult
      }
    };
  } catch (error: any) {
    console.error('Error in addRecurrenceException:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}