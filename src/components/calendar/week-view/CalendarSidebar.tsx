"use client";

import { Calendar, Settings, BookOpen, Lightbulb, User } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Badge } from "@/components/shadcn-ui/badge";
import { Separator } from "@/components/shadcn-ui/separator";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";

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
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  const isCalendarPage = pathname === "/calendar";
  const isTutorialPage = pathname === "/tutorial";
  const isCoursesPage = pathname === "/courses";
  const isProfilePage = pathname === "/profile";

  return (
    <div className={`bg-calendar-bg-secondary text-calendar-text-primary h-full flex flex-col ${className}`}>
      {/* User Avatar Section */}
      <div className="p-8 flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-1 bg-calendar-hover border-2 border-calendar-accent-border">
          <AvatarImage src={user?.data?.avatar_url || "/placeholder-avatar.png"} alt="User Avatar" />
          <AvatarFallback className="text-xl font-medium text-calendar-accent-primary">{user?.data?.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium mt-2 text-calendar-text-primary">{user?.data?.username}</h2>
        <Badge variant="outline" className="mt-1 bg-calendar-hover text-calendar-accent-primary border-calendar-accent-border">
          Premium
        </Badge>
      </div>
      
      <Separator className="bg-calendar-hover" />
      
      {/* Navigation Buttons */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-calendar-text-primary hover:text-calendar-hover-light hover:bg-calendar-overlay-hover h-11 ${isProfilePage ? "bg-calendar-overlay-hover" : ""}`}
            onClick={() => router.push("/profile")}
          >
            <User className="text-calendar-accent-primary" size={18} />
            <span className="font-light">Profile</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-calendar-text-primary hover:text-calendar-hover-light hover:bg-calendar-overlay-hover h-11 ${isCalendarPage ? "bg-calendar-overlay-hover" : ""}`}
            onClick={() => router.push("/calendar")}
          >
            <Calendar size={18} className="text-calendar-accent-primary" />
            <span className="font-light">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-calendar-text-primary hover:text-calendar-hover-light hover:bg-calendar-overlay-hover h-11`}
            onClick={() => router.push("/settings")}
          >
            <Lightbulb size={18} className="text-calendar-accent-primary" />
            <span className="font-light">Settings</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-calendar-text-primary hover:text-calendar-hover-light hover:bg-calendar-overlay-hover h-11 ${isCoursesPage ? "bg-calendar-overlay-hover" : ""}`}
            onClick={() => router.push("/courses")}
          >
            <BookOpen className="text-calendar-accent-primary" size={18} />
            <span className="font-light">Courses</span>
          </Button>
        </nav>
      </div>
      
      {/* Learning & Tutorial Buttons */}
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          className={`w-full justify-start gap-3 bg-transparent border-calendar-hover hover:bg-calendar-overlay-hover hover:text-calendar-hover-light h-11 text-calendar-text-primary ${isTutorialPage ? "bg-calendar-overlay-hover" : ""}`}
          onClick={() => router.push("/tutorial")}
        >
          <BookOpen size={18} className="text-calendar-accent-primary" />
          <span className="font-light">Tutorial</span>
        </Button>
      </div>
    </div>
  );
}