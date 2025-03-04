import { UserPreferences } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const useUserPreferences = () => {
  const { data: session, status: sessionStatus } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-preferences', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/users/preferences', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user preferences');
      }

      const preferencesData : UserPreferences = await response.json();
      return preferencesData;
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
