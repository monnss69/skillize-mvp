"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function CalendarHeader() {
    const currentDate = new Date();

    return (
        <div className="flex items-center justify-between">
            <div className="text-2xl font-bold flex items-center gap-2">
                {format(currentDate, "MMMM")} {"  "}
                <span className="text-2xl font-normal">

                {format(currentDate, "yyyy")}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-700">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700">
                <ChevronRight className="w-4 h-4" />
            </button>
            </div>
        </div>
    )
}