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
 * Add an exception date to the event's recurrence_exception_dates array
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

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Event not found or not authorized' }, { status: 404 });
        }

        // Update the event by appending the new exception date to the recurrence_exception_dates array
        const { data: updateData, error: updateError } = await supabase
            .from('events')
            .update({
                recurrence_exception_dates: supabase.rpc('array_append', {
                    arr: data.recurrence_exception_dates || [],
                    item: exception_date
                })
            })
            .eq('id', id)
            .eq('user_id', userId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Exception date added successfully' 
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Internal Server Error' 
        }, { status: 500 });
    }
}
