'use client'

import { useState } from 'react';
import { MiniCalendar } from './components/MiniCalendar';

interface CalendarAccount {
  email: string;
  calendars: { name: string; color: string }[];
}

export function CalendarSidebar({ className }: { className?: string }) {
  const [accounts] = useState<CalendarAccount[]>([
    {
      email: 'account-one@email.com',
      calendars: [
        { name: 'Work', color: 'bg-orange-500' },
        { name: 'Birthdays', color: 'bg-blue-500' },
      ]
    }
  ]);

  return (
    <div className={`bg-[#1A1A1A] text-gray-300 p-4 flex flex-col gap-4 ${className}`}>
      {/* Mini Calendar */}
      <div className="mb-6">
        <MiniCalendar />
      </div>
    </div>
  );
}