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
  const initialTop = getHours(event.start) * 80 + getMinutes(event.start);
  const initialDuration = differenceInMinutes(event.end, event.start) * 4 / 3;

  // Calculate the current top and height for styling.
  const topStyle = initialTop;
  const heightStyle = initialDuration;

  // Map Google Calendar color IDs to actual colors
  const colorMap: { [key: string]: string } = {
    '1': '#7986cb', // Lavender
    '2': '#33b679', // Sage
    '3': '#8e24aa', // Grape
    '4': '#e67c73', // Flamingo
    '5': '#f6c026', // Banana
    '6': '#f5511d', // Tangerine
    '7': '#039be5', // Peacock
    '8': '#616161', // Graphite
    '9': '#3f51b5', // Blueberry
    '10': '#0b8043', // Basil
    '11': '#d60000', // Tomato
  };

  const eventColor = colorMap[event.color] || '#039be5'; // Default to Peacock if color not found

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
        <div className="text-[14px] leading-4 text-gray-200 mb-1.5">{event.title}</div>
        <div className="font-sans text-xs text-gray-400">
          {format(event.start, 'h:mm')} - {format(event.end, 'h:mm a')}
        </div>
      </div>
    </div>
  );
};