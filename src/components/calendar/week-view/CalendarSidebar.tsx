"use client";

import { useState } from "react";
import { GoogleLinkButton } from "@/components/account/GoogleLinkButton";
import { Plus } from "lucide-react";
import { CreateEventModal } from "./components/create-event-modal/CreateEventModal";
import { Button } from "@/components/ui/button";

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
      <div className={`bg-[#1A1A1A] text-gray-300 p-4 flex flex-col-reverse gap-4 ${className}`}>
        {/* Google Account Linking Button */}
        <GoogleLinkButton />

        {/* Create Event Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="text-gray-300 bg-black border-gray-400"
        >
          <span>Create Event</span>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}