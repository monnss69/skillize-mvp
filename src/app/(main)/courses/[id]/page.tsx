'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { use } from 'react'
import { getCourseById } from "@/lib/actions/courses";
import CourseOverview from "@/components/course/course-overview";
import CourseContent from "@/components/course/course-content";
import { useQuery } from "@tanstack/react-query";
import CourseHeader from "@/components/course/course-header";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const result = await getCourseById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  return (
    <div className="min-h-screen">
      <main className="flex flex-col">
        <CourseHeader course={course} id={id} />

        <div className="container py-8 flex-1 overflow-auto">
          <Tabs defaultValue="content" className="h-full">
            <TabsList className="mb-6">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto">
              <TabsContent value="content">
                <CourseContent course={course} />
              </TabsContent>
              <TabsContent value="overview">
                <CourseOverview course={course} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
