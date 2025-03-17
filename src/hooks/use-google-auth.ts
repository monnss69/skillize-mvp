'use client';

import { useGoogleConnection } from '@/contexts/google-connect-context';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { refreshGoogleToken } from '@/lib/actions';

/**
 * A simple hook to use Google authentication in components
 * Provides easy access to Google connection status and methods
 */
export function useGoogleAuth() {
  const { 
    isConnected, 
    isLoading, 
    hasExpiredTokens,
    connectToGoogle,
    refreshConnection 
  } = useGoogleConnection();
  const { status: sessionStatus } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Auto-refresh tokens if they're expired
  useEffect(() => {
    const refreshTokens = async () => {
      if (isConnected && hasExpiredTokens && !isRefreshing) {
        try {
          setIsRefreshing(true);
          
          // Call the refresh server action
          const result = await refreshGoogleToken();
          
          if (result.success) {
            // Update the connection state
            await refreshConnection();
          }
        } catch (error) {
          console.error('Error refreshing Google tokens:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    // Only try to refresh if session is authenticated
    if (sessionStatus === 'authenticated') {
      refreshTokens();
    }
  }, [
    isConnected, 
    hasExpiredTokens, 
    isRefreshing, 
    refreshConnection, 
    sessionStatus
  ]);
  
  return {
    isConnected,
    isLoading: isLoading || isRefreshing,
    hasExpiredTokens,
    connectToGoogle,
    refreshConnection,
  };
} 