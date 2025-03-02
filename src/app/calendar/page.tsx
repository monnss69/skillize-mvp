import React, { Suspense } from "react";
import { CalendarSidebar } from "@/components/calendar/week-view/CalendarSidebar";
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0F14]">
      <CalendarSidebar className="w-1/6 border-r border-[#1E2A36]" />
      <Suspense fallback={<Loading />}>
        <WeekGridClient />
      </Suspense>
    </div>
  );
}

export default CalendarPage;