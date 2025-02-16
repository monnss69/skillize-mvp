"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { ChromePicker } from "react-color";
import { useSession } from "next-auth/react";
import { createEvent } from "./actions";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { data: session } = useSession();
  
  // Initialize eventData with a callback to ensure we get the latest userId
  const [eventData, setEventData] = useState(() => ({
    userId: session?.user?.id ?? "", // Provide a fallback empty string
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    color: "#039be5",
  }));

  // Update userId when session changes
  useEffect(() => {
    if (session?.user?.id) {
      setEventData((prev: any) => ({
        ...prev,
        userId: session.user.id
      }));
    }
  }, [session]);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      await createEvent(formData);
      onClose(); // Close the modal after successful creation
      window.location.reload(); // Refresh the page
    } catch (error: any) {
      setError(error.message || 'Failed to create event');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={eventData.userId} />
          
          <div>
            <label className="block text-gray-300 mb-2">Title</label>
            <input
              name="title"
              type="text"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white h-24"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Start Time</label>
              <input
                name="start_time"
                type="datetime-local"
                value={eventData.start_time}
                onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">End Time</label>
              <input
                name="end_time"
                type="datetime-local"
                value={eventData.end_time}
                onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Color</label>
            <input 
              type="hidden" 
              name="color" 
              value={eventData.color} 
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white flex items-center gap-2"
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: eventData.color }}
                />
                <span>{eventData.color}</span>
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 z-10">
                  <ChromePicker
                    color={eventData.color}
                    onChange={(color: any) => setEventData({ ...eventData, color: color.hex })}
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}