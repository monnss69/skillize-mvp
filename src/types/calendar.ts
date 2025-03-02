export interface TimeSlot {
  start: Date;
  end: Date;
  events: Event[];
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  interval: number;
  count: number | null;
  until: Date | null;
}

export interface DeleteEvent {
  id: string;
}

export interface UpdateEvent {
  id: string;
  title?: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
  color?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  recurrence_exception_dates?: string[];
}

export interface CreateEvent {
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  color?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  recurrence_exception_dates?: string[];
}
