'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { updateUserField } from './profile';

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
 * @param formData - The form data containing the file to upload
 * @returns Object with success status and message or error
 */
export async function uploadAvatar(formData: FormData) {
  'use server';
  
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
  'use server';
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg',
  });

  const result = await s3Client.send(command);
  return result;
} 