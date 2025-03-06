'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { toSingaporeISOString } from '@/lib/calendar/date';

/**
 * Type for event operation results that include data
 */
export interface EventResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Schema for validating calendar event creation data
 */
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Start time must be a valid date string",
  }),
  end_time: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "End time must be a valid date string",
  }),
  color: z.string().default("#2d3748"),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().optional(),
  original_event_id: z.string().optional(),
  recurrence_id: z.string().optional(),
});

type CreateEventInput = z.infer<typeof createEventSchema>;

/**
 * Creates a new calendar event
 * 
 * @param input Event data to create
 * @returns Result object with success status and new event data
 */
export async function createEvent(input: CreateEventInput): Promise<EventResult<Event>> {
  try {
    // Validate the input data
    const validationResult = createEventSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }

    // Get the validated data
    const eventData = validationResult.data;
    
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
    
    // Generate a unique event ID
    const eventId = crypto.randomUUID();
    
    // Prepare the event data for insertion
    const newEvent = {
      id: eventId,
      user_id: userId,
      title: eventData.title,
      description: eventData.description || null,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      color: eventData.color || null,
      is_completed: false,
      recurrence_rule: eventData.recurrence_rule || null,
      is_recurring: eventData.is_recurring || false,
      recurrence_id: null,
      source: 'local', // Set source to 'local' for events created in the app
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the event into the database
    const { data, error } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    // Revalidate the calendar page to show updated data
    revalidatePath('/calendar');
    
    // Return success response with the new event
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error in createEvent:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

/**
 * Syncs calendar events from Google Calendar
 * 
 * @returns Object with success status and event count
 */
export async function syncGoogleCalendar() {
  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.accessToken) {
      return {
        success: false,
        error: 'Unauthorized or missing access token',
      };
    }
    
    // Get the user ID and access token from the session
    const userId = session.user.id;
    const accessToken = session.user.accessToken;

    // Define color mapping for Google Calendar events
    const GOOGLE_CALENDAR_COLORS: { [key: string]: string } = {
      "1": "#7986cb", // Lavender
      "2": "#33b679", // Sage
      "3": "#8e24aa", // Grape
      "4": "#e67c73", // Flamingo
      "5": "#f6c026", // Banana
      "6": "#f5511d", // Tangerine
      "7": "#039be5", // Peacock
      "8": "#616161", // Graphite
      "9": "#3f51b5", // Blueberry
      "10": "#0b8043", // Basil
      "11": "#d60000", // Tomato
    };
    
    // Fetch events from Google Calendar API
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + 
      new URLSearchParams({
        singleEvents: 'false', // Get recurring events as single events
        maxResults: '500',     // Increase limit to get more events
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch events from Google Calendar');
    }

    const data = await response.json();

    // Map events with correct schema including recurrence
    const events = data.items.map((event: any) => {
      const isRecurring = Boolean(event.recurrence || event.recurringEventId);
      
      if (event.status === 'confirmed') {
        return {
          id: event.id,
          user_id: userId,
          title: event.summary || 'Untitled Event',
          description: event.description || null,
          start_time: event.start.dateTime || event.start.date,
          end_time: event.end.dateTime || event.end.date,
          color: event.colorId ? GOOGLE_CALENDAR_COLORS[event.colorId] : '#039be5',
          is_completed: false,
          recurrence_rule: event.recurrence ? event.recurrence[0] : null,
          is_recurring: isRecurring,
          recurrence_id: event.recurringEventId || (isRecurring ? event.id : null),
          source: 'google',
          status: "confirmed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      if (event.status === 'cancelled') {
        return {
          id: event.id,
          user_id: userId,
          title: event.summary || 'Untitled Event',
          start_time: event.originalStartTime.dateTime || event.originalStartTime.date,
          end_time: event.originalStartTime.dateTime || event.originalStartTime.date,
          is_completed: false,
          recurrence_rule: null,
          is_recurring: false,
          recurrence_id: event.recurringEventId || null,
          source: 'google',
          status: "cancelled",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    });

    // Upsert events to avoid duplicates
    const { error } = await supabase
      .from('events')
      .upsert(events, {
        onConflict: 'id',
      });

    if (error) throw error;

    // Update sync timestamp
    await supabase
      .from('oauth_connections')
      .update({ 
        last_synced_at: new Date().toISOString(),
        calendar_sync_enabled: true
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    // Return success response with event count
    return {
      success: true,
      eventCount: events.length
    };
  } catch (error: any) {
    console.error('Error syncing calendar events:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

/**
 * Updates the calendar sync settings
 * 
 * @param enabled Whether calendar sync is enabled
 * @returns Object with success status
 */
export async function updateCalendarSync(enabled: boolean) {
  try {
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
    
    // Update the sync settings
    const { error } = await supabase
      .from('oauth_connections')
      .update({
        calendar_sync_enabled: enabled,
        last_synced_at: enabled ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    if (error) {
      console.error('Error updating calendar sync:', error);
      return {
        success: false,
        error: 'Failed to update calendar sync settings',
        details: error.message
      };
    }
    
    // Return success response
    return {
      success: true,
      message: `Calendar sync ${enabled ? 'enabled' : 'disabled'} successfully`
    };
  } catch (error) {
    console.error('Error in updateCalendarSync:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

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

type RecurrenceExceptionInput = z.infer<typeof recurrenceExceptionSchema>;

/**
 * Adds an exception date to a recurring event
 * 
 * @param input Object containing event id and exception date
 * @returns Result object with success status
 */
export async function addRecurrenceException(input: RecurrenceExceptionInput): Promise<EventResult<any>> {
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

/**
 * Deletes a calendar event
 * 
 * @param id The ID of the event to delete
 * @returns Result object with success status
 */
export async function deleteEvent(id: string) {
  try {
    // Initialize Supabase client
    const supabase = createClient();

    console.log(id);
    
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

    console.log(userId);

    // First fetch the event to check if it's from Google
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (eventError) {
      return {
        success: false,
        error: eventError.message,
      };
    }

    if (!eventData) {
      return {
        success: false,
        error: 'Event not found or not authorized',
      };
    }

    // Check if the event is from Google Calendar
    if (eventData.source === 'google') {
      // Delete from Google Calendar first
      const googleDeleteResult = await deleteGoogleCalendarEvent(id);
      
      if (!googleDeleteResult.success) {
        console.error('Failed to delete event from Google Calendar:', googleDeleteResult.error);
        // Continue with local deletion even if Google deletion fails
        // Optionally, you could return an error here to prevent local deletion
      }
    }

    // Delete the event from the database
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    console.log(JSON.stringify(data, null, 4));

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    // Revalidate the calendar page to show updated data
    revalidatePath('/calendar');

    return {
      success: true,
      message: 'Event deleted successfully',
    };
  } catch (error: any) {
    console.error('Error in deleteEvent:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

/**
 * Deletes an event from Google Calendar
 * 
 * @param eventId The ID of the event to delete in Google Calendar
 * @returns Result object with success status
 */
export async function deleteGoogleCalendarEvent(eventId: string) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.accessToken) {
      return {
        success: false,
        error: 'Unauthorized or missing access token',
      };
    }
    
    // Get the access token from the session
    const accessToken = session.user.accessToken;
    
    // Make request to Google Calendar API to delete the event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    // Check if the request was successful (API returns 204 No Content on success)
    if (response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to delete event from Google Calendar: ${errorData.error?.message || response.statusText}`);
    }
    
    return {
      success: true,
      message: 'Event deleted from Google Calendar successfully',
    };
  } catch (error: any) {
    console.error('Error in deleteGoogleCalendarEvent:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

const editEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  color: z.string(),
});

type EditEventInput = z.infer<typeof editEventSchema>;

/**
 * Edits a calendar event
 * 
 * @param input Object containing event id and updated data
 * @returns Result object with success status
 */
export async function editEvent(input: EditEventInput) {
  try {
    // Validate the input data
    const validationResult = editEventSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
      };
    }

    // Get the validated data
    const { id, title, description, start_time, end_time, color } = validationResult.data;

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
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (eventError) {
      return {
        success: false,
        error: eventError.message,
      };
    }

    if (!eventData) {
      return {
        success: false,
        error: 'Event not found or not authorized',
      };
    }

    // Update the event in the database
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        title: title,
        description: description,
        start_time: start_time,
        end_time: end_time,
        color: color
      })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    // Revalidate the calendar page to show updated data
    revalidatePath('/calendar');

    return {
      success: true,
      message: 'Event updated successfully',
    };
  } catch (error: any) {
    console.error('Error in editEvent:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}
