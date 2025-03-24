'use client'

import { useState, useEffect } from "react"
import { CalendarClock, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { Course, CourseContent } from "@/types/database"
import { getCourseContent } from "@/lib/actions/course-content"
import { useQuery } from "@tanstack/react-query"

interface CourseOverviewProps {
  course: Course;
}

export default function CourseOverview({ course }: CourseOverviewProps) {
  // Fetch course content data
  const { data: courseContentResult, isLoading } = useQuery({
    queryKey: ["course-content", course?.id],
    queryFn: async () => {
      const result = await getCourseContent(course.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!course?.id,
  });

  const courseContents = courseContentResult || [];

  // Format date and time for display
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Calculate duration between start and end time
  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime
    const durationMinutes = Math.floor(durationMs / (1000 * 60))

    if (durationMinutes < 60) {
      return `${durationMinutes} min`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  // Format date for display
  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Group content by date
  const groupedContent = courseContents.reduce<Record<string, CourseContent[]>>((acc, content) => {
    const date = formatDate(content.start_time)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(content)
    return acc
  }, {})

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="w-full">
      <div className="bg-course-overview-bg rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-2">Course Overview</h2>
        <p className="text-course-overview-text-secondary mb-10 text-sm">What you'll learn in this course</p>

        <div className="space-y-10">
          {Object.entries(groupedContent).map(([date, contents]) => (
            <div key={date} className="pb-6 last:pb-0">
              <h3 className="font-medium text-sm uppercase tracking-wider text-course-overview-text-secondary mb-4">{date}</h3>
              <div className="space-y-3">
                {contents.map((content, index) => (
                  <div
                    key={content.id}
                    className={`relative overflow-hidden rounded-xl border border-course-overview-border transition-all duration-300 hover:shadow-md ${
                      content.is_completed ? "bg-course-overview-bg-completed" : "bg-course-overview-bg"
                    }`}
                  >
                    {/* Color indicator as left border */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: content.color || "var(--course-overview-text-accent)" }}
                    />

                    {/* Content */}
                    <div className="flex items-center p-4">
                      {/* Status indicator */}
                      <div className="mr-4 flex-shrink-0">
                        {content.is_completed ? (
                          <div className="rounded-full bg-green-50 p-1.5">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-course-overview-bg-completed p-1.5 border border-course-overview-border-hover">
                            <Clock className="h-4 w-4 text-course-overview-text-secondary" />
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-course-overview-text-primary">{content.title}</h4>
                        {content.description && (
                          <p className="text-course-overview-text-secondary text-xs mt-1 line-clamp-1">{content.description}</p>
                        )}
                      </div>

                      {/* Time information */}
                      <div className="ml-4 flex-shrink-0 text-right">
                        <div className="flex items-center text-xs font-medium text-course-overview-text-primary">
                          {formatDateTime(content.start_time)}
                          <ArrowRight className="h-3 w-3 mx-1 text-course-overview-text-secondary" />
                          {formatDateTime(content.end_time)}
                        </div>
                        <div className="text-xs text-course-overview-text-secondary mt-1">
                          {calculateDuration(content.start_time, content.end_time)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming content preview */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {courseContents
            .filter((c) => !c.is_completed)
            .slice(0, 2)
            .map((content) => (
              <div key={content.id} className="bg-course-overview-bg-upcoming rounded-lg p-4 border border-course-overview-border">
                <div className="flex items-center mb-2">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: content.color || "var(--course-overview-text-accent)" }}
                  ></div>
                  <h4 className="text-xs font-medium">Up Next</h4>
                </div>
                <p className="text-sm font-medium mb-1">{content.title}</p>
                <div className="flex items-center text-xs text-course-overview-text-secondary">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  <span>{formatDate(content.start_time)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
} 