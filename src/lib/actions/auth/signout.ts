'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Sign out an user
 * 
 * @returns Object with success status and message or error
 */
export async function signoutUser() {
    'use server';
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