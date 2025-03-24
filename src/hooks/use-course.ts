import { useQuery } from "@tanstack/react-query";
import { getUserCourses } from "@/lib/actions/courses";
import { useSession } from "next-auth/react";
import { Course } from "@/types/database";

const useCourse = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["courses", userId],
        queryFn: async () => {
            const result = await getUserCourses()
            if (result.success) {
                return result.data as Course[];
            }
            throw new Error(result.error);
        },
    });

    return { 
        data, 
        isLoading: sessionStatus === "loading" || isLoading,
        error 
    };
};

export default useCourse;
