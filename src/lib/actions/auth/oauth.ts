'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';

/**
 * Gets the OAuth connections for the current user
 * 
 * @returns Object with success status and OAuth connections data or error
 */
export async function getUserOAuthConnections() {
    'use server';

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