import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authOptions } from "@/app/api/auth/auth.config";
import { getServerSession } from "next-auth";
import { z } from "zod";

const recurrenceExceptionSchema = z.object({
    id: z.string(),
    exception_date: z.string().refine(
        (date) => !isNaN(Date.parse(date)),
        { message: "Invalid date format" }
    ),
});

/*
 * Create a cancelled event instance for this exception date
 * 
 * @param req NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedResult = recurrenceExceptionSchema.safeParse(body);

        if (!validatedResult.success) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { id, exception_date } = validatedResult.data;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userId = session.user.id;
        const supabase = createClient();

        const { data: eventData, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!eventData) {
            return NextResponse.json({ error: 'Event not found or not authorized' }, { status: 404 });
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
            return NextResponse.json({ error: cancelledEventError.message }, { status: 500 });
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
                    console.error(`Failed to create exception in Google Calendar: ${errorData.error?.message || response.statusText}`);
                } else {
                    googleCalendarResult = await response.json();
                }
            } catch (googleError) {
                console.error('Error creating exception in Google Calendar:', googleError);
                // We don't return an error here as the main operation succeeded
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Exception date added successfully',
            data: {
                localEvent: cancelledEventData,
                googleEvent: googleCalendarResult
            }
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Internal Server Error' 
        }, { status: 500 });
    }
}
