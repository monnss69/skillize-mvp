"use client";

import { Dispatch, SetStateAction } from "react";
import { format, addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  referenceDate: Date;
  onChangeDate: Dispatch<SetStateAction<Date>>;
}

export function CalendarHeader({ referenceDate, onChangeDate }: CalendarHeaderProps) {
  function handlePrevWeek() {
    onChangeDate((current) => addWeeks(current, -1));
  }

  function handleNextWeek() {
    onChangeDate((current) => addWeeks(current, 1));
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-2xl font-bold flex items-center gap-2">
        {format(referenceDate, "MMMM")}{" "}
        <span className="text-2xl font-normal">
          {format(referenceDate, "yyyy")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-full hover:bg-gray-700"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-full hover:bg-gray-700"
          aria-label="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}