"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from "../ui/Button";
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

export default function LoginForm() {
  const { data: session } = useSession();

  const handleSignIn = () => {
    signIn('google', {
      callbackUrl: '/web/calendar',
      prompt: 'select_account',
      authorizationParams: {
        access_type: 'offline',
        prompt: 'consent select_account',
        scope: 'https://www.googleapis.com/auth/calendar openid profile email',
      },
    });
  }

  if (session) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          {session.user?.image && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={session.user.image}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
            <p className="text-gray-400 mt-1">{session.user?.email}</p>
          </div>
        </div>
        
        <Button
          onClick={() => signOut({ callbackUrl: '/web/login' })}
          className="w-full"
          variant="gradient"
          size="lg"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Welcome to Skillize</h1>
        <p className="text-gray-400">Sign in to continue to your account</p>
      </div>

      <Button
        onClick={() => handleSignIn()}
        className="w-full group relative"
        variant="gradient"
        size="lg"
      >
        <FcGoogle className="absolute left-4 w-5 h-5" />
        <span>Continue with Google</span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      {/* Add more auth providers here if needed */}
    </div>
  );
}