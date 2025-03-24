"use client"

import { useState } from "react"
import { Search, Filter, Plus } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import { Input } from "@/components/shadcn-ui/input"
import { CourseCard } from "@/components/course/CourseCard"
import useCourse from "@/hooks/use-course"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: courses, isLoading, error } = useCourse()

  // Filter courses based on search query
  const filteredCourses = courses?.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-course-card-bg text-course-card-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-course-card-text-primary mx-auto mb-4"></div>
          <p className="text-course-card-text-muted">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-course-card-bg text-course-card-text-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Error loading courses. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-course-card-bg text-course-card-text-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8 text-course-card-text-primary">Your Courses</h1>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-course-card-text-muted" />
              <Input
                type="text"
                placeholder="Search courses..."
                className="pl-10 bg-course-card-bg border-course-card-border focus:border-course-card-border-hover text-course-card-text-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-course-card-border text-course-card-text-primary hover:bg-gray-600">
              <Plus className="h-4 w-4 mr-2 text-black" />
                <span className="text-black">Create a new Course</span>
              </Button>
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-course-card-text-muted">No courses found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 