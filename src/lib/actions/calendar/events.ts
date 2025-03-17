'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
/**
 * Type for event operation results that include data
 */
export interface EventResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
  message?: string;
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
  recurrence_id: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;


const editEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  color: z.string(),
});

export type EditEventInput = z.infer<typeof editEventSchema>;

/**
 * Creates a new calendar event
 * 
 * @param input Event data to create
 * @returns Result object with success status and new event data
 */
export async function createEvent(input: CreateEventInput): Promise<EventResult<any>> {
  'use server';

  try {
    // Validate the input data
    const id = uuidv4();

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
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Insert the new event
    const { data, error } = await supabase
      .from('events')
      .insert({
        id: id,
        user_id: userId,
        ...eventData,
      })
      .select();
    
    if (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event',
        details: { message: error.message }
      };
    }
    
    // Revalidate any paths that display events
    revalidatePath('/calendar');
    
    // Return success response with new event data
    return {
      success: true,
      data: data[0]
    };
  } catch (error) {
    console.error('Error in createEvent:', error);
    return {
      success: false,
      error: 'Internal server error',
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
  'use server';

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
  'use server';

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

/**
 * Edits a calendar event
 * 
 * @param input Object containing event id and updated data
 * @returns Result object with success status
 */
export async function editEvent(input: EditEventInput) {
  'use server';

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

    console.log(id);
    console.log(eventData.recurrence_id);

    if (eventData.source === 'google') {
      await editGoogleCalendarEvent(id, {
        id: eventData.recurrence_id ? eventData.recurrence_id : id,
        title: title,
        description: description,
        start_time: start_time,
        end_time: end_time,
        color: color
      });
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

export async function editGoogleCalendarEvent(eventId: string, eventData: EditEventInput) {
  'use server';

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

    console.log("eventId", eventId);
    
    // First, get the current event to preserve the timezone
    const getResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      const errorData = await getResponse.json().catch(() => ({}));
      throw new Error(`Failed to get event from Google Calendar: ${errorData.error?.message || getResponse.statusText}`);
    }
    
    const currentEvent = await getResponse.json();
    console.log("currentEvent", currentEvent);
    
    // Make request to Google Calendar API to update the event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            summary: eventData.title,
            description: eventData.description,
            start: {
              dateTime: new Date(eventData.start_time).toISOString(),
              timeZone: currentEvent.start.timeZone
            },
            end: {
              dateTime: new Date(eventData.end_time).toISOString(),
              timeZone: currentEvent.end.timeZone
            },
          }
        )
      }
    );

    console.log("response", response);

    if (response.status !== 200) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to edit event in Google Calendar: ${errorData.error?.message || response.statusText}`);
    }

    return {
      success: true,
      message: 'Event updated in Google Calendar successfully',
    };
  } catch (error: any) {
    console.error('Error in editGoogleCalendarEvent:', error);
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

/**
 * Gets all events for the current user
 * 
 * @returns Result object with success status and events data
 */
export async function getEvents(): Promise<EventResult<any[]>> {
  'use server';

  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Get all events for the user
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting events:', error);
      return {
        success: false,
        error: 'Failed to get events',
        details: { message: error.message }
      };
    }
    
    // Return success response with events data
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getEvents:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
} 
