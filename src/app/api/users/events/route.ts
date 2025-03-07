import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';
import { z } from 'zod';

const updateEventSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    color: z.string().optional(),
    is_recurring: z.boolean().optional(),
    recurrence_frequency: z
        .enum(["daily", "weekly", "biweekly", "monthly"])
        .optional(),
    recurrence_end_date: z.date().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

/**
 * Creates a new calendar event
 * 
 * @param req NextRequest object containing the request body
 * @returns NextResponse object with the response data
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const userId = formData.get('userId');
        const title = formData.get('title');
        const description = formData.get('description');
        const start_time = formData.get('start_time');
        const end_time = formData.get('end_time');
        const color = formData.get('color');
        const is_recurring = formData.get('is_recurring');
        const recurrence_rule = formData.get('recurrence_rule');
        const recurrence_id = formData.get('recurrence_id');

        if (!userId || !title || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createClient();
        const { data, error } = await supabase.from('events').insert({
            user_id: userId,
            id: Math.random().toString(36).substring(Math.random() * 15),
            title,
            description,
            start_time,
            end_time,
            color,
            is_completed: false,
            is_recurring,
            recurrence_rule,
            recurrence_id,
            source: 'local',
            status: 'confirmed'
        });

        console.log(JSON.stringify(data, null, 4));

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Event created successfully' }, { status: 200 });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Retrieves all calendar events for a specific user
 * 
 * @param req NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data, error } = await supabase.from('events')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Updates an existing calendar event
 * 
 * @param req NextRequest object containing the request body
 * @returns NextResponse object with the response data
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate the request data
        const validationResult = updateEventSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.format() },
                { status: 400 }
            );
        }
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const supabase = createClient();
        const { data, error } = await supabase.from('events')
            .update(validationResult.data)
            .eq('user_id', userId)
            .eq('id', validationResult.data.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Deletes an existing calendar event
 * 
 * @param req NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const supabase = createClient();

        // First, fetch the event to check if it's from Google
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', body.id)
            .eq('user_id', userId)
            .single();

        if (eventError) {
            return NextResponse.json({ error: eventError.message }, { status: 500 });
        }

        if (!eventData) {
            return NextResponse.json({ error: 'Event not found or not authorized' }, { status: 404 });
        }

        // Check if the event is from Google Calendar
        if (eventData.source === 'google' && session.user.accessToken) {
            // Delete from Google Calendar first
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${body.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                }
            );
            
            if (response.status !== 204) {
                console.error('Failed to delete event from Google Calendar:', response.statusText);
                // Continue with local deletion even if Google deletion fails
            }
        }

        // Delete the event from the database
        const { data, error } = await supabase.from('events')
            .delete()
            .eq('user_id', userId)
            .eq('id', body.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


