"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Event } from "@/types";
import { 
  format, startOfWeek, addDays, isSameDay,
} from "date-fns";
import EventCard from "./components/event/event-card";
import { CalendarHeader } from "./components/calendar-props/CalendarHeader";
import { shouldShowRecurringEvent, generateRecurringEventInstance } from "@/lib/calendar/recurrence";
import { useEvent } from "@/hooks/use-event";

/**
 * WeekGridClient is a Client Component that:
 * 1. Fetches all events using React Query for automatic caching and deduplication.
 * 2. Stores events in React Query cache, preventing re-fetches on next/prev week navigation.
 */
export function WeekGridClient() {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const timeSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const { data: events, isLoading, error } = useEvent();

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

  // Format time (e.g., "9 AM", "2 PM")
  function formatTime(hour: number) {
    return format(new Date().setHours(hour, 0, 0, 0), 'h a');
  }

  /**
   * Filter and process events for a specific day
   * @param day The day to get events for
   * @param allEvents Array of all events
   * @returns Array of processed events for the specified day
   */
  function getEventsForDay(day: Date, allEvents: Event[] = []) {
    // First, identify all cancelled recurring event instances
    const cancelledRecurringInstances = allEvents
      .filter(event => 
        event.status === "cancelled" && 
        event.recurrence_id && 
        event.start_time
      )
      .map(event => ({
        recurringEventId: event.recurrence_id,
        // Get the start of the cancelled instance to compare dates
        cancelledDate: new Date(event.start_time)
      }));

    return allEvents
      .flatMap((event: Event) => {
        // Skip cancelled events
        if (event.status === "cancelled") {
          return [];
        }

        // Check if this is a normal event that spans this day
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        const currentDay = new Date(day);
        
        // Set time to midnight for date comparison
        currentDay.setHours(0, 0, 0, 0);
        const startDay = new Date(eventStart);
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(eventEnd);
        endDay.setHours(0, 0, 0, 0);
        
        // Regular event that spans this day
        if (currentDay >= startDay && currentDay <= endDay && !event.recurrence_id) {
          return [event];
        }
        
        // Handle recurring events
        if (event.is_recurring && event.recurrence_rule && shouldShowRecurringEvent(event, day)) {
          // Before generating a recurring instance, check if it's been cancelled
          const isCancelled = cancelledRecurringInstances.some(cancelled => {
            
            if (cancelled.recurringEventId !== event.recurrence_id) {
              return false;
            }
            
            const cancelledDay = new Date(cancelled.cancelledDate);
            cancelledDay.setHours(0, 0, 0, 0);
            
            return isSameDay(cancelledDay, currentDay);
          });
          
          // Only show if not cancelled
          if (!isCancelled) {
            return [generateRecurringEventInstance(event, day)];
          }
        }
        
        return [];
      })
      .map((event: Event) => {
        // Create a segment of the event for this specific day
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        const currentDay = new Date(day);
        const originalStartTime = new Date(event.start_time);
        const originalEndTime = new Date(event.end_time);

        // If event starts before this day, set start time to beginning of this day
        if (eventStart < currentDay) {
          eventStart.setTime(currentDay.getTime());
          eventStart.setHours(0, 0, 0, 0);
        }

        // If event ends after this day, set end time to end of this day
        const nextDay = new Date(currentDay);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        if (eventEnd > nextDay) {
          eventEnd.setTime(currentDay.getTime());
          eventEnd.setHours(23, 59, 59, 999);
        }

        // Create a modified event object for this day's segment
        const segmentedEvent = {
          ...event,
          start_time: eventStart.toISOString(),
          end_time: eventEnd.toISOString(),
          isStart: isSameDay(eventStart, new Date(event.start_time)),
          isEnd: isSameDay(eventEnd, new Date(event.end_time)),
          original_start_time: originalStartTime.toISOString(),
          original_end_time: originalEndTime.toISOString(),
          // Add recurring label if applicable
          title: event.is_recurring 
            ? `${event.title}` 
            : event.title
        };

        console.log(segmentedEvent);

        return (
          <EventCard 
            key={`${event.id}-${day.toISOString()}`} 
            event={segmentedEvent} 
          />
        );
      })
      .filter(Boolean);
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0F14] text-[#E8E2D6] font-sans">
      {/* The header handles changing the reference date without refreshing */}
      <div className="px-6 py-4 flex justify-between items-center relative z-50 bg-[#0D1419] border-b border-[#1E2A36]">
        <CalendarHeader
          referenceDate={referenceDate}
          onChangeDate={setReferenceDate}
        />
      </div>

      {/* Status message */}
      <div className="bg-[#0D1419] p-4 border-b border-[#1E2A36] flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#B8A47C]"></div>
          <span className="text-sm text-[#E8E2D6] font-light">No upcoming meeting</span>
        </div>
        <p className="text-sm text-[#8A8578] font-light">Add a new event to your calendar to get started.</p>
      </div>

      {/* Week day labels */}
      <div className="flex border-b border-[#1E2A36] bg-[#0D1419] text-sm sticky top-0 z-40">
        <div className="w-[72px] flex items-center justify-center px-2 py-4 text-[#8A8578]">
          Time
        </div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`
              flex-1 px-2 py-4 text-center hover:bg-[#1E2A36]/30 cursor-pointer
              ${isSameDay(day, referenceDate) ? "font-medium" : "font-light"}
            `}
          >
            <span className="text-[#8A8578]">{format(day, "EEE")}</span>{" "}
            <span className="text-[#E8E2D6]">{format(day, "d")}</span>
          </div>
        ))}
      </div>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-scroll custom-scrollbar select-none relative z-30">
        <div className="flex flex-1 h-[1440px] cursor-grab active:cursor-grabbing">
          {/* Time labels */}
          <div className="w-[72px] flex-none border-r border-[#1E2A36] sticky left-0 bg-[#0A0F14] z-30">
            {timeSlots.map((hour) => (
              <div key={hour} className="relative h-[60px]">
                <div className="absolute -top-2 right-4 text-sm text-[#8A8578] font-light">
                  {formatTime(hour)}
                </div>
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="flex-1 flex relative z-20">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 border-l border-[#1E2A36]/50 relative"
              >
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-[#1E2A36]/20 relative hover:bg-[#1E2A36]/10 transition-colors duration-150"
                  />
                ))}

                {/* Render events for this day */}
                {getEventsForDay(day, events || [])}
              </div>
            ))}
          </div>
        </div>
        
        {/* Simple footer */}
        <div className="flex w-full border-t border-[#1E2A36]">
          <div className="w-full py-8 text-center bg-gradient-to-b from-[#0A0F14] to-[#0D1419]">
            <div className="text-sm text-[#8A8578] font-light">
              End of calendar view
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}