'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';

// Simple type for Google connection
type GoogleConnectionState = {
  isConnected: boolean;
  isLoading: boolean;
  hasExpiredTokens: boolean;
};

// Simple context with minimal methods
type GoogleConnectionContextType = GoogleConnectionState & {
  refreshConnection: () => Promise<void>;
  connectToGoogle: () => void;
};

const GoogleConnectionContext = createContext<GoogleConnectionContextType>({
  isConnected: false,
  isLoading: true,
  hasExpiredTokens: false,
  refreshConnection: async () => {},
  connectToGoogle: () => {},
});

// Custom hook to use the GoogleConnectionContext
export const useGoogleConnection = () => useContext(GoogleConnectionContext);

/**
 * Provider for the GoogleConnectionContext
 * @param children - The children to render
 * @returns The GoogleConnectionProvider component
 */
export function GoogleConnectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<GoogleConnectionState>({
    isConnected: false,
    isLoading: true,
    hasExpiredTokens: false,
  });
  
  // Simple function to check Google connection
  const checkGoogleConnection = async () => {
    // Don't check connection if session is loading or missing
    if (status === 'loading' || !session?.user?.id) {
      setState({
        isConnected: false,
        isLoading: status === 'loading',
        hasExpiredTokens: false,
      });
      return;
    }
    
    try {
      // Set loading state
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Check if user has a Google connection in the session
      if (session.user.googleId) {
        setState({
          isConnected: true,
          isLoading: false,
          hasExpiredTokens: false,
        });
        return;
      }
      
      // If not in session, check the database
      const supabase = createClient();
      const { data, error } = await supabase
        .from('oauth_connections')
        .select('expires_at')
        .eq('user_id', session.user.id)
        .eq('provider', 'google')
        .single();
      
      if (error || !data) {
        setState({
          isConnected: false,
          isLoading: false,
          hasExpiredTokens: false,
        });
        return;
      }
      
      // Check if token is expired
      const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
      const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : true;
      
      setState({
        isConnected: true,
        isLoading: false,
        hasExpiredTokens: isExpired,
      });
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setState({
        isConnected: false,
        isLoading: false,
        hasExpiredTokens: false,
      });
    }
  };
  
  // Check connection when session changes
  useEffect(() => {
    checkGoogleConnection();
  }, [session, status]);
  
  // Method to refresh the connection state
  const refreshConnection = async () => {
    await checkGoogleConnection();
  };
  
  // Method to connect to Google
  const connectToGoogle = () => {
    window.location.href = '/api/auth/signin/google';
  };
  
  return (
    <GoogleConnectionContext.Provider
      value={{
        ...state,
        refreshConnection,
        connectToGoogle,
      }}
    >
      {children}
    </GoogleConnectionContext.Provider>
  );
} 