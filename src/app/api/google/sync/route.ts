import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

/**
 * Syncs Google Calendar events with the database
 * 
 * @param req NextRequest object containing the request body
 * @returns NextResponse object with the response data
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId } = await req.json();

    const supabase = createClient();
    
    // Fetch events from Google Calendar with expanded recurring events
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + 
      new URLSearchParams({
        singleEvents: 'false', // Get recurring events as single events
        maxResults: '500',    // Increase limit to get more events
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
        // New recurrence fields
        recurrence_rule: event.recurrence ? event.recurrence[0] : null, // RRULE string
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

    return NextResponse.json({ 
      success: true, 
      eventCount: events.length 
    });
  } catch (error: any) {
    console.error('Error syncing calendar events:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 