import React, { Suspense } from "react";
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
    <Suspense fallback={<Loading />}>
      <WeekGridClient />
    </Suspense>
  );
}

export default CalendarPage;