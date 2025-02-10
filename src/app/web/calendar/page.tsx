import React from "react";
import { CalendarSidebar } from "@/components/calendar/week-view/CalendarSidebar";
import { ActionPanel } from "@/components/calendar/week-view/ActionPanel";
import { WeekGridClient } from "@/components/calendar/week-view/WeekGridClient";

export const revalidate = Infinity;

// Server component
export default function CalendarPage() {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <CalendarSidebar className="w-[18.44vw] border-r border-[#303030]" />
      <WeekGridClient />
      <ActionPanel className="w-[18.06vw] border-l border-[#303030] border-border" />
    </div>
  );
}