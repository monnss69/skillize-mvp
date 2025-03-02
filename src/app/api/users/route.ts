import { createClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

/**
 * User update schema using Zod for validation
 * Only fields included in the request will be updated
 */
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
  timezone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  // Add other fields that you want to be updatable here
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

/**
 * PATCH /api/user
  * Updates specific fields of the current user
  * Uses PATCH semantics - only updates fields that are included in the request
  * @param request - The request object conforming to the updateUserSchema
  * @returns The response object
 */
export async function PATCH(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Get the validated data
    const data = validationResult.data;
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get the current user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Update only the fields that were provided in the request
    const { error, data: userData } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user', details: error.message },
        { status: 500 }
      );
    }
    
    // Return the updated user data
    return NextResponse.json({
      message: 'User updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error in user update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

/**
 * Retrieves the current user's profile information
 * 
 * @param req NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user profile retrieval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Deletes the current user's account
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in user deletion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

