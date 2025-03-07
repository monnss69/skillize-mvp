'use client';

import { Button } from '@/components/shadcn-ui/button';
import { Loader2, CheckCircle, Globe, Check } from 'lucide-react';
import { useGoogleConnection } from '@/contexts/google-connect-context';
import { signIn } from 'next-auth/react';

type GoogleConnectButtonProps = {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'cardConnect';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
};

export function GoogleConnectButton({
  variant = 'cardConnect',
  size = 'default',
  className,
}: GoogleConnectButtonProps) {
  const { isConnected, isLoading, hasExpiredTokens } = useGoogleConnection();
  
  // Handle Google sign in
  const handleConnect = () => {
    signIn('google', { callbackUrl: window.location.href });
  };

  const handleDisconnect = () => {
    // TODO: Implement disconnect functionality
    console.log('Disconnect from Google');
  };
  
  // If we're using the card variant
  if (variant === 'cardConnect') {
    if (isLoading) {
      return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#1E2A36]/30 border border-[#1E2A36] transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20">
              <Loader2 className="h-6 w-6 text-[#B8A47C] animate-spin" />
            </div>
            <div>
              <p className="font-medium text-lg text-[#E8E2D6]">Google</p>
              <p className="text-[#E8E2D6]/60">Checking connection...</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="border-[#1E2A36] text-[#E8E2D6]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking
            </Button>
          </div>
        </div>
      );
    }
    
    if (isConnected && !hasExpiredTokens) {
      return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#B8A47C]/10 border border-[#B8A47C]/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#B8A47C]/10 border border-[#B8A47C]/30">
              <Globe className="h-6 w-6 text-[#B8A47C]" />
            </div>
            <div>
              <p className="font-medium text-lg text-[#E8E2D6]">Google</p>
              <p className="text-[#E8E2D6]/60">Connected to Google</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-[#B8A47C]" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDisconnect}
              className="text-sm border-[#B8A47C]/30 text-gray-900 hover:bg-[#B8A47C]/10 hover:text-[#B8A47C] hover:border-[#B8A47C]/50"
            >
              Disconnect
            </Button>
          </div>
        </div>
      );
    }
    
    if (isConnected && hasExpiredTokens) {
      return (
        <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Globe className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-lg text-[#E8E2D6]">Google</p>
              <p className="text-[#E8E2D6]/60">Connection expired</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleConnect}
            className="border-yellow-500/30 text-[#E8E2D6] hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/50"
          >
            Reconnect
          </Button>
        </div>
      );
    }
    
    return (
      <div className="group flex items-center justify-between p-4 rounded-lg border border-[#1E2A36] hover:border-[#B8A47C]/30 hover:bg-[#1E2A36]/20 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20 group-hover:border-[#B8A47C]/30 group-hover:bg-[#1E2A36]/70 transition-colors duration-300">
            <Globe className="h-6 w-6 text-[#B8A47C]/70 group-hover:text-[#B8A47C] transition-colors duration-300" />
          </div>
          <div>
            <p className="font-medium text-lg text-[#E8E2D6]">Google</p>
            <p className="text-[#E8E2D6]/60">Connect with Google</p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={handleConnect}
          className="border-[#1E2A36] text-[#E8E2D6] hover:bg-[#1E2A36]/50 hover:text-[#B8A47C] group-hover:border-[#B8A47C]/30 transition-colors duration-300"
        >
          Connect
        </Button>
      </div>
    );
  }
  
  // Traditional button styles below
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`border-[#1E2A36] text-[#E8E2D6] ${className}`}
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
        className={`bg-[#B8A47C]/10 border-[#B8A47C]/30 text-[#E8E2D6] hover:bg-[#B8A47C]/20 hover:border-[#B8A47C]/50 ${className}`}
        disabled
      >
        <CheckCircle className="mr-2 h-4 w-4 text-black" />
        Connected to Google
      </Button>
    );
  }
  
  // If tokens expired, show reconnect button
  if (isConnected && hasExpiredTokens) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`border-yellow-500/30 bg-yellow-500/10 text-black hover:bg-yellow-500/20 hover:border-yellow-500/50 ${className}`}
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
      variant="outline"
      size={size}
      className={`border-[#1E2A36] text-black hover:bg-[#1E2A36]/50 hover:border-[#B8A47C]/30 ${className}`}
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