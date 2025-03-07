'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

/**
 * Schema for validating user preferences update data
 * All fields are optional - only provided fields will be updated
 */
const userPreferencesSchema = z.object({
  preferred_study_time: z.object({
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    preference: z.enum(['morning', 'afternoon', 'evening']).optional(),
  }).optional().nullable(),
  study_duration: z.number().optional().nullable(),
  break_duration: z.number().optional().nullable(),
  learning_style: z.enum(['visual', 'auditory', 'kinesthetic']).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one preference field must be provided for update"
});

type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

/**
 * Updates user study preferences
 * Only updates the fields that are provided in the input
 * 
 * @param input - Object containing the preference fields to update
 * @returns Object with success status and message or error
 */
export async function updateUserPreferences(input: UserPreferencesInput) {
  try {
    // Validate the input data
    const validationResult = userPreferencesSchema.safeParse(input);
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
    const { error, data: preferencesData } = await supabase
      .from('user_preferences')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: 'Failed to update user preferences',
        details: error.message
      };
    }
    
    // Revalidate any paths that display user preferences
    revalidatePath('/settings');
    
    // Return success response with updated preference data
    return {
      success: true,
      message: 'User preferences updated successfully',
      preferences: preferencesData
    };
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Updates a single preference field for the current user
 * Convenience wrapper around updateUserPreferences for single field updates
 * 
 * @param field - The field name to update
 * @param value - The new value for the field
 * @returns Result from updateUserPreferences
 */
export async function updateUserPreferenceField(field: keyof UserPreferencesInput, value: any) {
  const updateData = { [field]: value } as UserPreferencesInput;
  return updateUserPreferences(updateData);
}

/**
 * Gets the current user's preferences
 * 
 * @returns Object with success status and preferences data or error
 */
export async function getUserPreferences() {
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
    
    // Get the user preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user preferences:', error);
      return {
        success: false,
        error: 'Failed to get user preferences',
        details: { message: error.message }
      };
    }
    
    // Return success response with preferences data
    return {
      success: true,
      preferences: data
    };
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}
