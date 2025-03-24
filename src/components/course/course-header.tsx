import Link from 'next/link'
import React from 'react'
import { Button } from '../shadcn-ui/button'
import { ArrowLeft, Play } from 'lucide-react'
import { Progress } from '../shadcn-ui/progress'
import { Course } from '@/types/database'

const CourseHeader = ({ course, id }: { course: Course, id: string }) => {
  return (
    <div className="bg-gradient-to-r from-palette-1 to-palette-9 text-white py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Link href="/courses">
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/10 p-0 h-auto"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Courses
                    </Button>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold">{course?.title}</h1>
                <p className="text-white/80">{course?.description}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full md:w-80 h-fit">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Your Progress</span>
                      <span>In development</span>
                    </div>
                    <Progress value={0} className="h-2 bg-white/20" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button className="bg-white text-black hover:bg-white/90">
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                    <Link href={`/course/${id}/quiz`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-white text-black hover:bg-white/10"
                      >
                        Take Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default CourseHeader