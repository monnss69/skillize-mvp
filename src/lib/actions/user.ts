'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/**
 * Updates specific fields of the current user profile
 * Only updates the fields that are provided in the input
 * 
 * @param input - Object containing the fields to update
 * @returns Object with success status and message or error
 */
export async function updateUserProfile(input: UserUpdateInput) {
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
        details: error.message
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
  const updateData = { [field]: value } as UserUpdateInput;
  return updateUserProfile(updateData);
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Uploads an avatar image to S3 and updates the user's avatar_url
 * 
 * @param file - The file buffer to upload
 * @returns Object with success status and message or error
 */
export async function uploadAvatar(formData: FormData) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const userId = session.user.id;
    const file = formData.get('file') as File | null;

    // Validate input
    if (!file) {
      return {
        success: false,
        error: 'Missing file',
      };
    }

    // Get file details
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to S3
    const key = `avatars/${userId}.jpg`;
    const result = await uploadFileToS3(buffer, key);

    if (result) {
      // Update the user's avatar_url in the database
      const avatarUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
      const updateResult = await updateUserField('avatar_url', avatarUrl);
      
      if (updateResult.success) {
        // Revalidate any paths that display the user's avatar
        revalidatePath('/settings');
        
        return {
          success: true,
          message: 'Avatar uploaded successfully',
          url: avatarUrl,
        };
      } else {
        return {
          success: false,
          error: 'Failed to update user avatar URL',
          details: updateResult.error,
        };
      }
    } else {
      return {
        success: false,
        error: 'Failed to upload avatar to S3',
      };
    }
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper function to upload a file buffer to S3
 */
async function uploadFileToS3(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg',
  });

  const result = await s3Client.send(command);
  return result;
}

/**
 * Gets the current user's profile
 * 
 * @returns Object with success status and user data or error
 */
export async function getUserProfile() {
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