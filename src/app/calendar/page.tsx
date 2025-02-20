import React, { Suspense } from "react";
import { CalendarSidebar } from "@/components/calendar/week-view/CalendarSidebar";
import { ActionPanel } from "@/components/calendar/week-view/ActionPanel";
import { syncCalendar } from "./actions";
import { WeekGridClient } from "@/components/calendar/week-view/WeekGridClient";
import Loading from "./loading";  
// Server component
const CalendarPage = async () => {
  try {
    await syncCalendar();
  } catch (error) {
    console.error('Failed to sync calendar:', error);
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <CalendarSidebar className="w-[18.44vw] border-r border-[#303030]" />
      <Suspense fallback={<Loading />}>
        <WeekGridClient />
      </Suspense>
      <ActionPanel className="w-[18.06vw] border-l border-[#303030] border-border" />
    </div>
  );
}

export default CalendarPage;