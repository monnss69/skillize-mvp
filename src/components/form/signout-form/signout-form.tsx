"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signoutUser } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";

export default function SignoutForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signoutUser();
      toast.success("You've been successfully signed out.");
      router.push('/');
    } catch (err) {
      console.error('Signout error:', err);
      setError('An error occurred while signing out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSignOut} 
      className={cn("flex flex-col gap-6 bg-black text-white p-8 rounded-lg border border-gray-700", className)} 
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Sign Out</h1>
        <p className="text-balance text-sm text-gray-400">
          Are you sure you want to sign out?
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="grid gap-6">
        <div className="flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-gray-700 hover:bg-black text-black hover:text-white"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="w-full border-x border-y border-red-500 bg-red-500 hover:bg-red-900 hover:border-gray-400" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </div>
    </form>
  );
} 