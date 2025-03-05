'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { toSingaporeISOString } from '@/lib/calendar/date';

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
  recurrence_exception_dates: z.string().optional(),
  original_event_id: z.string().optional(),
  recurrence_id: z.string().optional(),
});

type CreateEventInput = z.infer<typeof createEventSchema>;

/**
 * Creates a new calendar event
 * 
 * @param input Event data
 * @returns Result object with success status
 */
export async function createCalendarEvent(input: CreateEventInput) {
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
    const data = validationResult.data;
    
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
    
    // Generate a unique ID for the event
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the new event
    const { error } = await supabase.from('events').insert({
      id,
      user_id: userId,
      title: data.title,
      description: data.description || null,
      start_time: toSingaporeISOString(new Date(data.start_time)),
      end_time: toSingaporeISOString(new Date(data.end_time)),
      color: data.color,
      is_completed: false,
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule || null,
      recurrence_exception_dates: data.recurrence_exception_dates || null,
      original_event_id: data.original_event_id || null,
      recurrence_id: data.is_recurring ? id : (data.recurrence_id || null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event',
        details: error.message
      };
    }
    
    // Return success response
    return {
      success: true,
      message: 'Event created successfully',
      eventId: id
    };
  } catch (error) {
    console.error('Error in createCalendarEvent:', error);
    return {
      success: false,
      error: 'Internal server error',
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
        recurrence_exception_dates: event.exdate || null,
        is_recurring: isRecurring,
        recurrence_id: event.recurringEventId || (isRecurring ? event.id : null),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
export async function addRecurrenceException(input: RecurrenceExceptionInput) {
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
    const { data, error } = await supabase
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
    
    if (!data) {
      return {
        success: false,
        error: 'Event not found or not authorized',
      };
    }
    
    // Update the event by appending the new exception date to the recurrence_exception_dates array
    const { error: updateError } = await supabase
      .from('events')
      .update({
        recurrence_exception_dates: supabase.rpc('array_append', {
          arr: data.recurrence_exception_dates || [],
          item: exception_date
        }),
        updated_at: new Date().toISOString()
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
    
    // Return success response
    return {
      success: true,
      message: 'Exception date added successfully'
    };
  } catch (error: any) {
    console.error('Error in addRecurrenceException:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
} 