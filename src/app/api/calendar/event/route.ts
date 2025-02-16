import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const userId = formData.get('userId');
        const title = formData.get('title');
        const description = formData.get('description');
        const start_time = formData.get('start_time');
        const end_time = formData.get('end_time');
        const color = formData.get('color');

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
        });

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

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
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
        
        return NextResponse.json({ data: data?.map((event) => ({
            ...event,
            start_time: new Date(event.start_time),
            end_time: new Date(event.end_time)
        })) }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


