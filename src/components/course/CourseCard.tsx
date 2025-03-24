import { Card, CardContent, CardFooter, CardHeader } from "@/components/shadcn-ui/card"
import { Button } from "@/components/shadcn-ui/button"
import { Badge } from "@/components/shadcn-ui/badge"
import { Clock, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Course } from "@/types/database"

// Difficulty badge color mapping using the new color system
const difficultyColors = {
  beginner: "bg-course-difficulty-beginner-bg text-course-difficulty-beginner-text border-course-difficulty-beginner-border",
  intermediate: "bg-course-difficulty-intermediate-bg text-course-difficulty-intermediate-text border-course-difficulty-intermediate-border",
  advanced: "bg-course-difficulty-advanced-bg text-course-difficulty-advanced-text border-course-difficulty-advanced-border",
  expert: "bg-course-difficulty-expert-bg text-course-difficulty-expert-text border-course-difficulty-expert-border",
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="bg-course-card-bg border-course-card-border backdrop-blur-sm overflow-hidden group hover:border-course-card-border-hover transition-all duration-300 flex flex-col h-full">
      <div className="flex-1">
        <CardHeader className="p-0">
          <div className="bg-gradient-to-r from-course-card-header-from to-course-card-header-to p-5">
            <h2 className="text-xl font-semibold mb-1 text-course-card-text-primary">{course.title}</h2>
            <p className="text-course-card-text-secondary text-sm line-clamp-2">{course.description}</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-course-card-text-muted">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">{course.duration}</span>
            </div>
            <Badge className={`${difficultyColors[course.difficulty_level]} border capitalize px-3 py-1`}>
              {course.difficulty_level}
            </Badge>
          </div>
          <div className="flex items-center text-course-card-text-muted">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="text-sm">5 lessons</span>
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-6 pt-0 flex justify-end mt-auto">
        <Link href={`/courses/${course.id}`}>
          <Button
            variant="ghost"
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 group-hover:translate-x-1 transition-all duration-300 border border-indigo-900"
          >
            View Course
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

