import { UserPreferences } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUserPreferences } from "@/lib/actions/preferences";

export const useUserPreferences = () => {
  const { data: session, status: sessionStatus } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-preferences', session?.user?.id],
    queryFn: async () => {
      const result = await getUserPreferences();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user preferences');
      }

      return result.preferences as UserPreferences;
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
