"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

/**
 * LoginForm component renders a dark-themed login form with two options:
 *  - A button to sign in using Google
 *  - Manual login form with username and password inputs
 */
export default function LoginForm() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: Add proper validation and error handling here.
    console.log('Manual login:', { username, password });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Trigger Google sign‑in using next‑auth.
    await signIn('google');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>

      <div className="flex items-center justify-center">
        <span className="block w-full h-px bg-gray-600"></span>
        <span className="px-3 text-sm text-gray-300">or</span>
        <span className="block w-full h-px bg-gray-600"></span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-200">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        {hasError && <p className="text-red-500 text-sm">{hasError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 