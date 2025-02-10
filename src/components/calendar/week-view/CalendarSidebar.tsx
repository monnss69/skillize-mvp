"use client";

import { MiniCalendar } from './components/MiniCalendar';

export function CalendarSidebar({ className }: { className?: string }) {
  return (
    <div className={`bg-[#1A1A1A] text-gray-300 p-4 flex flex-col gap-4 ${className}`}>
      {/* Mini Calendar */}
      <div className="mb-6">
        <MiniCalendar />
      </div>
    </div>
  );
}