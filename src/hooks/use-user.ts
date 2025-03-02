import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { User } from "@/types";

export const useUser = () => {
  const { data: session, status: sessionStatus } = useSession();
  
  // For debugging
  console.log("Session status:", sessionStatus);
  console.log("Session data:", session);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
        const response = await fetch('/api/users', {
            method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
       const userData : User = await response.json();
       return userData;
    },
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: !!session?.user?.id,
  });

  // Return session status along with user data
  return { 
    data, 
    isLoading: isLoading || sessionStatus === 'loading', 
    error,
    isAuthenticated: sessionStatus === 'authenticated'
  };
};  
