"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { createEvent } from "./actions";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { DateTimePicker } from "@/components/calendar/week-view/components/date-picker/date-picker";
import { ColorPicker } from "@/components/calendar/week-view/components/color-picker/ColorPicker";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Switch } from "@/components/shadcn-ui/switch";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Button } from "@/components/shadcn-ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { Calendar } from "@/components/calendar/week-view/components/date-picker/calendar";
import { cn } from "@/lib/utils";

/**
 * Event form schema
 */
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.date({
    required_error: "Start time is required",
  }),
  end_time: z.date({
    required_error: "End time is required",
  }),
  color: z.string().default("#2d3748"),
  is_recurring: z.boolean().default(false),
  recurrence_frequency: z
    .enum(["daily", "weekly", "biweekly", "monthly"])
    .optional(),
  recurrence_end_date: z.date().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

/**
 * CreateEventModal Component
 *
 * This component renders a modal for creating a new calendar event with an enhanced UI/UX
 * similar to Google/iOS Calendar, including support for recurring events.
 */
export function CreateEventModal({
  onClose,
  open = true,
}: {
  onClose?: () => void;
  open?: boolean;
}) {
  const { data: session } = useSession();

  // Get current time rounded to the nearest 30 minutes
  const getNow = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;

    if (roundedMinutes === 60) {
      return setHours(setMinutes(now, 0), now.getHours() + 1);
    }

    return setMinutes(now, roundedMinutes);
  };

  // Initialize form with default values
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: getNow(),
      end_time: addHours(getNow(), 1),
      color: "#2d3748",
      is_recurring: false,
      recurrence_frequency: undefined,
      recurrence_end_date: undefined,
    },
  });

  const is_recurring = form.watch("is_recurring");

  // Handle dialog close
  const handleClose = () => {
    onClose?.();
  };

  // When recurring is toggled on, set default frequency to weekly
  useEffect(() => {
    if (is_recurring) {
      form.setValue("recurrence_frequency", "weekly");
      // Set default end date to 1 month from now
      const defaultEndDate = new Date();
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
      form.setValue("recurrence_end_date", defaultEndDate);
    } else {
      form.setValue("recurrence_frequency", undefined);
      form.setValue("recurrence_end_date", undefined);
    }
  }, [is_recurring, form]);

  /**
   * Builds an RFC-compliant RRULE string based on the event's recurrence settings
   */
  const buildRecurrenceRule = (values: EventFormValues): string | null => {
    if (!values.is_recurring || !values.recurrence_frequency) {
      return null;
    }

    // Start building the rule
    let rule = "";

    // Set the correct frequency
    switch (values.recurrence_frequency) {
      case "daily":
        rule = "FREQ=DAILY";
        break;
      case "weekly":
        rule = "FREQ=WEEKLY";
        break;
      case "biweekly":
        rule = "FREQ=WEEKLY;INTERVAL=2";
        break;
      case "monthly":
        rule = "FREQ=MONTHLY";
        break;
    }

    // Add until date if specified
    if (values.recurrence_end_date) {
      // Format date to RRULE format (YYYYMMDD)
      const untilDate = values.recurrence_end_date;
      const year = untilDate.getFullYear();
      const month = String(untilDate.getMonth() + 1).padStart(2, "0");
      const day = String(untilDate.getDate()).padStart(2, "0");
      rule += `;UNTIL=${year}${month}${day}T235959Z`;
    }

    return rule;
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (values: EventFormValues) => {
    try {
      const formData = new FormData();
      formData.append("user_id", session?.user?.id ?? "");
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("start_time", values.start_time.toISOString());
      formData.append("end_time", values.end_time.toISOString());
      formData.append("color", values.color);

      // Add recurrence data
      formData.append("is_recurring", String(values.is_recurring));

      // Build and add the recurrence rule if applicable
      const recurrenceRule = buildRecurrenceRule(values);
      if (recurrenceRule) {
        formData.append("recurrence_rule", recurrenceRule);
      }

      await createEvent(formData);

      toast.success("Event created", {
        description: "Your event has been created successfully.",
      });

      handleClose();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to create event",
      });
    }
  };

  return (
    <Card className="bg-[#0D1419] w-full max-w-lg border border-[#1E2A36] rounded-lg shadow-lg overflow-hidden">
      {/* Card Header */}
      <CardHeader className="py-3 bg-[#0A0F14] border-b border-[#1E2A36]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#E8E2D6] text-base">Create New Event</CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-[#8A8578] hover:text-[#E8E2D6] hover:bg-[#1E2A36]/50 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-[#8A8578] text-xs mt-1">
          Add a new event to your calendar
        </CardDescription>
      </CardHeader>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-4 pb-0 bg-[#0D1419] text-[#E8E2D6] space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E8E2D6]">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event title"
                      {...field}
                      className="bg-[#0A0F14] border-[#1E2A36] text-[#E8E2D6] focus-visible:ring-[#B8A47C]/30"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E8E2D6]">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event description"
                      {...field}
                      className="bg-[#0A0F14] border-[#1E2A36] text-[#E8E2D6] focus-visible:ring-[#B8A47C]/30 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex flex-row justify-between gap-4">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#E8E2D6]">Start Time</FormLabel>
                    <DateTimePicker
                      label="Start Time"
                      initialDate={field.value}
                      onChange={(date) => date && field.onChange(date)}
                      className="bg-[#0A0F14] border-[#1E2A36] text-[#E8E2D6] focus-visible:ring-[#B8A47C]/30"
                    />
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#E8E2D6]">End Time</FormLabel>
                    <DateTimePicker
                      label="End Time"
                      initialDate={field.value}
                      onChange={(date) => date && field.onChange(date)}
                      className="bg-[#0A0F14] border-[#1E2A36] text-[#E8E2D6] focus-visible:ring-[#B8A47C]/30"
                    />
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E8E2D6]">
                    Color
                  </FormLabel>
                  <div className="flex flex-row items-center gap-2">
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <span className="text-[#8A8578] text-sm ml-2">{field.value}</span>
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Is Recurring */}
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#1E2A36] p-3 bg-[#0A0F14]">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[#E8E2D6]">
                      Recurring Event
                    </FormLabel>
                    <FormDescription className="text-[#8A8578]">
                      Set this event to repeat on a schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#B8A47C]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Recurrence Options (only shown if is_recurring is true) */}
            {is_recurring && (
              <div className="space-y-4 p-3 rounded-lg border border-[#1E2A36] bg-[#0A0F14]/50">
                <FormField
                  control={form.control}
                  name="recurrence_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#E8E2D6]">Repeat</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0A0F14] border-[#1E2A36] text-[#E8E2D6]">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0D1419] border-[#1E2A36] text-[#E8E2D6]">
                          <SelectItem
                            value="daily"
                            className="focus:bg-[#1E2A36] focus:text-[#E8E2D6]"
                          >
                            Daily
                          </SelectItem>
                          <SelectItem
                            value="weekly"
                            className="focus:bg-[#1E2A36] focus:text-[#E8E2D6]"
                          >
                            Weekly
                          </SelectItem>
                          <SelectItem
                            value="monthly"
                            className="focus:bg-[#1E2A36] focus:text-[#E8E2D6]"
                          >
                            Monthly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurrence_end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[#E8E2D6]">End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal bg-[#0A0F14] border-[#1E2A36] text-[#E8E2D6]",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-[#0D1419] border-[#1E2A36]"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="bg-[#0D1419] text-[#E8E2D6]"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2 pt-5 pb-4 bg-[#0D1419]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#1E2A36] bg-transparent hover:bg-[#1E2A36]/50 text-[#E8E2D6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#B8A47C] hover:bg-[#D4C8A8] text-[#0A0F14]"
            >
              Create Event
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
