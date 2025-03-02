'use client'

import UserProfileForm from './UserProfileForm';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';

/**
 * Profile settings container component
 * Fetches user data and renders the UserProfileForm
 */
export default function ProfileSettings() {
  const [error, setError] = useState<string | null>(null);
  const { data: user, isLoading, error: userError } = useUser();

  // Handle errors from the hook
  useEffect(() => {
    if (userError) {
      setError(userError.message || 'An error occurred while fetching user data');
    }
  }, [userError]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B8A47C]"></div>
      </div>
    );
  }
  
  // Show error state
  if (error || !user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-400 mb-4">Something went wrong</h2>
        <p className="text-[#8A8578]">{error || 'Could not load user data'}</p>
      </div>
    );
  }
  
  // Render the user profile form with the loaded data
  return <UserProfileForm initialData={user} />;
}