'use server'

import axios from 'axios'
import { z } from 'zod'

const baseUrl = process.env.BASE_URL

const createCourseSchema = z.object({
  duration: z.string().min(1),
  dailyStudyTime: z.string().min(1),
  learningSubject: z.string().min(1),
  goal: z.string().min(1),
})

const createCourseWithQuestionAndAnswerSchema = z.object({
  course: createCourseSchema,
  question: z.array(z.string()).min(1),
  answer: z.array(z.string()).min(1),
})


export async function createCourseWithQuestion(course: z.infer<typeof createCourseSchema>) {
  const validatedFields = createCourseSchema.safeParse(course)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const response = await axios.post(`${baseUrl}/ai-create-with-question`, course);

  return response.data.json();
}

export async function createCourseWithQuestionAndAnswer(course: z.infer<typeof createCourseWithQuestionAndAnswerSchema>) {
  const validatedFields = createCourseWithQuestionAndAnswerSchema.safeParse(course)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const response = await axios.post(`${baseUrl}/ai-create-with-question-and-answer`, course);

  return response.data.json();
}
