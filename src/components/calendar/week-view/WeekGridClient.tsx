"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { CalendarEvent } from "@/types";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import EventCard from "./components/EventCard";
import { CalendarHeader } from "./components/CalendarHeader";
/**
 * WeekGridClient is a Client Component that:
 * 1. Fetches all events once upon mount using the user's session access token.
 * 2. Stores events locally in state, preventing re-fetches on next/prev week navigation.
 */
export function WeekGridClient() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [referenceDate, setReferenceDate] = useState(new Date());
  const timeSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  useEffect(() => {
    const fetchEvents = async () => {
      
      try {
        const response = await fetch(
          `/api/calendar/event?userId=${session?.user.id}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setEvents(data.data || []);
      } catch (error) {
      }
    };
    
    if (session?.user.id) {
      fetchEvents();
    } else {
      console.log("No user session found");
    }
  }, [session?.user.id]);

  // Compute start of the visible week
  const startOfReferenceWeek = useMemo(
    () => startOfWeek(referenceDate, { weekStartsOn: 0 }),
    [referenceDate]
  );

  // Create an array for all 7 days in the current week
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(startOfReferenceWeek, i)),
    [startOfReferenceWeek]
  );

  // Utility to format hour labels (e.g. "1AM", "2PM")
  function formatTime(hour: number) {
    return format(new Date().setHours(hour, 0), "ha").toLowerCase();
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#242424] text-gray-300 font-sans">
      {/* The header handles changing the reference date without refreshing */}
      <div className="px-4 py-2">
        <CalendarHeader
          referenceDate={referenceDate}
          onChangeDate={setReferenceDate}
        />
      </div>

      {/* Week day labels */}
      <div className="flex border-b border-[#303030] bg-[#242424] text-sm sticky top-0 z-10">
        <div className="w-[72px] flex items-center justify-center px-2 py-4">
          Day
        </div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`
              flex-1 px-2 py-4 text-center hover:bg-gray-900 cursor-pointer
              ${isSameDay(day, referenceDate) ? "font-bold" : ""}
            `}
          >
            {format(day, "EEE")} {format(day, "d")}
          </div>
        ))}
      </div>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-scroll custom-scrollbar select-none">
        <div className="flex flex-1 h-[1440px] cursor-grab active:cursor-grabbing">
          {/* Time labels */}
          <div className="w-[72px] flex-none border-r border-[#303030] sticky left-0 bg-[#242424]">
            {timeSlots.map((hour) => (
              <div key={hour} className="relative h-[60px]">
                <div className="absolute -top-2 left-2 text-sm text-gray-500">
                  {formatTime(hour)}
                </div>
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

                {/* Render events for this day */}
                {events
                  .filter((event) => isSameDay(event.start_time, day))
                  .map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}