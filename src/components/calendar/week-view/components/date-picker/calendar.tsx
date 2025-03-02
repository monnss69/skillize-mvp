"use client"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/shadcn-ui/button"
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
        [UI.CaptionLabel]: "text-sm font-medium text-[#E8E2D6]",
        [UI.Nav]: "absolute right-0 -mt-0.5 mr-4 flex items-center space-x-1",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "w-7 h-7 bg-transparent p-0 text-[#E8E2D6] hover:bg-[#1E2A36]/50 border-[#1E2A36]"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "w-7 h-7 bg-transparent p-0 text-[#E8E2D6] hover:bg-[#1E2A36]/50 border-[#1E2A36]"
        ),
        
        // Calendar grid section
        [UI.MonthGrid]: "w-full border-collapse",
        [UI.Weekdays]: "grid grid-cols-7",
        [UI.Weekday]: "text-[#8A8578] text-sm font-medium h-8 flex items-center justify-center",
        [UI.Week]: "grid grid-cols-7",
        
        // Day styling
        [UI.Day]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-[#E8E2D6] hover:bg-[#1E2A36]/50 aria-selected:opacity-100"
        ),
        
        // Day states using DayFlag enum
        [DayFlag.today]: "bg-[#1E2A36]/50 text-[#E8E2D6] border border-[#B8A47C]/20",
        [DayFlag.outside]: "text-[#8A8578] opacity-50",
        [DayFlag.disabled]: "text-[#8A8578] opacity-50",
        [DayFlag.hidden]: "invisible",
        
        // Selection states using SelectionState enum
        [SelectionState.selected]: "bg-[#B8A47C] text-[#0A0F14] hover:bg-[#D4C8A8]",
        [SelectionState.range_start]: "rounded-l-md",
        [SelectionState.range_end]: "rounded-r-md",
        [SelectionState.range_middle]: "bg-[#B8A47C]/50 text-[#E8E2D6]",
        
        ...classNames,
      }}
      components={{
        PreviousMonthButton: (props) => (
          <button {...props}>
            <ChevronLeft className="h-4 w-4" />
          </button>
        ),
        NextMonthButton: (props) => (
          <button {...props}>
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }