'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

/**
 * Schema for validating user update data
 * All fields are optional - only provided fields will be updated
 */
const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
  timezone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  // Add any other updatable user fields here
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/**
 * Updates specific fields of the current user profile
 * Only updates the fields that are provided in the input
 * 
 * @param input - Object containing the fields to update
 * @returns Object with success status and message or error
 */
export async function updateUserProfile(input: UserUpdateInput) {
  'use server';
  try {
    // Validate the input data
    const validationResult = userUpdateSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }
    
    // Get the validated data
    const data = validationResult.data;
    
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
    
    // Update only the fields that were provided
    const { error, data: userData } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user',
        details: { message: error.message }
      };
    }
    
    // Revalidate any paths that display user data
    revalidatePath('/settings');
    revalidatePath('/profile');
    
    // Return success response with updated user data
    return {
      success: true,
      message: 'User profile updated successfully',
      user: userData
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Updates a single field for the current user
 * Convenience wrapper around updateUserProfile for single field updates
 * 
 * @param field - The field name to update
 * @param value - The new value for the field
 * @returns Result from updateUserProfile
 */
export async function updateUserField(field: keyof UserUpdateInput, value: any) {
  'use server';
  const updateData = { [field]: value } as UserUpdateInput;
  return updateUserProfile(updateData);
}

/**
 * Gets the current user's profile
 * 
 * @returns Object with success status and user data or error
 */
export async function getUserProfile() {
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
    
    // Get the user data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: 'Failed to get user profile',
        details: { message: error.message }
      };
    }
    
    // Return success response with user data
    return {
      success: true,
      user: data
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
} 