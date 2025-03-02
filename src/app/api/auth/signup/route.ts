import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const password_hash = await hash(password, 12);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          email,
          username: username || null,
          password_hash,
          auth_type: 'local',
          avatar_url: null,
          google_id: null,
          email_verified: false,
          timezone: 'Asia/Tokyo', // Default timezone or obtain from user
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error signing up:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 