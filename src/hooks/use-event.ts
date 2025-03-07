import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Event } from "@/types";
import { getEvents } from "@/lib/actions/calendar";

export const useEvent = () => {
  const { data: session, status: sessionStatus } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', session?.user?.id],
    queryFn: async () => {
      const result = await getEvents();
      if (!result.success) {  
        throw new Error(result.error || 'Failed to fetch events');
      }
      return result.data as Event[];
    },
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: !!session?.user?.id,
  });

  return {
    data,
    isLoading: isLoading || sessionStatus === 'loading',
    error,
    isAuthenticated: sessionStatus === 'authenticated',
  };
};
