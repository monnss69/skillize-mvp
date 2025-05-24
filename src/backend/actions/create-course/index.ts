'use server'

import axios from 'axios'
import { z } from 'zod'
import { createClient } from '@/backend/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createCourse } from '../courses'
import { createCourseContent } from '../coursecontent'

const baseUrl = process.env.BASE_URL

const createCourseSchema = z.object({
  duration: z.string().min(1),
  dailyStudyTime: z.string().min(1),
  learningSubject: z.string().min(1),
  goal: z.string().min(1),
})

const createCourseWithQuestionAndAnswerSchema = z.object({
  duration: z.string().min(1),
  dailyStudyTime: z.string().min(1),
  learningSubject: z.string().min(1),
  goal: z.string().min(1),
  question: z.array(z.string()).min(1),
  answer: z.array(z.string()).min(1),
})

const courseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  courseOverview: z.array(z.object({
    estimatedTime: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    aim: z.string().min(1),
  })),
});

export async function createCourseWithQuestion(course: z.infer<typeof createCourseSchema>) {
  const validatedFields = createCourseSchema.safeParse(course)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const response = await axios.post(`${baseUrl}/ai-create-with-question`, course);
  console.log(response.data)

  return response.data;
}

export async function createCourseWithQuestionAndAnswer(course: z.infer<typeof createCourseWithQuestionAndAnswerSchema>) {
  const validatedFields = createCourseWithQuestionAndAnswerSchema.safeParse(course)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const response = await axios.post(`${baseUrl}/ai-create-with-question-and-answer`, course);

  return response.data;
}

export async function createFullCourse(course: z.infer<typeof courseSchema>) {
  const validatedFields = courseSchema.safeParse(course)
  const session = await getServerSession(authOptions);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const supabase = createClient()
  const id = session?.user.id;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Fetch the user's event data to find date to fit in, only select ones that have start time gte today
  const { data, error } = await supabase
      .from("events")
      .select("start_time, end_time")
      .eq("user_id", id)
      .gte("start_time", todayString)
      .order("start_time", { ascending: false })

  if (error) {
    console.error('Error getting user events:', error);
    return {
      success: false,
      error: 'Failed to get user events',
      details: { message: error.message }
    };
  }

  const estimatedTime = course.courseOverview.reduce((acc, curr) => acc + parseInt(curr.estimatedTime), 0);

  // Create a course to get its ID
  const { data: courseData, error: courseError } = await createCourse({
    title: course.name,
    description: course.description,
    estimated_completion_time: estimatedTime.toString(),
  })
  const courseId = courseData[0].id;


  // Create an array of empty timeslot (per day) to fit the course data in
  const timeslots = [];
  let currSession = 0;

  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    const nextEvent = data[i + 1];

    if (nextEvent) {  
      if (event.end_time + course.courseOverview[currSession].estimatedTime < nextEvent.start_time) {
        timeslots.push({
          startTime: event.end_time,
          endTime: event.end_time + course.courseOverview[currSession].estimatedTime
        })
        currSession++;
      }
    } else {
      timeslots.push({
        startTime: event.end_time,
        endTime: event.end_time + course.courseOverview[currSession].estimatedTime
      })
    }
  }

  console.log(timeslots);

  // Create a course content for each timeslot
  for (const timeslot of timeslots) {
    const { data: courseContentData, error: courseContentError } = await createCourseContent(
      courseId,
      {
        title: course.courseOverview[currSession]?.title || "Course Session",
        description: course.courseOverview[currSession]?.description || "",
        start_time: timeslot.startTime,
        end_time: timeslot.endTime,
        color: "#4f46e5", // Default indigo color
        is_completed: false
      }
    );
    
    // Move to next session if available
    if (currSession < course.courseOverview.length - 1) {
      currSession++;
    }
  }

  return {
    success: true,
    courseId,
    timeslots
  };
}
