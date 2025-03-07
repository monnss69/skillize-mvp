'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { revalidatePath } from 'next/cache';

/**
 * Synchronizes events from Google Calendar to the application
 * 
 * @returns Object with success status and message or error
 */
export async function syncGoogleCalendar() {
  'use server';

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
 * Updates the calendar sync settings for the current user
 * 
 * @param enabled Whether to enable or disable calendar sync
 * @returns Object with success status and message or error
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
 * Deletes an event from Google Calendar
 * 
 * @param eventId The Google Calendar event ID to delete
 * @returns Object with success status and message or error
 */
export async function deleteGoogleCalendarEvent(eventId: string) {
  'use server';
  
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
    
    // Get the OAuth connection for the user
    const { data: oauthData, error: oauthError } = await supabase
      .from('oauth_connections')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();
    
    if (oauthError || !oauthData?.access_token) {
      console.error('Error getting OAuth token:', oauthError);
      return {
        success: false,
        error: 'Failed to get OAuth token',
        details: { message: oauthError?.message || 'OAuth token not found' }
      };
    }
    
    // Delete the event from Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${oauthData.access_token}`,
        },
      }
    );
    
    if (!response.ok && response.status !== 410) { // 410 Gone means already deleted
      const errorData = await response.json();
      return {
        success: false,
        error: 'Failed to delete event from Google Calendar',
        details: { message: errorData.error?.message || response.statusText }
      };
    }
    
    // Return success response
    return {
      success: true,
      message: 'Event deleted from Google Calendar successfully'
    };
  } catch (error) {
    console.error('Error in deleteGoogleCalendarEvent:', error);
    return {
      success: false,
      error: 'Internal server error',
      details: { message: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
} 