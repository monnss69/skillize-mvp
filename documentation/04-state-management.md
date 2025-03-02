# SKILLIZE MVP - STATE MANAGEMENT

## State Management Overview

Skillize MVP uses a hybrid state management approach that separates concerns based on the type of state being managed:

- **Server State**: Data fetched from APIs and backend services, managed primarily through React Query
- **Client State**: UI state, user preferences, and application state managed with a combination of React hooks, Context API, and Zustand
- **Form State**: Form inputs, validation, and submission state managed with React Hook Form
- **UI State**: Component-level state managed with local component state

## State Management Architecture

```
┌───────────────────────────────────────┐
│             State Types               │
│                                       │
│  ┌──────────┐ ┌──────────┐ ┌───────┐  │
│  │ Server   │ │ Client   │ │ Form  │  │
│  │ State    │ │ State    │ │ State │  │
│  └────┬─────┘ └────┬─────┘ └───┬───┘  │
└───────┼───────────┼─────────┼─────────┘
        │           │         │
        ▼           ▼         ▼
┌──────────────┐ ┌──────────────────┐ ┌────────────────┐
│ Server State │ │ Client State     │ │ Form State     │
│ Management   │ │ Management       │ │ Management     │
│              │ │                  │ │                │
│ ┌──────────┐ │ │ ┌─────────────┐  │ │ ┌────────────┐ │
│ │ React    │ │ │ │ React       │  │ │ │ React Hook │ │
│ │ Query    │ │ │ │ Context     │  │ │ │ Form       │ │
│ └────┬─────┘ │ │ └─────┬───────┘  │ │ └─────┬──────┘ │
│      │       │ │       │          │ │       │        │
│ ┌────┴─────┐ │ │ ┌─────┴───────┐  │ │ ┌─────┴──────┐ │
│ │ Server   │ │ │ │ Zustand     │  │ │ │ Zod        │ │
│ │ Actions  │ │ │ │ Store       │  │ │ │ Validation │ │
│ └──────────┘ │ │ └─────────────┘  │ │ └────────────┘ │
│              │ │                  │ │                │
│              │ │ ┌─────────────┐  │ └────────┬───────┘
│              │ │ │ React       │  │          │
│              │ │ │ Hooks       │  │          │
└──────┬───────┘ │ └─────────────┘  │          │
       │         └────────┬─────────┘          │
       │                  │                     │
       ▼                  ▼                     ▼
┌──────────────────────────────────────────────────────┐
│                Persistence Layer                      │
│                                                       │
│ ┌─────────────┐ ┌───────────────┐ ┌────────┐ ┌─────┐ │
│ │ Supabase    │ │ Google        │ │ HTTP   │ │Local│ │
│ │ Database    │ │ Calendar API  │ │Cookies │ │Store│ │
│ └─────────────┘ └───────────────┘ └────────┘ └─────┘ │
└───────────────────────────────────────────────────────┘
```

## Server State Management

### React Query Implementation

TanStack React Query is the primary tool for server state management, providing:

- **Caching**: Automatic caching of server responses
- **Background Updates**: Automatic refetching and background updates
- **Loading and Error States**: Simplified handling of loading and error states
- **Optimistic UI Updates**: Support for optimistic UI updates

#### Query Configuration Example

Here's an example of our React Query implementation for fetching and mutating events:

```typescript
// hooks/use-events.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, createEvent } from '@/lib/api';
import type { Event, CreateEventParams } from '@/types';

// Query hook for fetching events
export function useEvents(startDate: Date, endDate: Date) {
  return useQuery<Event[]>({
    queryKey: ['events', { startDate, endDate }],
    queryFn: () => fetchEvents(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation hook for creating events
export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: CreateEventParams) => createEvent(eventData),
    onSuccess: (newEvent) => {
      // Update events query cache
      queryClient.setQueryData(
        ['events', { startDate: newEvent.startDate, endDate: newEvent.endDate }],
        (oldEvents: Event[] = []) => [...oldEvents, newEvent]
      );
      
      // Invalidate potentially affected queries
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
    },
  });
}
```

#### Query Keys Structure

We follow a structured approach to query keys:

| Resource | Query Key Pattern | Example |
|----------|-------------------|---------|
| Events | `['events', { startDate, endDate }]` | `['events', { startDate: new Date('2023-10-01'), endDate: new Date('2023-10-31') }]` |
| Event Detail | `['events', eventId]` | `['events', 'evt_123']` |
| User Profile | `['users', 'me']` | `['users', 'me']` |
| Google Connection | `['connections', 'google']` | `['connections', 'google']` |

#### Global Query Client Configuration

```typescript
// lib/react-query.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### Server Actions Integration

Next.js Server Actions are used for data mutations, which integrate with React Query:

```typescript
// actions/events.ts
'use server'

import { revalidatePath } from 'next/cache';
import { createEventInDB } from '@/lib/db';
import { syncWithGoogleCalendar } from '@/lib/google';
import type { CreateEventParams, Event } from '@/types';

export async function createEvent(data: CreateEventParams): Promise<Event> {
  // Validate and create event in database
  const event = await createEventInDB(data);
  
  // Sync with Google Calendar if connected
  if (data.syncWithGoogle) {
    await syncWithGoogleCalendar(event);
  }
  
  // Revalidate relevant paths
  revalidatePath('/calendar');
  
  return event;
}
```

## Client State Management

### React Context API

The Context API is used for state that needs to be accessed by multiple components in the application:

```typescript
// contexts/google-connection-context.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGoogleConnectionStatus } from '@/lib/api';

type GoogleConnectionContextType = {
  isConnected: boolean;
  isLoading: boolean;
  lastSynced: Date | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const GoogleConnectionContext = createContext<GoogleConnectionContextType | undefined>(undefined);

export function GoogleConnectionProvider({ children }: { children: React.ReactNode }) {
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['connections', 'google'],
    queryFn: getGoogleConnectionStatus,
  });
  
  // Connection handlers
  const connect = async () => {
    // Implementation
  };
  
  const disconnect = async () => {
    // Implementation
  };
  
  // Update last synced time
  useEffect(() => {
    if (data?.lastSynced) {
      setLastSynced(new Date(data.lastSynced));
    }
  }, [data?.lastSynced]);
  
  return (
    <GoogleConnectionContext.Provider
      value={{
        isConnected: !!data?.connected,
        isLoading,
        lastSynced,
        connect,
        disconnect,
      }}
    >
      {children}
    </GoogleConnectionContext.Provider>
  );
}

export const useGoogleConnection = () => {
  const context = useContext(GoogleConnectionContext);
  if (context === undefined) {
    throw new Error('useGoogleConnection must be used within a GoogleConnectionProvider');
  }
  return context;
};
```

### Zustand Stores

Zustand is used for more complex client-side state management:

```typescript
// stores/calendar-view-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewState {
  view: CalendarViewType;
  currentDate: Date;
  setView: (view: CalendarViewType) => void;
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToNextPeriod: () => void;
  goToPreviousPeriod: () => void;
}

export const useCalendarViewStore = create<CalendarViewState>()(
  persist(
    (set) => ({
      view: 'month',
      currentDate: new Date(),
      
      setView: (view) => set({ view }),
      
      setCurrentDate: (currentDate) => set({ currentDate }),
      
      goToToday: () => set({ currentDate: new Date() }),
      
      goToNextPeriod: () => set((state) => {
        const newDate = new Date(state.currentDate);
        
        switch (state.view) {
          case 'month':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() + 7);
            break;
          case 'day':
            newDate.setDate(newDate.getDate() + 1);
            break;
          default:
            break;
        }
        
        return { currentDate: newDate };
      }),
      
      goToPreviousPeriod: () => set((state) => {
        const newDate = new Date(state.currentDate);
        
        switch (state.view) {
          case 'month':
            newDate.setMonth(newDate.getMonth() - 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() - 7);
            break;
          case 'day':
            newDate.setDate(newDate.getDate() - 1);
            break;
          default:
            break;
        }
        
        return { currentDate: newDate };
      }),
    }),
    {
      name: 'calendar-view-storage',
      partialize: (state) => ({ view: state.view }),
    }
  )
);
```

## Form State Management

### React Hook Form + Zod

Form state is managed using React Hook Form with Zod for validation:

```typescript
// components/event-creation-form.tsx
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '@/hooks/use-events';
import { Button, Input, DatePicker, TimePicker, Checkbox } from '@/components/ui';

// Validation schema
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.date(),
  startTime: z.date(),
  endDate: z.date(),
  endTime: z.date(),
  isAllDay: z.boolean().default(false),
  syncWithGoogle: z.boolean().default(true),
});

type EventFormValues = z.infer<typeof eventSchema>;

export function EventCreationForm() {
  const { mutate, isPending } = useCreateEvent();
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: new Date(),
      endDate: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      isAllDay: false,
      syncWithGoogle: true,
    },
  });
  
  const onSubmit = (data: EventFormValues) => {
    const startDateTime = new Date(
      data.startDate.setHours(data.startTime.getHours(), data.startTime.getMinutes())
    );
    
    const endDateTime = new Date(
      data.endDate.setHours(data.endTime.getHours(), data.endTime.getMinutes())
    );
    
    mutate({
      title: data.title,
      description: data.description || '',
      startAt: data.isAllDay ? new Date(data.startDate.setHours(0, 0, 0, 0)) : startDateTime,
      endAt: data.isAllDay ? new Date(data.endDate.setHours(23, 59, 59, 999)) : endDateTime,
      isAllDay: data.isAllDay,
      syncWithGoogle: data.syncWithGoogle,
    });
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Event'}
      </Button>
    </form>
  );
}
```

## State Flow Diagrams

### Authentication State Flow

```
+------+          +-------+          +-----------+          +---------+          +----------+          +----------+
| User |          | Auth  |          | NextAuth  |          |   JWT   |          | Supabase |          | Database |
|      |          | Comp  |          |           |          | Tokens  |          |   Auth   |          |          |
+------+          +-------+          +-----------+          +---------+          +----------+          +----------+
   |                  |                    |                     |                    |                     |
   | Login Attempt    |                    |                     |                    |                     |
   |----------------->|                    |                     |                    |                     |
   | (Email/Password) |                    |                     |                    |                     |
   |                  |                    |                     |                    |                     |
   |                  | signIn() Request   |                     |                    |                     |
   |                  |------------------->|                     |                    |                     |
   |                  |                    |                     |                    |                     |
   |                  |                    | Authenticate User   |                    |                     |
   |                  |                    |------------------->|                     |                     |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    | Verify Credentials  |                     |
   |                  |                    |                    |-------------------->|                     |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
   +------------------+--------------------+--------------------+---------------------+---------------------+
   |                                      AUTH RESULT                                                       |
   +------------------+--------------------+--------------------+---------------------+---------------------+
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     | Credentials Valid   |
   |                  |                    |                    |                     |<----------------    |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    | Auth Success        |                     |
   |                  |                    |                    |<----------------    |                     |
   |                  |                    |                    |                     |                     |
   |                  |                    | Generate Tokens    |                     |                     |
   |                  |                    |-------------------->                     |                     |
   |                  |                    |                    |                     |                     |
   |                  | Store Tokens       |                    |                     |                     |
   |                  |<-------------------+                    |                     |                     |
   |                  |                    |                    |                     |                     |
   | Redirect to      |                    |                    |                     |                     |
   | Dashboard        |                    |                    |                     |                     |
   |<-----------------|                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
   +------------------+--------------------+--------------------+---------------------+---------------------+
   |                                  OR AUTHENTICATION FAILED                                              |
   +------------------+--------------------+--------------------+---------------------+---------------------+
   |                  |                    |                    |                     |                     |
   |                  |                    |                    |                     | Invalid Credentials |
   |                  |                    |                    |                     |<----------------    |
   |                  |                    |                    |                     |                     |
   |                  |                    |                    | Auth Failed         |                     |
   |                  |                    |                    |<----------------    |                     |
   |                  |                    |                    |                     |                     |
   |                  | Error Message      |                    |                     |                     |
   |                  |<-------------------|                    |                     |                     |
   |                  |                    |                    |                     |                     |
   | Display Error    |                    |                    |                     |                     |
   |<-----------------|                    |                    |                     |                     |
   |                  |                    |                    |                     |                     |
```

### Calendar Event State Flow

```
+------+    +----------+    +-----------+    +--------------+    +---------------+    +----------+    +----------------+
| User |    | Calendar |    | Event Form|    | React Query  |    | Server Action |    | Database |    | Google Calendar|
|      |    |   UI     |    |           |    |              |    |               |    |          |    |                |
+------+    +----------+    +-----------+    +--------------+    +---------------+    +----------+    +----------------+
   |             |               |                  |                   |                  |                 |
   | Open Cal    |               |                  |                   |                  |                 |
   |------------>|               |                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             | Request Events|                  |                   |                  |                 |
   |             |-------------->|                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               | fetchEvents()    |                   |                  |                 |
   |             |               |----------------->|                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  | Query Events      |                  |                 |
   |             |               |                  |------------------>|                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  |                   | Return Events    |                 |
   |             |               |                  |                   |<-----------------|                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  | Events Data       |                  |                 |
   |             |               |                  |<------------------|                  |                 |
   |             |               |                  |                   |                  |                 |
   |             | Update UI     |                  |                   |                  |                 |
   |             |<--------------|                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   | Create Event|               |                  |                   |                  |                 |
   |------------>|               |                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             | Open Form     |                  |                   |                  |                 |
   |             |-------------->|                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   | Fill Details|               |                  |                   |                  |                 |
   |------------>|               |                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               | Create Mutation  |                   |                  |                 |
   |             |               |----------------->|                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  | createEvent()     |                  |                 |
   |             |               |                  |------------------>|                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  |                   | Insert Event     |                 |
   |             |               |                  |                   |----------------->|                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  |                   | Return New Event |                 |
   |             |               |                  |                   |<-----------------|                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               |                  |                   | [If Sync Enabled]|                 |
   |             |               |                  |                   |------------------------------+     |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |                  |           v     |
   |             |               |                  |                   |                  |      Sync Event |
   |             |               |                  |                   |<---------------------------------  |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |                  |           |     |
   |             |               |                  |                   |<---------------------------------  |
   |             |               |                  |                   |                  |     Confirm Sync|
   |             |               |                  |                   |                  |                 |
   |             |               |                  | Update Cache      |                  |                 |
   |             |               |                  |<------------------|                  |                 |
   |             |               |                  |                   |                  |                 |
   |             | Show Event    |                  |                   |                  |                 |
   |             |<--------------|                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               | Close Form       |                   |                  |                 |
   |             |               |<-----------------|                   |                  |                 |
   |             |               |                  |                   |                  |                 |
   |             |               | Confirm Creation |                   |                  |                 |
   |<----------------------------|                  |                   |                  |                 |
   |             |               |                  |                   |                  |                 |
```

## State Management Best Practices

1. **Separation of Concerns**
   - Server state managed with React Query
   - Client state managed with Context API and Zustand
   - Form state managed with React Hook Form

2. **Optimistic Updates**
   - Provide immediate feedback by updating UI before server confirmation
   - Roll back changes if server request fails

3. **Lazy Loading**
   - Load data only when needed
   - Use React Query's lazy queries for data not immediately visible

4. **State Normalization**
   - Avoid duplicating data across stores
   - Use normalized data structures for related entities

5. **Type Safety**
   - Use TypeScript interfaces for all state
   - Validate external data with Zod schemas

## Debugging and Development Tools

- **React Query DevTools**: For debugging server state
- **Zustand DevTools Middleware**: For debugging Zustand store
- **React Developer Tools**: For debugging component state and context

Example of debug configuration:

```tsx
// Zustand debug middleware
import { createStore, devtools } from 'zustand/middleware';

const useCalendarStore = create(
  devtools(
    (set, get) => ({
      // store implementation
    }),
    { name: 'calendar-store' }
  )
);

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

## See Also

- [Architecture Documentation](./02-architecture.md)
- [Component Documentation](./03-components.md)
- [API Documentation](./05-api-documentation.md) 