"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { format, addWeeks, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { CreateEventModal } from "../create-event-modal/CreateEventModal";

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
          className="text-[#B8A47C] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/30 h-10 w-10"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-light tracking-wide text-[#E8E2D6]">
          {format(referenceDate, "MMMM yyyy")}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="text-[#B8A47C] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/30 h-10 w-10"
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
          className="border-[#1E2A36] bg-transparent hover:bg-[#1E2A36]/50 hover:text-[#D4C8A8] h-11 w-full px-4 text-[#E8E2D6] font-light"
        >
          <Clock className="h-5 w-5 text-[#B8A47C]" />
          Today
        </Button>
        
        {/* Create Event Button - Updated to show modal in center */}
        <div className="p-5">
          <Button 
            onClick={() => setCreateEventOpen(true)}
            className="w-full bg-[#B8A47C] hover:bg-[#D4C8A8] text-[#0A0F14] h-11 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>New Event</span>
          </Button>
          
          {/* Modal displayed in center when open */}
          {createEventOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
