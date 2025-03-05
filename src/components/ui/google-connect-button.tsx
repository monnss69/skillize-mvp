'use client';

import { Button } from '@/components/shadcn-ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { useGoogleConnection } from '@/contexts/google-connect-context';
import { signIn } from 'next-auth/react';

type GoogleConnectButtonProps = {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
};

export function GoogleConnectButton({
  variant = 'default',
  size = 'default',
  className,
}: GoogleConnectButtonProps) {
  const { isConnected, isLoading, hasExpiredTokens } = useGoogleConnection();
  
  // Handle Google sign in
  const handleConnect = () => {
    signIn('google', { callbackUrl: window.location.href });
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6] ${className}`}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }
  
  // If connected, show connected state
  if (isConnected && !hasExpiredTokens) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6] ${className}`}
        disabled
      >
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        Connected to Google
      </Button>
    );
  }
  
  // If tokens expired, show reconnect button
  if (isConnected && hasExpiredTokens) {
    return (
      <Button
        variant="default"
        size={size}
        className={`bg-[#B8A47C] hover:bg-[#A89567] text-black ${className}`}
        onClick={handleConnect}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z"
          />
        </svg>
        Reconnect Google
      </Button>
    );
  }
  
  // Default: not connected, show connect button
  return (
    <Button
      variant="default"
      size={size}
      className={`bg-[#B8A47C] hover:bg-[#A89567] text-black ${className}`}
      onClick={handleConnect}
    >
      <svg
        className="mr-2 h-4 w-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        ></path>
      </svg>
      Connect Google
    </Button>
  );
} 