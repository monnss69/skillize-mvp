"use client";

import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  addDays,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  subDays
} from "date-fns";

export function MiniCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
  
    // Get the first day of the month
    const firstDayOfMonth = startOfMonth(currentDate);
    // Calculate how many days from the previous month we need to show
    const daysFromPreviousMonth = firstDayOfMonth.getDay();
    // Calculate the start date by subtracting the required days
    const calendarStartDate = subDays(firstDayOfMonth, daysFromPreviousMonth);
  
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="select-none">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {/* Day headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-gray-400 pb-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {eachDayOfInterval({
          start: calendarStartDate,
          end: addDays(calendarStartDate, 34)
        }).map((date) => {
          const isToday = isSameDay(date, new Date());
          const isCurrentMonth = isSameMonth(date, currentDate);

          return (
            <button
              key={date.toString()}
              className={`
                py-1.5 rounded-sm relative text-sm
                ${!isCurrentMonth ? "text-neutral-700" : "text-white"}
                ${isToday ? "bg-[#F15550] hover:bg-[#912c29]" : "hover:bg-neutral-800"}
              `}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Simple chevron icons components
function ChevronLeft({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 19l-7-7 7-7" 
      />
    </svg>
  );
}

function ChevronRight({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 5l7 7-7 7" 
      />
    </svg>
  );
}