import React, { useState } from "react";
import { format, differenceInMinutes, getHours, getMinutes } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shadcn-ui/card";
import { Event } from "@/types";
import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";
import { addRecurrenceException, deleteEvent, editEvent } from "@/lib/actions/calendar";
import { Edit } from "lucide-react";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "./delete-dialog";
import EditEvent from "./edit-event";
import { createPortal } from "react-dom";

interface EventCardProps {
  event: Event & {
    isSegment?: boolean;
    isStart?: boolean;
    isEnd?: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const startMinutes =
    getHours(event.start_time) * 60 + getMinutes(event.start_time);

  // Cap the height at the end of the current day (24 hours * 60 minutes = 1440)
  const maxMinutesInDay = 1440;
  const heightStyle = Math.min(
    differenceInMinutes(event.end_time, event.start_time),
    maxMinutesInDay - startMinutes // Ensure we don't exceed the day boundary
  );

  const dayOfWeek = new Date(event.start_time).getDay();

  // For Friday (5) and Saturday (6), show popover on the left
  const popoverSide = dayOfWeek >= 5 ? "left" : "right";

  const eventColor = event.color || "#039be5";

  const handleDelete = async (deleteAllFuture = false) => {
    if (event.is_recurring) {
      if (deleteAllFuture) {
        const result = await deleteEvent(event.id.split("-recurring-")[0]);

        if (result.success) {
          toast.success("Event deleted successfully");
        } else {
          toast.error("Failed to delete event");
        }
      } else {
        const result = await addRecurrenceException({
          id: event.id.split("-recurring-")[0],
          exception_date: format(event.start_time, "yyyy-MM-dd"),
        });

        if (result.success) {
          toast.success("Event deleted successfully");
        } else {
          toast.error("Failed to delete event");
        }
      }
    } else {
      const result = await deleteEvent(event.id);

      if (result.success) {
        toast.success("Event deleted successfully");
      } else {
        toast.error("Failed to delete event");
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleEdit = async (eventData: {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    color: string | null;
  }) => {
    try {
      // Call the editEvent function from lib/actions/calendar.ts
      const result = await editEvent({
        id: eventData.id,
        title: eventData.title,
        description: eventData.description || '',
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        color: eventData.color || '#B8A47C',
      });

      if (result.success) {
        toast.success("Event updated successfully");
      } else {
        toast.error(result.error || "Failed to update event");
      }
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error("An error occurred while updating the event");
    }
    
    setIsEditFormOpen(false);
  };

  const handleEditClick = () => {
    setIsEditFormOpen(true);
    setIsPopoverOpen(false);
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            style={{
              top: `${startMinutes}px`,
              height: `${heightStyle}px`,
              borderLeftColor: eventColor,
            }}
            className={`
              flex flex-col absolute left-0 right-0 mr-1 p-2 rounded-md 
              cursor-pointer select-none text-sm overflow-hidden border-l-[4.5px]
              hover:brightness-110 transition-all
              ${!event.isStart && "rounded-t-none"}
              ${!event.isEnd && "rounded-b-none"}
            `}
          >
            <div
              style={{
                backgroundColor: eventColor,
                opacity: 0.15,
              }}
              className="absolute inset-0 rounded-md"
            />

            <div className="relative z-10">
              <div className="text-[0.8rem] leading-4 text-gray-200 mb-1">
                {event.title}
                {(!event.isStart || !event.isEnd) && " (continues)"}
              </div>
              <div className="font-sans text-xs text-gray-400">
                {event.isStart ? format(event.start_time, "h:mm") : "12:00 am"}{" "}
                - {event.isEnd ? format(event.end_time, "h:mm a") : "11:59 pm"}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 z-30 border-none shadow-xl"
          side={popoverSide}
          align="start"
          sideOffset={5}
        >
          <Card
            style={{
              background: `linear-gradient(45deg, ${eventColor} 0%, ${eventColor} 30%, transparent 150%)`,
              boxShadow: `0 0 10px ${eventColor}`,
            }}
            className="overflow-hidden relative bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0c1222] shadow-lg shadow-blue-900/10 border-0 rounded-md"
          >
            <CardHeader className="pb-0 pt-5">
              <CardTitle className="text-lg text-slate-100 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    backgroundColor: eventColor,
                    boxShadow: `0 0 8px ${eventColor}`,
                  }}
                />
                <span className="font-medium tracking-tight">
                  {event.title}
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2 flex items-center">
                <div className="bg-slate-800/50 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-700/30 text-xs">
                  {event.isStart
                    ? format(event.start_time, "MMM d • h:mm a")
                    : "Starts earlier"}
                  {" - "}
                  {event.isEnd
                    ? format(event.end_time, "h:mm a")
                    : "Continues later"}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <h2 className="text-slate-200 text-base font-medium mb-2 flex items-center">
                <span className="relative">
                  Details
                </span>
              </h2>
              <div className="text-sm text-slate-300 p-3 rounded-md border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                {event.description ? event.description : "No description"}
              </div>
            </CardContent>

            <div className="flex items-center justify-end gap-2 p-4 pt-2 border-t border-slate-800/50 bg-slate-900/30">
              <Button
                variant="outline"
                className="h-9 bg-slate-800/80 border-slate-700/50 hover:bg-slate-700 hover:text-cyan-400 transition-all duration-200 text-slate-200"
                onClick={handleEditClick}
              >
                <Edit className="w-4 h-4 mr-2" />
                <span>Edit</span>
              </Button>
              <Button
                variant="destructive"
                className="h-9 bg-red-900/60 hover:bg-red-800 border-red-900/50 text-red-100 transition-all duration-200"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Delete</span>
              </Button>
            </div>
          </Card>
        </PopoverContent>
      </Popover>
      
      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        event={event}
        handleDelete={handleDelete}
      />

      {/* Edit Form - Using Portal to render at document.body level */}
      {isEditFormOpen && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60]">
          <div className="w-full max-w-lg px-4 relative">
            <EditEvent
              event={event}
              isOpen={isEditFormOpen}
              onClose={() => setIsEditFormOpen(false)}
              onSubmit={handleEdit}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
