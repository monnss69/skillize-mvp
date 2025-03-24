"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/shadcn-ui/card"
import { Button } from "@/components/shadcn-ui/button"
import { Clock, Target } from "lucide-react"

interface CourseModule {
  estimatedTime: string
  title: string
  description: string
  aim: string
}

interface CourseData {
  courseOverview: CourseModule[]
}

interface CoursePreviewProps {
  courseData: CourseData
  onClose: () => void
  onSave: () => void
}

export function CoursePreview({ courseData, onClose, onSave }: CoursePreviewProps) {
  const calculateTotalTime = () => {
    const totalHours = courseData.courseOverview.reduce((total: number, module: CourseModule) => {
      const hours = Number.parseInt(module.estimatedTime.split(" ")[0]) || 0
      return total + hours
    }, 0)
    return `${totalHours} hours`
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col h-[calc(100vh-200px)] space-y-6">
        <div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-course-card-text-primary">Your Personalized Course Structure</h2>
            <p className="text-course-card-text-secondary mt-2">
              Based on your inputs, we've created the following course structure.
            </p>
          </div>

          <Card className="bg-course-card-bg border-course-card-border mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-course-card-text-primary">Estimated time to complete:</span>
                </div>
                <span className="text-blue-600 font-bold">{calculateTotalTime()}</span>
              </div>
              <div className="mt-2 text-course-card-text-secondary">
                <p>
                  This course consists of {courseData.courseOverview.length} modules designed to help you achieve
                  your learning goals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div 
          className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:w-2 
            [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-track]:bg-gray-800/20
            [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-600"
        >
          {courseData.courseOverview.map((module: CourseModule, index: number) => (
            <Card key={index} className="bg-course-card-bg border-course-card-border hover:border-course-card-border-hover transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-purple-400">
                    {index + 1}. {module.title}
                  </CardTitle>
                  <div className="flex items-center space-x-1 bg-course-overview-bg px-2 py-1 rounded text-xs text-black whitespace-nowrap flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{module.estimatedTime}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-course-card-text-secondary">{module.description}</p>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <div className="flex items-start space-x-2 text-sm text-course-card-text-secondary">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <p>
                    <span className="font-medium text-course-card-text-primary">Aim:</span> {module.aim}
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-course-card-border text-black hover:bg-course-card-bg"
          >
            Close
          </Button>
          <Button onClick={onSave} className="bg-purple-600 hover:bg-purple-700 text-white">
            Save Course
          </Button>
        </div>
      </div>
    </div>
  )
}
