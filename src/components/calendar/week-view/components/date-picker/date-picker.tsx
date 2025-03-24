"use client";
 
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn-ui/button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { ScrollArea, ScrollBar } from "@/components/shadcn-ui/scroll-area";
 
/**
 * Props for the DateTimePicker component.
 */
interface DateTimePickerProps {
  label: string;
  onChange: (date: Date | undefined) => void;
  initialDate?: Date;
  showTimeIndicator?: boolean;
  className?: string;
}

/**
 * DateTimePicker Component
 *
 * A combined date and time picker component.
 *
 * Props:
 * - label: The label for the date picker.
 * - onChange: Function to handle date changes.
 * - initialDate: Optional initial date to display.
 * - showTimeIndicator: Whether to show a line indicating the current time.
 */
export function DateTimePicker({ 
  label, 
  onChange, 
  initialDate,
  className,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
 
  const hours = [12, ...Array.from({ length: 11 }, (_, i) => i + 1)];

  // Update current time every minute when popover is open
  React.useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [isOpen]);
 
  /**
   * Handles the selection of a date from the calendar.
   * @param selectedDate The selected date.
   */
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (date) {
        // Preserve the time from the current date
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
      }
      setDate(newDate);
      onChange(newDate);
    }
  };

  /**
   * Handles the change of the time.
   * @param type The type of time to change.
   * @param value The value of the time to change.
   */
  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    if (!date) return;

    const newDate = new Date(date);
    
    if (type === "hour") {
      const hour = parseInt(value);
      const isPM = newDate.getHours() >= 12;
      if (hour === 12) {
        // Keep 12 PM as 12, convert 12 AM to 0
        newDate.setHours(isPM ? 12 : 0);
      } else {
        // For other hours, add 12 if PM
        newDate.setHours(isPM ? hour + 12 : hour);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      const hour = currentHours % 12;
      
      if (value === "PM") {
        if (currentHours < 12) {
          // Convert to PM by adding 12, except for 12 PM
          newDate.setHours(hour === 0 ? 12 : currentHours + 12);
        }
      } else { // AM
        if (currentHours >= 12) {
          // Convert to AM by subtracting 12, except for 12 AM
          newDate.setHours(hour === 0 ? 0 : hour);
        }
      }
    }

    setDate(newDate);
    onChange(newDate);
  };

  // Get the corresponding hour or minute values with styling
  const getTimeItemClass = (type: "hour" | "minute" | "ampm", value: string) => {
    if (!date) return "";
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const isAM = hours < 12;
    
    if (type === "hour") {
      const hour = parseInt(value);
      const currentHour = hours % 12 || 12;
      return hour === currentHour ? "bg-[#1E2A36] text-[#E8E2D6]" : "";
    } else if (type === "minute") {
      const minute = parseInt(value);
      return minute === minutes ? "bg-[#1E2A36] text-[#E8E2D6]" : "";
    } else if (type === "ampm") {
      return (value === "AM" && isAM) || (value === "PM" && !isAM) 
        ? "bg-[#1E2A36] text-[#E8E2D6]" 
        : "";
    }
    return "";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-[#E8E2D6]",
            !date && "text-[#8A8578]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#B8A47C]" />
          {date ? (
            <span>{format(date, "MM/dd/yyyy hh:mm aa")}</span>
          ) : (
            <span>{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)}>
        <div className="sm:flex">
          <div className="relative">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              autoFocus
              className="bg-[#0D1419]"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:h-[270px] divide-y sm:divide-y-0 sm:divide-x divide-[#1E2A36]">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "sm:w-full shrink-0 aspect-square text-[#E8E2D6] hover:bg-[#1E2A36]/50",
                      getTimeItemClass("hour", hour.toString())
                    )}
                    onClick={() => handleTimeChange("hour", hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "sm:w-full shrink-0 aspect-square text-[#E8E2D6] hover:bg-[#1E2A36]/50",
                      getTimeItemClass("minute", minute.toString())
                    )}
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                  {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "sm:w-full shrink-0 aspect-square text-[#E8E2D6] hover:bg-[#1E2A36]/50",
                      getTimeItemClass("ampm", ampm)
                    )}
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}