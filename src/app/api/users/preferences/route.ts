import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
    preferred_study_time: z.object({
        start_time: z.string(),
        end_time: z.string(),
        preference: z.enum(['morning', 'afternoon', 'evening', 'night']),
    }).or(z.string().transform(val => {
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    })).optional(),
    study_duration: z.number().min(1).optional(),
    break_duration: z.number().min(0).optional(),
    learning_style: z.enum(['visual', 'auditory', 'kinesthetic']).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

/**
 * Retrieves the user's preferences
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const supabase = createClient();
        const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();

        if (error) {
            console.error('Error fetching user preferences:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Updates the user's preferences
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = updatePreferencesSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const supabase = createClient();
        const { data, error } = await supabase.from('user_preferences').update(validationResult.data).eq('user_id', userId).select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

