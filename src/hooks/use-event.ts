import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Event } from "@/types";

export const useEvent = () => {
  const { data: session, status: sessionStatus } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/users/events', {
        method: 'GET',
      });
      if (!response.ok) {  
        throw new Error('Failed to fetch events');
      }
      const events : Event[] = await response.json();
      return events;
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
