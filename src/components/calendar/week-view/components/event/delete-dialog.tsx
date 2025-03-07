import { useState } from "react";
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

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event & {
    isSegment?: boolean;
    isStart?: boolean;
    isEnd?: boolean;
  };
  handleDelete: (deleteAllFuture: boolean) => Promise<void>;
}

export function DeleteDialog({
  open,
  onOpenChange,
  event,
  handleDelete,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-800 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete this event
            {event.is_recurring ? " series" : ""}?
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
            className="hover:bg-black"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
