"use client";

import { useState } from "react";
import { GoogleLinkButton } from "@/components/account/GoogleLinkButton";
import { Plus } from "lucide-react";
import { CreateEventModal } from "./components/CreateEventModal/CreateEventModal";

/**
 * CalendarSidebar Component
 *
 * This component renders the sidebar of the calendar view, including
 * the Google account linking button and the Create Event button.
 *
 * Props:
 * - className (optional): Additional CSS classes to apply to the sidebar.
 */
export function CalendarSidebar({ className }: { className?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`bg-[#1A1A1A] text-gray-300 p-4 flex flex-col gap-4 ${className}`}>
        {/* Google Account Linking Button */}
        <GoogleLinkButton />

        {/* Create Event Button */}
        <button
          className="
            flex items-center justify-between
            px-4 py-3 rounded-lg
            bg-gradient-to-r from-blue-500 to-purple-600
            hover:from-blue-600 hover:to-purple-700
            text-white font-medium
            transition-all duration-200 ease-in-out
            shadow-lg hover:shadow-xl
          "
          onClick={() => setIsModalOpen(true)}
        >
          <span>Create Event</span>
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}