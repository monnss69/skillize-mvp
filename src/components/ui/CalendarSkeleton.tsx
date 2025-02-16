import React from 'react';
import { format, startOfWeek, addDays } from "date-fns";

export function CalendarSkeleton() {
  // Generate array for time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate array for week days
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  return (
    <div className="flex h-screen w-screen bg-[#242424] overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-[18.44vw] border-r border-[#303030] bg-[#1A1A1A]">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-[#242424] text-gray-300">
        {/* Week day labels */}
        <div className="flex border-b border-[#303030] bg-[#242424] text-sm sticky top-0 z-10">
          <div className="w-[72px] flex items-center justify-center px-2 py-4">
            <div className="h-4 w-12 bg-gray-800/50 rounded animate-pulse" />
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="flex-1 px-2 py-4 text-center"
            >
              <div className="h-4 w-20 bg-gray-800/50 rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-1 h-[1440px]">
            {/* Time labels */}
            <div className="w-[72px] flex-none border-r border-[#303030] sticky left-0 bg-[#242424]">
              {timeSlots.map((hour) => (
                <div key={hour} className="relative h-[60px]">
                  <div className="absolute -top-2 left-2 w-8 h-4 bg-gray-800/50 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Days columns */}
            <div className="flex-1 flex">
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="flex-1 border-l border-[#303030] relative"
                >
                  {timeSlots.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-[#303030] relative"
                    />
                  ))}
                  
                  {/* Skeleton Events */}
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        top: `${Math.floor(Math.random() * 1200)}px`,
                        height: `${Math.floor(Math.random() * 120) + 60}px`,
                      }}
                      className="absolute left-0 right-1 p-2 rounded-md animate-pulse"
                    >
                      <div className="h-full w-full bg-gray-800/50 rounded-md" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel Skeleton */}
      <div className="w-[18.06vw] border-l border-[#303030] bg-[#1A1A1A]">
        <div className="p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
} 