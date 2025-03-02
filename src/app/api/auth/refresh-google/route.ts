import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { createClient } from '@/lib/supabase/server';

/**
 * Simple API route to refresh Google tokens
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the refresh token from database
    const supabase = createClient();
    const { data, error } = await supabase
      .from('oauth_connections')
      .select('refresh_token')
      .eq('user_id', session.user.id)
      .eq('provider', 'google')
      .single();
    
    if (error || !data?.refresh_token) {
      return NextResponse.json(
        { error: 'No Google refresh token found' },
        { status: 404 }
      );
    }
    
    // Use the refresh token to get a new access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: data.refresh_token,
      }),
    });
    
    const tokenData = await response.json();
    
    if (!response.ok) {
      console.error('Failed to refresh token:', tokenData);
      return NextResponse.json(
        { error: 'Failed to refresh Google token' },
        { status: 500 }
      );
    }
    
    // Update the tokens in the database
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    await supabase
      .from('oauth_connections')
      .update({
        access_token: tokenData.access_token,
        expires_at: expiresAt,
        // Only update refresh token if a new one was provided
        ...(tokenData.refresh_token ? { refresh_token: tokenData.refresh_token } : {}),
      })
      .eq('user_id', session.user.id)
      .eq('provider', 'google');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error refreshing token:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 