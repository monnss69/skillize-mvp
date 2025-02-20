import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import {
  format,
  differenceInMinutes,
  getHours,
  getMinutes
} from 'date-fns';

interface EventCardProps {
  event: CalendarEvent;
}

export default function EventCard({ event }: EventCardProps) {
  // Compute the initial top (in minutes from midnight) and duration (in minutes)
  const initialTop = getHours(event.start_time) * 60 + getMinutes(event.start_time);
  const initialDuration = differenceInMinutes(event.end_time, event.start_time);

  // Calculate the current top and height for styling.
  const topStyle = initialTop;
  const heightStyle = initialDuration;

  // Use the hex code stored in event.color directly; use a fallback if missing
  const eventColor = event.color || '#039be5'; 

  return (
    <div
      style={{ 
        top: `${topStyle}px`, 
        height: `${heightStyle}px`, 
        borderLeftColor: eventColor,
      }}
      className={`flex flex-col absolute left-0 right-0 mr-1 p-2 rounded-md cursor-move select-none text-sm overflow-hidden border-l-[4.5px]`}
    >
      {/* Background div with opacity */}
      <div 
        style={{ 
          backgroundColor: eventColor,
          opacity: 0.15,
        }}
        className="absolute inset-0 rounded-md"
      />
      
      {/* Content with full opacity */}
      <div className="relative z-10">
        <div className="text-[13px] leading-4 text-gray-200 mb-1">{event.title}</div>
        <div className="font-sans text-xs text-gray-400">
          {format(event.start_time, 'h:mm')} - {format(event.end_time, 'h:mm a')}
        </div>
      </div>
    </div>
  );
};