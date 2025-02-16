// src/components/signup-form/SignUpForm.tsx

'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function SignUpForm() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle input changes by updating the form state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission for user sign-up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        // On success, redirect to the login page
        router.push('/web/login');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 space-y-6 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-center text-white">Sign Up</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
            placeholder="your-email@example.com"
          />
        </div>
        <div>
          <label className="block text-gray-300">Username</label>
          <input
            name="username"
            type="text"
            required
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
            placeholder="Your username"
          />
        </div>
        <div>
          <label className="block text-gray-300">Password</label>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
            placeholder="Your password"
          />
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full" variant="gradient" size="lg">
          Sign Up
        </Button>
      </form>
    </div>
  );
}