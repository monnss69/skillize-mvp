"use client";

import { CalendarEvent } from "@/types/calendar";
import { format, startOfWeek, addDays, isSameDay, getHours, getMinutes } from "date-fns";
import EventCard from "./components/EventCard";
import { CalendarHeader } from "./components/CalendarHeader";
import { useState } from "react";

export function WeekGrid() {
  const today = new Date();
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "AHPI Global Conclave Design",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), // 12:00 PM today
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),   // 1:00 PM today
      color: "[#059669]",
    },
    {
      id: "2",
      title: "Important Meeting",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 8, 0), // 2:00 PM today
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0),   // 3:00 PM today
      color: "[#E53E3E]",
    },
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
      <div className="px-4 py-2">
        <CalendarHeader />
      </div>
      {/* Header */}
      <div className="flex border-b border-[#303030] bg-[#242424] text-sm tracking-wide sticky top-0 z-10">
        {/* Time gutter - empty space to align with time column */}
        <div className="w-[72px] flex items-center justify-center px-2 py-4">
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
        <div className="flex flex-1 h-[1920px] cursor-grab active:cursor-grabbing"> {/* 24 hours * 60px per hour */}
          {/* Time labels column */}
          <div className="w-[72px] flex-none border-r border-[#303030] sticky left-0 bg-[#242424]">
            {timeSlots.map((hour) => (
              <div key={hour} className="relative h-[80px]"> {/* Increased height */}
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
                className="flex-1 border-l border-[#303030] relative"
              >
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-[80px] border-b border-[#303030] relative"
                  />
                ))}
                {events.filter(event => isSameDay(event.start, day)).map((event) => {
                  return <EventCard key={event.id} event={event} />
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
