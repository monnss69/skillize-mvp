'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { CourseContent } from '@/types';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Define return type for consistent responses
type CourseContentResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
};

// Schema for validating course content
const courseContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  color: z.string().optional(),
  is_completed: z.boolean(),
});

export async function getCourseContent(courseId: string): Promise<CourseContentResult<CourseContent[]>> {
  try {
    const supabase = createClient();

    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const userId = session.user.id;
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // First check if the user has access to this course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .eq('id', courseId)
      .single();

    if (courseError || !courseData) {
      return {
        success: false,
        error: 'Course not found or access denied',
      };
    }

    // Get course content
    const { data, error } = await supabase
      .from('course_content')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch course content',
        details: { message: error.message }
      };
    }

    return {
      success: true,
      data: data as CourseContent[]
    };
  } catch (error) {
    console.error('Error in getCourseContent:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

export async function createCourseContent(courseId: string, content: CourseContent): Promise<CourseContentResult<CourseContent>> {
  try {
    const supabase = createClient();

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const userId = session.user.id;
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Validate input data
    const validationResult = courseContentSchema.safeParse(content);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }

    // Check if user has access to this course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .eq('id', courseId)
      .single();

    if (courseError || !courseData) {
      return {
        success: false,
        error: 'Course not found or access denied',
      };
    }

    // Create course content
    const { data, error } = await supabase
      .from('course_content')
      .insert({ 
        course_id: courseId,
        title: content.title,
        description: content.description,
        start_time: content.start_time,
        end_time: content.end_time,
        color: content.color,
        is_completed: content.is_completed,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to create course content',
        details: { message: error.message }
      };
    }

    // Revalidate the course content page
    revalidatePath(`/courses/${courseId}`);

    return {
      success: true,
      message: 'Course content created successfully',
      data: data as CourseContent
    };
  } catch (error) {
    console.error('Error in createCourseContent:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

export async function updateCourseContent(courseId: string, content: CourseContent): Promise<CourseContentResult<CourseContent>> {
  try {
    const supabase = createClient();

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const userId = session.user.id;
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Validate input data
    const validationResult = courseContentSchema.safeParse(content);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      };
    }

    // Check if user has access to this course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .eq('id', courseId)
      .single();

    if (courseError || !courseData) {
      return {
        success: false,
        error: 'Course not found or access denied',
      };
    }

    // Update course content
    const { data, error } = await supabase
      .from('course_content')
      .update({
        title: content.title,
        description: content.description,
        start_time: content.start_time,
        end_time: content.end_time,
        color: content.color,
        is_completed: content.is_completed,
      })
      .eq('course_id', courseId)
      .eq('id', content.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to update course content',
        details: { message: error.message }
      };
    }

    // Revalidate the course content page
    revalidatePath(`/courses/${courseId}`);

    return {
      success: true,
      message: 'Course content updated successfully',
      data: data as CourseContent
    };
  } catch (error) {
    console.error('Error in updateCourseContent:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

