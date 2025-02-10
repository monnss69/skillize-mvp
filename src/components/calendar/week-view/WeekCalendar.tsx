import React from 'react';
import { CalendarSidebar } from './CalendarSidebar';
import { ActionPanel } from './ActionPanel';
import { WeekGrid } from './WeekGrid';

export function WeekCalendar() {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <CalendarSidebar className="w-[18.44vw] border-r border-[#303030]" />
      <WeekGrid />
      <ActionPanel className="w-[18.06vw] border-l border-[#303030] border-border" />
    </div>
  );
}