"use client"
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"
import { UI, DayFlag, SelectionState } from "react-day-picker"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // Root level containers
        [UI.Root]: "w-full space-y-4",
        [UI.Months]: "flex flex-col",
        [UI.Month]: "w-full",
        
        // Header section - updated for horizontal alignment
        [UI.MonthCaption]: "flex ml-1.5 relative mb-1",
        [UI.CaptionLabel]: "text-sm font-medium text-gray-300",
        [UI.Nav]: "absolute right-40 mt-1 mr-4 flex items-center space-x-1",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "w-7 h-7 bg-transparent p-0 text-gray-300 hover:bg-gray-800 border-gray-700"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "w-7 h-7 bg-transparent p-0 text-gray-300 hover:bg-gray-800 border-gray-700"
        ),
        
        // Calendar grid section
        [UI.MonthGrid]: "w-full border-collapse",
        [UI.Weekdays]: "grid grid-cols-7",
        [UI.Weekday]: "text-gray-300 text-sm font-medium h-8 flex items-center justify-center",
        [UI.Week]: "grid grid-cols-7",
        
        // Day styling
        [UI.Day]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-gray-300 hover:bg-gray-800 aria-selected:opacity-100"
        ),
        
        // Day states using DayFlag enum
        [DayFlag.today]: "bg-gray-800 text-gray-300",
        [DayFlag.outside]: "text-gray-500 opacity-50",
        [DayFlag.disabled]: "text-gray-500 opacity-50",
        [DayFlag.hidden]: "invisible",
        
        // Selection states using SelectionState enum
        [SelectionState.selected]: "bg-blue-600 text-white hover:bg-blue-500",
        [SelectionState.range_start]: "rounded-l-md",
        [SelectionState.range_end]: "rounded-r-md",
        [SelectionState.range_middle]: "bg-blue-600/50",
        
        ...classNames,
      }}
      components={{
        PreviousMonthButton: (props) => (
          <button {...props}>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        ),
        NextMonthButton: (props) => (
          <button {...props}>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }