export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  calendar?: string;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  type: 'personal' | 'work' | 'custom';
}

export interface TimeSlot {
  start: Date;
  end: Date;
  events: CalendarEvent[];
}