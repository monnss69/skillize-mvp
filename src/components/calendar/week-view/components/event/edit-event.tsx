"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/shadcn-ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { Input } from "@/components/shadcn-ui/input"
import { Label } from "@/components/shadcn-ui/label"
import { Textarea } from "@/components/shadcn-ui/textarea"
import { toast } from "sonner"
import { Event } from "@/types"
import { format } from "date-fns"
import { Calendar, Clock, Info, Tag, Type, AlignLeft } from "lucide-react"
import { DateTimePicker } from "@/components/calendar/week-view/components/date-picker/date-picker"

interface EditEventProps {
  event: Event & {
    original_start_time: string
    original_end_time: string
  }
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventData: {
    id: string
    title: string
    description: string | null
    start_time: string
    end_time: string
    color: string | null
  }) => void
}

export default function EditEvent({ event, isOpen, onClose, onSubmit }: EditEventProps) {
  const [formData, setFormData] = useState({
    id: event?.id || "",
    title: event?.title || "",
    description: event?.description || "",
    start_time: event?.original_start_time || "",
    end_time: event?.original_end_time || "",
    color: event?.color || "#B8A47C",
  })
  
  const [activeField, setActiveField] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  // When the event changes, update the form data
  useMemo(() => {
    if (event) {
      // Format the dates for datetime-local input
      const formatDateForInput = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date
        return format(d, "yyyy-MM-dd'T'HH:mm")
      }

      setFormData({
        id: event.id,
        title: event.title,
        description: event.description || "",
        start_time: formatDateForInput(event.original_start_time),
        end_time: formatDateForInput(event.original_end_time),
        color: event.color || "#B8A47C",
      })
    }
  }, [event])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  
  const handleFocus = (fieldName: string) => {
    setActiveField(fieldName)
  }

  const handleBlur = () => {
    setActiveField(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!formData.start_time || !formData.end_time) {
      toast.error("Start and end times are required")
      return
    }

    // Call the onSubmit handler with the form data
    onSubmit({
      id: formData.id,
      title: formData.title,
      description: formData.description as string | null,
      start_time: formData.start_time,
      end_time: formData.end_time,
      color: formData.color as string | null,
    })

    // Close the form
    onClose()
  }

  if (!isOpen) return null

  // Hardcoded color values
  const goldColor = "#B8A47C"
  const goldColorLight = "#D4C9A8"
  const darkBg = "#121418"
  const darkBgLight = "#1A1D23"

  return (
    <Card
      className={`w-full max-w-lg mx-auto glass-effect rounded-xl overflow-hidden z-50 ${animateIn ? "animate-fade-in" : "opacity-0"}`}
      style={{
        backgroundColor: darkBg,
        borderColor: `${goldColor}20`,
        boxShadow: `0 10px 30px -10px rgba(0,0,0,0.3), 0 1px 2px rgba(${Number.parseInt(goldColor.slice(1, 3), 16)}, ${Number.parseInt(goldColor.slice(3, 5), 16)}, ${Number.parseInt(goldColor.slice(5, 7), 16)}, 0.05)`,
      }}
    >
      <CardHeader className="pb-4">
        <div
          className="h-1 w-20 mb-4 rounded-full"
          style={{ background: `linear-gradient(90deg, ${goldColor}, ${goldColorLight})` }}
        />
        <CardTitle className="text-2xl font-light tracking-tight" style={{ color: goldColor }}>
          Edit Event
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: `${goldColor}99` }}
            >
              <Type size={12} style={{ color: goldColor }} />
              Title
            </Label>
            <div className="relative text-slate-200">
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onFocus={() => handleFocus("title")}
                onBlur={handleBlur}
                placeholder="Enter event title"
                required
                className="pl-8 transition-all duration-200 text-sm"
                style={{
                  backgroundColor: activeField === "title" ? `${darkBgLight}` : `${darkBgLight}90`,
                  borderColor: activeField === "title" ? goldColor : `${goldColor}20`,
                  boxShadow: activeField === "title" ? `0 0 0 1px ${goldColor}40` : "none",
                  color: goldColorLight,
                }}
              />
              <Type className="absolute left-2.5 top-1/2 -translate-y-1/2" size={14} style={{ color: goldColor }} />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: `${goldColor}99` }}
            >
              <AlignLeft size={12} style={{ color: goldColor }} />
              Description
            </Label>
            <div className="relative">
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => handleFocus("description")}
                onBlur={handleBlur}
                placeholder="Enter event description"
                rows={3}
                className="pl-8 pt-2 transition-all duration-200 text-sm resize-none"
                style={{
                  backgroundColor: activeField === "description" ? `${darkBgLight}` : `${darkBgLight}90`,
                  borderColor: activeField === "description" ? goldColor : `${goldColor}20`,
                  boxShadow: activeField === "description" ? `0 0 0 1px ${goldColor}40` : "none",
                  color: goldColorLight,
                }}
              />
              <AlignLeft className="absolute left-2.5 top-3" size={14} style={{ color: goldColor }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="space-y-2">
              <Label
                htmlFor="start_time"
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: `${goldColor}99` }}
              >
                <Calendar size={12} style={{ color: goldColor }} />
                Start Time
              </Label>
              <DateTimePicker
                label="Select start time"
                initialDate={formData.start_time ? new Date(formData.start_time) : undefined}
                onChange={(date) => {
                  if (date) {
                    const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
                    setFormData({
                      ...formData,
                      start_time: formattedDate
                    });
                  }
                }}
                className={`bg-[${darkBgLight}] border-[${goldColorLight}] z-[60]`}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="end_time"
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: `${goldColor}99` }}
              >
                <Calendar size={12} style={{ color: goldColor }} />
                End Time
              </Label>
              <DateTimePicker
                label="Select end time"
                initialDate={formData.end_time ? new Date(formData.end_time) : undefined}
                onChange={(date) => {
                  if (date) {
                    const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
                    setFormData({
                      ...formData,
                      end_time: formattedDate
                    });
                  }
                }}
                className={`bg-[${darkBgLight}] border-[${goldColorLight}] z-[60]`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="color"
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: `${goldColor}99` }}
            >
              <Clock size={12} style={{ color: goldColor }} />
              Event Color
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="relative w-16 h-10 rounded-md overflow-hidden"
                style={{
                  border: `1px solid ${goldColor}20`,
                  padding: "2px",
                }}
              >
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  onFocus={() => handleFocus("color")}
                  onBlur={handleBlur}
                  className="w-full h-full p-0 border-0"
                />
              </div>
              <Input
                name="color"
                value={formData.color}
                onChange={handleChange}
                onFocus={() => handleFocus("color_text")}
                onBlur={handleBlur}
                placeholder="#000000"
                className="flex-1 transition-all duration-200 text-sm"
                style={{
                  backgroundColor: activeField === "color_text" ? `${darkBgLight}` : `${darkBgLight}90`,
                  borderColor: activeField === "color_text" ? goldColor : `${goldColor}20`,
                  boxShadow: activeField === "color_text" ? `0 0 0 1px ${goldColor}40` : "none",
                  color: goldColorLight,
                }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter
          className="flex justify-end space-x-3 pt-2 pb-6 animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="transition-all duration-200"
            style={{
              borderColor: `${goldColor}30`,
              color: "#121418",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${goldColor} 0%, ${goldColorLight} 50%, ${goldColor} 100%)`,
              color: "#121418",
              fontWeight: 500,
            }}
          >
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
