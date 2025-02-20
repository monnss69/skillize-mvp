'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export function GoogleLinkButton() {
  const { data: session } = useSession();
  const [isLinking, setIsLinking] = useState(false);

  const handleGoogleLink = async () => {
    setIsLinking(true);
    try {
      await signIn('google', {
        redirect: false,
        callbackUrl: '/web/settings',
        prompt: 'consent select_account',
        authorizationParams: {
          access_type: 'offline',
          prompt: 'consent select_account',
          scope: 'https://www.googleapis.com/auth/calendar openid profile email',
        },
      });
    } catch (error) {
      console.error('Error linking Google account:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const isLinked = Boolean(session?.user?.googleId);

  if (isLinked) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-900/20 rounded-lg">
        <FcGoogle className="w-6 h-6" />
        <p className="text-sm text-green-400">Google Account Linked</p>
      </div>
    );
  }

  return (
    <Button
      onClick={handleGoogleLink}
      disabled={isLinking}
      className="w-full group relative"
      variant="outline"
      size="lg"
    >
      <FcGoogle className="absolute left-4 w-5 h-5" />
      <span className="text-xs absolute left-12">
        {isLinking ? 'Linking...' : 'Link Google Account'}
      </span>
    </Button>
  );
} 