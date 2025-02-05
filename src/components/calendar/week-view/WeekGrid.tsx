"use client";

import { useState } from "react";
import { CalendarEvent } from "@/types/calendar";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export function WeekGrid({ className }: { className?: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "AHPI Global Conclave Design",
      start: new Date(2024, 1, 30, 12),
      end: new Date(2024, 1, 30, 13),
      color: "bg-red-600",
    },
    // Add more sample events as needed
  ]);
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const startOfCurrentWeek = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfCurrentWeek, i)
  );
  const formatTime = (hour: number) => {
    return format(new Date().setHours(hour, 0), "ha").toLowerCase();
  };

  return (
    <div className="flex flex-col w-[calc(100%-300px)] h-full bg-[#242424] text-gray-300 font-sans">
      {/* Header */}
      <div className="flex border-b border-[#303030] bg-[#242424] text-sm tracking-wide sticky top-0 z-10">
        {/* Time gutter - empty space to align with time column */}
        <div className="w-[72px] flex items-center justify-center px-2 py-4 border-r border-gray-700">
          Day
        </div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`
              flex-1 px-2 py-4 text-center hover:bg-gray-900 cursor-pointer
              ${isSameDay(day, new Date()) ? "font-bold" : ""}
            `}
          >
            {format(day, "EEE")} {isSameDay(day, new Date()) ? (
              <span className="inline-flex items-center justify-center bg-[#F15550] w-6 h-6 rounded-md">
                {format(day, "d")}
              </span>
            ) : (
              <span>{format(day, "d")}</span>
            )}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-scroll custom-scrollbar select-none">
        <div className="flex flex-1 h-[1440px] cursor-grab active:cursor-grabbing"> {/* 24 hours * 60px per hour */}
          {/* Time labels column */}
          <div className="w-[72px] flex-none border-r border-[#303030] sticky left-0 bg-[#242424]">
            {timeSlots.map((hour) => (
              <div key={hour} className="relative h-[60px]"> {/* Increased height */}
                <div className="absolute -top-2 left-2 text-sm text-gray-500">
                  {formatTime(hour)}
                </div>
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex-1 flex">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 border-l border-[#303030]"
              >
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-[#303030] relative"
                  >
                    {events
                      .filter(
                        (event) =>
                          isSameDay(event.start, day) &&
                          event.start.getHours() === hour
                      )
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`absolute inset-x-0 px-2 py-1 ${event.color} 
                            rounded-sm opacity-90 overflow-hidden mx-0.5`}
                          style={{
                            height: `${
                              (event.end.getHours() - event.start.getHours()) * 60
                            }px`, // Update height calculation
                          }}
                        >
                          <div className="text-sm font-medium text-white">
                            {event.title}
                          </div>
                          <div className="text-xs text-white opacity-75">
                            {format(event.start, "h:mm a")} -{" "}
                            {format(event.end, "h:mm a")}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
