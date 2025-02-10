"use client";

import { MiniCalendar } from './components/MiniCalendar';
import { Button } from "@/components/ui/Button";

export function CalendarSidebar({ className }: { className?: string }) {
  return (
    <div className={`bg-[#1A1A1A] text-gray-300 p-4 flex flex-col gap-4 ${className}`}>
      {/* Mini Calendar */}
      <div className="mb-6 flex-1">
        <MiniCalendar />
      </div>
    </div>
  );
}