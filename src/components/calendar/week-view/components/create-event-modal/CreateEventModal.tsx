"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { createEvent } from "./actions";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/calendar/week-view/components/date-picker/DatePicker";

/**
 * EventData Interface
 *
 * Defines the shape of the event data state.
 */
interface EventData {
  userId: string;
  title: string;
  description: string;
  date: Date | null;
  start_time: string;
  end_time: string;
  color: string;
  showColorPicker: boolean;
}

/**
 * CreateEventModal Component
 *
 * This component renders a modal for creating a new calendar event with an enhanced UI/UX
 * similar to Google/iOS Calendar.
 *
 * Props:
 * - isOpen: Boolean indicating if the modal is open.
 * - onClose: Function to call when closing the modal.
 */
export function CreateEventModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();

  /**
   * State to manage event data.
   */
  const [eventData, setEventData] = useState<EventData>({
    userId: session?.user?.id ?? "", // Provide a fallback empty string
    title: "",
    description: "",
    date: null,
    start_time: "",
    end_time: "",
    color: "#2d3748", // Default dark color
    showColorPicker: false,
  });

  /**
   * Update userId when session changes.
   */
  useEffect(() => {
    if (session?.user?.id) {
      setEventData((prev) => ({
        ...prev,
        userId: session.user.id ?? "",
      }));
    }
  }, [session]);

  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission to create a new event.
   * @param e The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that a date is selected
    if (!eventData.date) {
      setError("Please select a date.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", eventData.userId);
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("date", format(eventData.date, "yyyy-MM-dd"));
      formData.append("start_time", eventData.start_time);
      formData.append("end_time", eventData.end_time);
      formData.append("color", eventData.color);

      await createEvent(formData);
      onClose(); // Close the modal after successful creation
      window.location.reload(); // Refresh the page
    } catch (error: any) {
      setError(error.message || "Failed to create event");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Event Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={eventData.title}
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Event description"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <DateTimePicker 
              label="Start Time"
              onChange={(date: Date | undefined) => {
                if (date) {
                  setEventData(prev => ({
                    ...prev,
                    start_time: date.toISOString(),
                    date: date, // Ensure the date is set
                  }));
                }
              }}
            />
            <DateTimePicker 
              label="End Time"
              onChange={(date: Date | undefined) => {
                if (date) {
                  setEventData(prev => ({
                    ...prev,
                    end_time: date.toISOString(),
                    date: date, // Ensure the date is set
                  }));
                }
              }}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="color">
              Color
            </label>
            <div className="flex items-center space-x-4">
              <div
                className="w-8 h-8 rounded-full border border-gray-600 cursor-pointer"
                style={{ backgroundColor: eventData.color }}
                onClick={() =>
                  setEventData({ ...eventData, showColorPicker: !eventData.showColorPicker })
                }
                aria-label="Choose event color"
              />
              <span className="text-gray-300">{eventData.color}</span>
            </div>
            <CustomColorPicker
              color={eventData.color}
              onChange={(color) => setEventData({ ...eventData, color })}
              isOpen={eventData.showColorPicker}
              onClose={() =>
                setEventData({ ...eventData, showColorPicker: false })
              }
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}