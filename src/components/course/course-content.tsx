import { Course } from "@/types/database";

interface CourseContentProps {
  course: Course;
}

export default function CourseContent({ course }: CourseContentProps) {
  return (
    <div>
      {/* This component will be implemented when we have the content data structure */}
      <p className="text-muted-foreground">Course content coming soon...</p>
    </div>
  );
} 