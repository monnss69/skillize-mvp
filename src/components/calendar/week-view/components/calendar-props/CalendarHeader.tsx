"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { format, addWeeks, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { CreateEventModal } from "../create-event-modal/create-event-modal";

interface CalendarHeaderProps {
  referenceDate: Date;
  onChangeDate: Dispatch<SetStateAction<Date>>;
}

export function CalendarHeader({
  referenceDate,
  onChangeDate,
}: CalendarHeaderProps) {
  const [createEventOpen, setCreateEventOpen] = useState(false);

  function handlePrevWeek() {
    onChangeDate((current) => addWeeks(current, -1));
  }

  function handleNextWeek() {
    onChangeDate((current) => addWeeks(current, 1));
  }

  function handleToday() {
    onChangeDate(startOfToday());
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevWeek}
          className="text-calendar-accent-primary hover:text-calendar-hover-light hover:bg-calendar-overlay-hover h-10 w-10"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-light tracking-wide text-calendar-text-primary">
          {format(referenceDate, "MMMM yyyy")}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="text-calendar-accent-primary hover:text-calendar-hover-light hover:bg-calendar-overlay-hover h-10 w-10"
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </Button>
      </div>
      <div className="flex items-center">
        {/* Today Button */}
        <Button
          variant="outline"
          onClick={handleToday}
          className="border-calendar-hover bg-transparent hover:bg-calendar-overlay-hover hover:text-calendar-hover-light h-11 w-full px-4 text-calendar-text-primary font-light"
        >
          <Clock className="h-5 w-5 text-calendar-accent-primary" />
          Today
        </Button>
        
        {/* Create Event Button - Updated to show modal in center */}
        <div className="p-5">
          <Button 
            onClick={() => setCreateEventOpen(true)}
            className="w-full bg-calendar-accent-primary hover:bg-calendar-hover-light text-calendar-bg-primary h-11 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>New Event</span>
          </Button>
          
          {/* Modal displayed in center when open */}
          {createEventOpen && (
            <div className="fixed inset-0 bg-calendar-overlay flex items-center justify-center z-50">
              <div className="relative">
                <CreateEventModal onClose={() => setCreateEventOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
