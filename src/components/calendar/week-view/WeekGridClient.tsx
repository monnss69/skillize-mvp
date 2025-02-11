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

  // Fetch calendar events once on mount (client side)
  useEffect(() => {
    async function fetchEvents() {
      const accessToken = session?.user?.accessToken;
      if (!accessToken) {
        console.warn("No access token found; skipping fetch");
        return;
      }

      try {
        const response = await fetch("/api/calendar/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });

        if (!response.ok) {
          console.error("Failed to fetch calendar events:", response.statusText);
          return;
        }

        const data = await response.json();
        // Example transform from Google Calendar "items" array
        const loadedEvents: CalendarEvent[] = data.items?.map((item: any) => ({
          id: item.id,
          title: item.summary || "Untitled Event",
          start: new Date(item.start.dateTime),
          end: new Date(item.end.dateTime),
          color: item.colorId || "1",
        })) || [];

        setEvents(loadedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    // Only attempt to load events once we have a session
    if (session) {
      fetchEvents();
    }
  }, [session]);

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
        <div className="flex flex-1 h-[1920px] cursor-grab active:cursor-grabbing">
          {/* Time labels */}
          <div className="w-[72px] flex-none border-r border-[#303030] sticky left-0 bg-[#242424]">
            {timeSlots.map((hour) => (
              <div key={hour} className="relative h-[80px]">
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
                    className="h-[80px] border-b border-[#303030] relative"
                  />
                ))}

                {/* Render events for this day */}
                {events
                  .filter((event) => isSameDay(event.start, day))
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