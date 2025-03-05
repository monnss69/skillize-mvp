"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react"
import { ChevronUp, ChevronDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  className?: string
  error?: boolean
}

/**
 * A custom time picker component that supports 12-hour format with AM/PM selection
 * The dropdown pushes content below it rather than overlapping
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, value, onChange, error, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [hours, setHours] = useState<number>(12)
    const [minutes, setMinutes] = useState<number>(0)
    const [period, setPeriod] = useState<"AM" | "PM">("AM")
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Parse the input value on mount and when value changes
    useEffect(() => {
      if (value) {
        try {
          // Handle different time formats
          let periodValue: "AM" | "PM" = "AM"
          
          // Handle 24-hour format like "14:30"
          if (value.includes(":") && !value.includes(" ")) {
            const [hoursStr, minutesStr] = value.split(":")
            const hoursNum = parseInt(hoursStr, 10)
            
            if (hoursNum >= 12) {
              periodValue = "PM"
              setHours(hoursNum === 12 ? 12 : hoursNum - 12)
            } else {
              setHours(hoursNum === 0 ? 12 : hoursNum)
              periodValue = "AM"
            }
            
            setMinutes(parseInt(minutesStr, 10))
            setPeriod(periodValue)
          } 
          // Handle format like "2 : 30 PM"
          else if (value.includes(":") && (value.includes("AM") || value.includes("PM"))) {
            const parts = value.replace(/\s+/g, " ").split(" ")
            if (parts.length >= 3) {
              setHours(parseInt(parts[0], 10))
              setMinutes(parseInt(parts[2], 10))
              setPeriod(parts[parts.length - 1] as "AM" | "PM")
            }
          }
        } catch (e) {
          console.error("Error parsing time value:", e)
        }
      }
    }, [value])

    // Format time as a string in different formats
    const formatTimeString = useCallback((format: "12h" | "24h" = "12h") => {
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
      
      if (format === "24h") {
        let hours24 = hours
        if (period === "PM" && hours !== 12) {
          hours24 = hours + 12
        } else if (period === "AM" && hours === 12) {
          hours24 = 0
        }
        return `${hours24 < 10 ? `0${hours24}` : hours24}:${formattedMinutes}`
      }
      
      return `${hours} : ${formattedMinutes}`
    }, [hours, minutes, period]);

    // Update the input value when time changes - now just closes the dropdown
    const closeDropdown = useCallback(() => {
      setIsOpen(false)
    }, []);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          isOpen // Only close when dropdown is open
        ) {
          closeDropdown();
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isOpen, closeDropdown])

    // Handle time increment/decrement
    const incrementHours = () => {
      setHours((prev) => (prev === 12 ? 1 : prev + 1))
    }

    const decrementHours = () => {
      setHours((prev) => (prev === 1 ? 12 : prev - 1))
    }

    const incrementMinutes = () => {
      setMinutes((prev) => (prev === 59 ? 0 : prev + 1))
    }

    const decrementMinutes = () => {
      setMinutes((prev) => (prev === 0 ? 59 : prev - 1))
    }

    const togglePeriod = (newPeriod: "AM" | "PM") => {
      setPeriod(newPeriod)
    }

    // Add a new effect to automatically call onChange when time components change
    useEffect(() => {
      // Only update the value if the dropdown is open (user is actively selecting)
      // and there's an onChange callback available
      if (isOpen && onChange) {
        // This updates the parent component value in real-time as the user makes selections
        const timeString = formatTimeString("24h")
        onChange(timeString)
      }
    }, [hours, minutes, period, isOpen, onChange, formatTimeString])

    return (
      <div className="w-full">
        <div
          ref={inputRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex items-center h-10 w-full rounded-md border bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6] px-3 py-2 text-sm",
            "focus-within:outline-none focus-within:ring-1 focus-within:ring-[#B8A47C] focus-within:border-[#B8A47C]",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-red-400 focus-within:ring-red-400 focus-within:border-red-400",
            className
          )}
        >
          <input
            ref={ref}
            type="text"
            readOnly
            value={value ? `${formatTimeString("12h")} ${period}` : ""}
            placeholder={hours ? `${formatTimeString("12h")} ${period}` : "Select time"}
            className="flex-1 bg-transparent outline-none text-[#E8E2D6] placeholder:text-[#6B7280]"
            disabled={disabled}
            {...props}
          />
          <Clock className="h-4 w-4 text-[#B8A47C]" />
        </div>

        {/* Dropdown that pushes content down instead of overlapping */}
        <div 
          className={cn(
            "w-2/5 overflow-hidden transition-all duration-700 ease-in-out",
            isOpen && !disabled ? "max-h-[250px] opacity-100 mt-2 mb-4 border border-[#2A3A4A] rounded-md bg-[#1E2A36]" : "max-h-0 opacity-0"
          )}
        >
          <div
            ref={dropdownRef}
            className={cn(
              "w-full",
              isOpen && !disabled ? "visible" : "invisible"
            )}
          >
            <div className="p-3 grid grid-cols-3 gap-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementHours}
                  className="p-1 text-[#E8E2D6] hover:text-[#B8A47C] transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className="text-2xl font-light py-1 text-[#E8E2D6]">{hours}</span>
                <button
                  type="button"
                  onClick={decrementHours}
                  className="p-1 text-[#E8E2D6] hover:text-[#B8A47C] transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Separator */}
              <div className="flex items-center justify-center">
                <span className="text-2xl font-light text-[#E8E2D6]">:</span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementMinutes}
                  className="p-1 text-[#E8E2D6] hover:text-[#B8A47C] transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className="text-2xl font-light py-1 text-[#E8E2D6]">
                  {minutes < 10 ? `0${minutes}` : minutes}
                </span>
                <button
                  type="button"
                  onClick={decrementMinutes}
                  className="p-1 text-[#E8E2D6] hover:text-[#B8A47C] transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* AM/PM Toggle */}
            <div className="grid grid-cols-2 mx-3 mb-3 rounded-md overflow-hidden border border-[#2A3A4A]">
              <button
                type="button"
                onClick={() => togglePeriod("AM")}
                className={cn(
                  "py-1 px-2 text-center transition-colors",
                  period === "AM"
                    ? "bg-[#B8A47C]/20 text-[#B8A47C] font-medium"
                    : "text-[#E8E2D6] hover:bg-[#2A3A4A]"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => togglePeriod("PM")}
                className={cn(
                  "py-1 px-2 text-center transition-colors",
                  period === "PM"
                    ? "bg-[#B8A47C]/20 text-[#B8A47C] font-medium"
                    : "text-[#E8E2D6] hover:bg-[#2A3A4A]"
                )}
              >
                PM
              </button>
            </div>

            {/* Confirm button */}
            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={closeDropdown}
                className="w-full py-1.5 px-3 rounded-md bg-[#B8A47C] text-black hover:bg-[#A89567] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

TimePicker.displayName = "TimePicker" 