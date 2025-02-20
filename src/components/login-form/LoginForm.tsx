"use client";

import React, { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from 'react-icons/fc';

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
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
      router.push('/calendar');
    }
  }, [session, router]);
  
  const handleGoogleSignIn = () => {
    signIn('google', {
      callbackUrl: '/calendar',
      prompt: 'select_account',
      authorizationParams: {
        access_type: 'offline',
        prompt: 'consent select_account',
        scope: 'https://www.googleapis.com/auth/calendar openid profile email',
      },
    });
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
        callbackUrl: '/calendar',
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/calendar');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("flex flex-col gap-6 bg-black text-white p-8 rounded-lg border border-gray-700", className)} 
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome to Skillize</h1>
        <p className="text-balance text-sm text-gray-400">
          Enter your email below to login to your account
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            value={credentials.email}
            onChange={handleCredentialsChange}
            className="bg-gray-900 text-white border-gray-700"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm text-gray-400 underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={credentials.password}
            onChange={handleCredentialsChange}
            className="bg-gray-900 text-white border-gray-700"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-700">
          <span className="relative z-10 bg-black px-2 text-gray-400">
            Or continue with
          </span>
        </div>
        <Button 
          type="button"
          variant="outline" 
          className="w-full border-gray-700 hover:bg-gray-900 text-gray-700 hover:text-white"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Login with Google
        </Button>
      </div>
      <div className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-white underline underline-offset-4 hover:text-gray-300">
          Sign up
        </a>
      </div>
    </form>
  );
}