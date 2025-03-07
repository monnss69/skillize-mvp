"use client";

import { useState } from "react";
import { Calendar, Settings, BookOpen, Lightbulb, User, Plus } from "lucide-react";
import { CreateEventModal } from "./components/create-event-modal/create-event-modal";
import { Button } from "@/components/shadcn-ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn-ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Badge } from "@/components/shadcn-ui/badge";
import { Separator } from "@/components/shadcn-ui/separator";
import { useRouter } from "next/navigation";
/**
 * CalendarSidebar Component
 *
 * This component renders the sidebar of the calendar view with a dark theme design,
 * including a user avatar at the top, navigation buttons in the middle, and the Create Event button at the bottom.
 *
 * Props:
 * - className (optional): Additional CSS classes to apply to the sidebar.
 */
export function CalendarSidebar({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <div className={`bg-[#0D1419] text-[#E8E2D6] h-full flex flex-col ${className}`}>
      {/* User Avatar Section */}
      <div className="p-8 flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-1 bg-[#1E2A36] border-2 border-[#B8A47C]/20">
          <AvatarImage src="/placeholder-avatar.png" alt="User Avatar" />
          <AvatarFallback className="text-xl font-medium text-[#B8A47C]">UN</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium mt-2 text-[#E8E2D6]">USERNAME</h2>
        <Badge variant="outline" className="mt-1 bg-[#1E2A36] text-[#B8A47C] border-[#B8A47C]/30">
          Premium
        </Badge>
      </div>
      
      <Separator className="bg-[#1E2A36]" />
      
      {/* Navigation Buttons */}
      <div className="flex-1 p-5">
        <nav className="space-y-1 mt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-[#B8A47C] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/50 h-11"
          >
            <User size={18} />
            <span className="font-light">Profile</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-[#E8E2D6] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/50 h-11 bg-[#1E2A36]/30"
          >
            <Calendar size={18} className="text-[#B8A47C]" />
            <span className="font-light">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-[#E8E2D6] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/50 h-11"
            onClick={() => router.push("/settings")}
          >
            <Settings size={18} />
            <span className="font-light">Settings</span>
          </Button>
        </nav>
      </div>
      
      {/* Learning & Tutorial Buttons */}
      <div className="p-5 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-transparent border-[#1E2A36] hover:bg-[#1E2A36]/50 hover:text-[#D4C8A8] h-11 text-[#E8E2D6]"
        >
          <Lightbulb size={18} className="text-[#B8A47C]" />
          <span className="font-light">Learn a new skill</span>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-transparent border-[#1E2A36] hover:bg-[#1E2A36]/50 hover:text-[#D4C8A8] h-11 text-[#E8E2D6]"
        >
          <BookOpen size={18} className="text-[#B8A47C]" />
          <span className="font-light">Tutorial</span>
        </Button>
      </div>
    </div>
  );
}