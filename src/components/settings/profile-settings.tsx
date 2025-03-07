'use client'

import UserProfileForm from './user-profile-form';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useUserPreferences } from '@/hooks/use-user-preference';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Profile settings container component
 * Fetches user data and renders the UserProfileForm
 */
export default function ProfileSettings() {
  const [error, setError] = useState<string | null>(null);
  const { data: user, isLoading, error: userError } = useUser();
  const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = useUserPreferences();

  // Handle errors from the hook
  useEffect(() => {
    if (userError) {
      setError(userError.message || 'An error occurred while fetching user data');
    }
    if (preferencesError) {
      setError(preferencesError.message || 'An error occurred while fetching user preferences');
    }
  }, [userError, preferencesError]);
  
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container min-h-[calc(100vh-4rem)] py-8 relative"
    >
      {/* Background gradient */}
      <div className="absolute rounded-lg inset-0 bg-gradient-to-br from-[#1E2A36]/20 via-[#0A0F14] to-[#1E2A36]/10 pointer-events-none" />
      
      <div className="relative max-w-3xl mx-auto">
        {/* Show loading state */}
        {(isLoading || preferencesLoading) && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20">
              <Loader2 className="h-8 w-8 text-[#B8A47C] animate-spin" />
            </div>
            <p className="text-[#E8E2D6]/60">Loading your profile...</p>
          </div>
        )}
        
        {/* Show error state */}
        {error && (
          <div className="text-center p-8 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mx-auto">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-xl text-red-400">Something went wrong</h2>
            <p className="text-[#E8E2D6]/60">{error}</p>
          </div>
        )}
        
        {/* Render the user profile form with the loaded data */}
        {!isLoading && !preferencesLoading && !error && user && preferences && (
          <UserProfileForm initialData={user} preferences={preferences} />
        )}
      </div>
    </motion.main>
  );
}