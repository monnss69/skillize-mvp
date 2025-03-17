'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

/**
 * Schema for validating course creation data
 */
const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.string().optional(),
  difficulty_level: z.string().optional(),
  estimated_completion_time: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

/**
 * Schema for validating course update data
 */
const updateCourseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  difficulty_level: z.string().optional(),
  estimated_completion_time: z.string().optional(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field must be provided for update besides id"
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

/**
 * Type for course operation results that include data
 */
export interface CourseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, any>;
}

/**
 * Creates a new course
 * 
 * @param input Course data to create
 * @returns Result object with success status and new course data
 */
export async function createCourse(input: CreateCourseInput): Promise<CourseResult<any>> {
  'use server';
  
  try {
    // Validate the input data
    const validationResult = createCourseSchema.safeParse(input);
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
    
    // Insert the new course
    const { data: courseData, error } = await supabase
      .from('courses')
      .insert({
        user_id: userId,
        ...data
      })
      .select();
    
    if (error) {
      console.error('Error creating course:', error);
      return {
        success: false,
        error: 'Failed to create course',
        details: { message: error.message }
      };
    }
    
    // Revalidate any paths that display courses
    revalidatePath('/courses');
    
    // Return success response with new course data
    return {
      success: true,
      message: 'Course created successfully',
      data: courseData[0]
    };
  } catch (error) {
    console.error('Error in createCourse:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Updates an existing course
 * 
 * @param input Course data to update
 * @returns Result object with success status and updated course data
 */
export async function updateCourse(input: UpdateCourseInput): Promise<CourseResult<any>> {
  'use server';

  try {
    // Validate the input data
    const validationResult = updateCourseSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }
    
    // Get the validated data
    const { id, ...data } = validationResult.data;
    
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
    
    // Update the course
    const { data: courseData, error } = await supabase
      .from('courses')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Error updating course:', error);
      return {
        success: false,
        error: 'Failed to update course',
        details: { message: error.message }
      };
    }
    
    // Revalidate any paths that display courses
    revalidatePath('/courses');
    
    // Return success response with updated course data
    return {
      success: true,
      message: 'Course updated successfully',
      data: courseData[0]
    };
  } catch (error) {
    console.error('Error in updateCourse:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Gets all courses for the current user
 * 
 * @returns Result object with success status and courses data
 */
export async function getUserCourses(): Promise<CourseResult<any[]>> {
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
    
    // Get all courses for the user
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting courses:', error);
      return {
        success: false,
        error: 'Failed to get courses',
        details: { message: error.message }
      };
    }
    
    // Return success response with courses data
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getUserCourses:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Deletes a course
 * 
 * @param id ID of the course to delete
 * @returns Result object with success status
 */
export async function deleteCourse(id: string): Promise<CourseResult<void>> {
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
    
    // Delete the course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        error: 'Failed to delete course',
        details: { message: error.message }
      };
    }
    
    // Revalidate any paths that display courses
    revalidatePath('/courses');
    
    // Return success response
    return {
      success: true,
      message: 'Course deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}
