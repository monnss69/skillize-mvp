'use server';

import { createClient } from '@/lib/supabase/server';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';

/**
 * Schema for validating signup data
 */
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  timezone: z.string().optional(),
});

type SignupInput = z.infer<typeof signupSchema>;

/**
 * Creates a new user account
 * 
 * @param input Signup data
 * @returns Object with success status and message or error
 */
export async function signupUser(input: SignupInput) {
  try {
    // Validate the input data
    const validationResult = signupSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }
    
    // Get the validated data
    const { email, username, password, timezone } = validationResult.data;
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'Email already in use',
      };
    }

    // Hash password
    const password_hash = await hash(password, 12);
    
    // Generate a user ID
    const userId = uuidv4();

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert(
        {
          id: userId,
          email,
          username: username || null,
          password_hash,
          auth_type: 'local',
          avatar_url: null,
          google_id: null,
          email_verified: false,
          timezone: timezone || 'GMT +00:00', // Default timezone or obtain from user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      )
      .select('id')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user',
        details: error.message
      };
    }
    
    // Insert default preferences for the user
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        preferred_study_time: {
          preference: 'afternoon'
        },
        study_duration: 25, // Default 25 minutes
        break_duration: 5,  // Default 5 minutes
        learning_style: 'visual',
      });
      
    if (preferencesError) {
      console.error('Error creating default preferences:', preferencesError);
      // We don't want to fail the signup if preferences creation fails
      // Just log the error and continue
    }
    
    return {
      success: true,
      message: 'User created successfully',
      userId: userId,
    };
  } catch (error) {
    console.error('Error in signupUser:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Sign out an user
 * 
 * @returns Object with success status and message or error
 */
export async function signoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('next-auth.session-token');
    cookieStore.delete('next-auth.csrf-token');
    cookieStore.delete('next-auth.session-token');

    redirect('/');
  } catch (error) {
    console.error('Error in signoutUser:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Gets the OAuth connections for the current user
 * 
 * @returns Object with success status and OAuth connections data or error
 */
export async function getUserOAuthConnections() {
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
    
    // Get the OAuth connections
    const { data, error } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting OAuth connections:', error);
      return {
        success: false,
        error: 'Failed to get OAuth connections',
        details: { message: error.message }
      };
    }
    
    // Return success response with OAuth connections data
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getUserOAuthConnections:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Refreshes the Google OAuth token for the current user
 * 
 * @returns Object with success status and new token data or error
 */
export async function refreshGoogleToken() {
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
    
    // Get the refresh token from database
    const { data, error } = await supabase
      .from('oauth_connections')
      .select('refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();
    
    if (error || !data?.refresh_token) {
      return {
        success: false,
        error: 'No Google refresh token found',
      };
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
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: 'Failed to refresh Google token',
        details: { message: errorData.error_description || errorData.error || response.statusText }
      };
    }
    
    const tokenData = await response.json();
    
    // Update the access token in the database
    const { error: updateError } = await supabase
      .from('oauth_connections')
      .update({
        access_token: tokenData.access_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    if (updateError) {
      return {
        success: false,
        error: 'Failed to update token in database',
        details: { message: updateError.message }
      };
    }
    
    // Return success response with token data
    return {
      success: true,
      data: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
      }
    };
  } catch (error) {
    console.error('Error in refreshGoogleToken:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}