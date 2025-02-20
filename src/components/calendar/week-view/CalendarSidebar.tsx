"use client";

import { useState } from "react";
import { GoogleLinkButton } from "@/components/account/GoogleLinkButton";
import { Plus } from "lucide-react";
import { CreateEventModal } from "./components/create-event-modal/CreateEventModal";
import SidebarButton from "@/components/ui/SidebarButton";

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
        <SidebarButton
          onClick={() => setIsModalOpen(true)}
        >
          <span>Create Event</span>
          <Plus className="h-5 w-5" />
        </SidebarButton>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}