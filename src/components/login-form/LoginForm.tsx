"use client";

import React, { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from "../ui/Button";
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/web/calendar');
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
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

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
        callbackUrl: '/web/calendar',
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/web/calendar');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Welcome to Skillize</h1>
        <p className="text-gray-400">Sign in to continue to your account</p>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleCredentialsSignIn} className="space-y-4">
        <div>
          <label className="block text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            required
            value={credentials.email}
            onChange={handleCredentialsChange}
            className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
            placeholder="your-email@example.com"
          />
        </div>
        <div>
          <label className="block text-gray-300">Password</label>
          <input
            name="password"
            type="password"
            required
            value={credentials.password}
            onChange={handleCredentialsChange}
            className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
            placeholder="Your password"
          />
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full" variant="gradient" size="lg">
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleSignIn}
        className="w-full group relative"
        variant="gradient"
        size="lg"
      >
        <FcGoogle className="absolute left-4 w-5 h-5" />
        <span>Continue with Google</span>
      </Button>

      <div className="text-center text-gray-400">
        Don&apos;t have an account? <a href="/web/signup" className="underline">Sign Up</a>
      </div>
    </div>
  );
}