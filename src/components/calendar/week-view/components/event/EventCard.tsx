import React, { useState } from 'react';
import {
  format,
  differenceInMinutes,
  getHours,
  getMinutes
} from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/shadcn-ui/card";
import { Event } from "@/types";
import { Button } from "@/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { toast } from 'sonner';
import { addRecurrenceException, deleteEvent } from '@/lib/actions/calendar';

interface EventCardProps {
  event: Event & {
    isSegment?: boolean;
    isStart?: boolean;
    isEnd?: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const startMinutes = getHours(event.start_time) * 60 + getMinutes(event.start_time);
  
  // Cap the height at the end of the current day (24 hours * 60 minutes = 1440)
  const maxMinutesInDay = 1440;
  const heightStyle = Math.min(
    differenceInMinutes(event.end_time, event.start_time),
    maxMinutesInDay - startMinutes // Ensure we don't exceed the day boundary
  );

  const dayOfWeek = new Date(event.start_time).getDay();
  
  // For Friday (5) and Saturday (6), show popover on the left
  const popoverSide = dayOfWeek >= 5 ? "left" : "right";

  const eventColor = event.color || '#039be5';

  const handleDelete = async (deleteAllFuture = false) => {
    if (event.is_recurring) {
      if (deleteAllFuture) {
        const result = await deleteEvent(event.id.split('-recurring-')[0]);

        if (result.success) {
          toast.success('Event deleted successfully');
        } else {
          toast.error('Failed to delete event');
        }
      } else {
        const result = await addRecurrenceException({id: event.id.split('-recurring-')[0], exception_date: format(event.start_time, 'yyyy-MM-dd')});  

        if (result.success) {
          toast.success('Event deleted successfully');
        } else {
          toast.error('Failed to delete event');
        }
      }
    } else {
      const result = await deleteEvent(event.id);

      if (result.success) {
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Popover>
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
              ${!event.isStart && 'rounded-t-none border-t border-t-gray-600'}
              ${!event.isEnd && 'rounded-b-none border-b border-b-gray-600'}
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
                {(!event.isStart || !event.isEnd) && ' (continues)'}
              </div>
              <div className="font-sans text-xs text-gray-400">
                {event.isStart 
                  ? format(event.start_time, 'h:mm') 
                  : '12:00 am'} - {
                  event.isEnd 
                    ? format(event.end_time, 'h:mm a')
                    : '11:59 pm'
                }
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 z-30" 
          side={popoverSide}
          align="start"
        >
          <Card className="border-0 bg-gray-800">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-gray-100 border-b border-gray-700 pb-1 flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: eventColor }}
                />
                {event.title}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {event.isStart 
                  ? format(event.start_time, 'MMM d • h:mm a') 
                  : 'Starts earlier'} 
                {' - '}
                {event.isEnd 
                  ? format(event.end_time, 'h:mm a')
                  : 'Continues later'}
              </CardDescription>
            </CardHeader>
            {(
              <CardContent>
                <h2 className="text-white text-base font-medium mb-2">Details</h2>
                <div className="text-sm text-gray-300 p-3 rounded-md border border-gray-600 bg-gray-900">
                  {event.description ? event.description : 'No description'}
                </div>
              </CardContent>
            )}

            <div className="flex items-center justify-end gap-2 p-2">
              <button 
                className="bg-red-500 text-white px-2 rounded-md hover:bg-red-800 transition-all w-30 h-8"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <p className="text-white text-sm px-2 py-1 rounded-md">Delete event</p>
              </button>
            </div>
          </Card>
        </PopoverContent>
      </Popover>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this event{event.is_recurring ? " series" : ""}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {event.is_recurring ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(false)}
                    className="w-full"
                  >
                    Delete this event only
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(true)}
                    className="w-full"
                  >
                    Delete this and all future events
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => handleDelete(false)}
                className="w-full"
              >
                Delete event
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}