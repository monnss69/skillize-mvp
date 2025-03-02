# SKILLIZE MVP - COMPONENT DOCUMENTATION

## Component System Overview

Skillize MVP follows a component-based architecture using React and Next.js. The component system is designed with the following principles:

1. **Component Reusability**: Components are designed to be reusable across the application
2. **Composition Over Inheritance**: Components are composed together rather than extended
3. **Server/Client Separation**: Clear separation between Server and Client Components
4. **Atomic Design Methodology**: Components are organized by complexity (atoms, molecules, organisms)
5. **Strong Typing**: All components use TypeScript for type safety

## Component Categories

The application's components are organized into several key categories:

### 1. UI Components

Base UI components that serve as building blocks for more complex interfaces. These are primarily shadcn/ui components with custom styling.

```
┌───────────────────────────┐
│         UIComponent       │
├───────────────────────────┤
│ +Props                    │
│ +render()                 │
└───────────┬───────────────┘
            │
            │
            ▼
┌─────────────┬─────────────┬─────────────┐
│   Button    │    Input    │    Modal    │
├─────────────┤─────────────┤─────────────┤
│ +variant    │ +type       │ +isOpen     │
│ +size       │ +placeholder│ +onClose()  │
│ +onClick()  │ +onChange() │ +render()   │
└─────────────┘─────────────┘─────────────┘
```

#### Key UI Components

| Component |      Description      |           Props             | Usage |
|-----------|-----------------------|-----------------------------|-------|
|   Button  | Multi-variant button  | variant, size, onClick      | Form submissions, actions |
|   Input   | Text input field      | type, placeholder, onChange | Form inputs |
|   Select  | Dropdown selection    | options, value, onChange    | Option selection |
|   Modal   | Dialog overlay        | isOpen, onClose             | Form dialogs, confirmations |
|   Tabs    | Tab navigation        | tabs, activeTab             | Page section navigation |
|   Avatar  | User profile image    | src, alt, size              | User profiles |
|   Form    | Form container        | onSubmit, children          | Form layout and validation |
|   Toast   | Notification messages | type, message               | User notifications |

### 2. Calendar Components

Components specific to the calendar functionality, organized by their role in the calendar interface.

#### Calendar Component Hierarchy

```
                             ┌─────────────┐
                             │  Week View  │
                             └──────┬──────┘
                     ┌───────────────┴───────────────┐
                     │                               │
             ┌───────▼───────┐               ┌───────▼────────┐
             │ Week Grid     │               │ Calendar       │
             │ Client        │               │ Sidebar        │
             └───────┬───────┘               └───────┬────────┘
         ┌───────────┼───────────┐                   │
         │           │           │           ┌───────┴───────┐
 ┌───────▼──────┐┌───▼───┐┌──────▼──────┐   │               │
 │ Time Slots   ││ Day   ││ Event       │┌──▼───────┐ ┌─────▼──────┐
 │              ││Headers││ Layers      ││ Date     │ │ Mini       │
 └──────────────┘└───────┘└──────┬──────┘│ Picker   │ │ Calendar   │
                                 │       └──────────┘ └────────────┘
                          ┌──────▼──────┐
                          │ Event Card  │
                          └──────┬──────┘
                   ┌──────────────┴──────────────┐
                   │                             │
           ┌───────▼───────┐           ┌────────▼───────┐
           │ Event Details │           │ Event Actions  │
           └───────────────┘           └────────────────┘

                    ┌─────────────────────────────┐
                    │        Event Modals         │
                    │                             │
          ┌─────────▼────────┐    ┌──────────────▼─────┐
          │ Create Event     │    │ Edit Event         │
          │ Modal            │    │ Modal              │
          └──────────────────┘    └────────────────────┘
                    ▲                       ▲
                    │                       │
                    │                       │
           ┌────────┘                       └──────┐
           │                                       │
  ┌────────┴────────┐                     ┌────────┴────────┐
  │ Week Grid Client│                     │ Event Card      │
  └─────────────────┘                     └─────────────────┘
```

#### Calendar Component Implementation Details

**1. WeekGridClient**
- **Purpose**: Main calendar grid displaying weekly events
- **Key Features**:
  - Renders time slots and day columns
  - Positions events based on time
  - Handles user interactions (click, drag)
- **Implementation Details**:
  - Uses CSS grid for layout
  - Calculates event positioning dynamically
  - Client component with state management
- **Key Props**:
  - `events`: Array of events to display
  - `selectedDate`: Current date focus
  - `onEventClick`: Handler for event clicks
  - `onTimeSlotClick`: Handler for empty time slot clicks
- **File Location**: `/src/components/calendar/week-view/WeekGridClient.tsx`

**2. EventCard**
- **Purpose**: Visual representation of calendar events
- **Key Features**:
  - Displays event details (title, time, etc.)
  - Shows visual indicators (recurrence, source)
  - Handles click interactions
- **Implementation Details**:
  - Position calculated based on event time
  - Height based on event duration
  - Color based on event category/source
- **Key Props**:
  - `event`: Event data to display
  - `onClick`: Click handler
  - `isGoogleEvent`: Boolean indicating Google source
- **File Location**: `/src/components/calendar/week-view/components/event/EventCard.tsx`

**3. CreateEventModal**
- **Purpose**: Modal for creating new events
- **Key Features**:
  - Form for event details
  - Recurrence options
  - Google Calendar integration
- **Implementation Details**:
  - Uses React Hook Form for form state
  - Zod for validation
  - Conditionally shows Google options
- **Key Props**:
  - `isOpen`: Controls visibility
  - `onClose`: Close handler
  - `initialDateTime`: Pre-filled date/time
  - `onSuccess`: Success callback
- **File Location**: `/src/components/calendar/week-view/components/create-event-modal/CreateEventModal.tsx`

### 3. Authentication Components

Components related to user authentication, login, and registration.

#### Auth Component Flow

```
         ┌────────────┐                           ┌─────────────┐
         │ Login Page │                           │ Signup Page │
         └─────┬──────┘                           └──────┬──────┘
               │                                         │
               ▼                                         ▼
         ┌────────────┐                           ┌─────────────┐
         │ Login Form │                           │ Signup Form │
         └─────┬──────┘                           └──────┬──────┘
               │                                         │
       ┌───────┴────────┐                                │
       │                │                                │
       ▼                ▼                                ▼
┌─────────────┐  ┌─────────────┐               ┌────────────────┐
│ Credential  │  │ OAuth       │               │ Credential     │
│ Login       │  │ Buttons     │               │ Signup         │
└──────┬──────┘  └──────┬──────┘               └───────┬────────┘
       │                │                              │
       │                ▼                              │
       │         ┌─────────────┐                       │
       │         │ Google      │                       │
       │         │ Button      │                       │
       │         └─────────────┘                       │
       │                                               │
       └───────────────────┬───────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Form Fields   │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Validation    │
                   │ Errors        │
                   └───────────────┘
```

#### Auth Component Implementation Details

**1. LoginForm**
- **Purpose**: Handles user login
- **Key Features**:
  - Email/password login
  - OAuth provider options
  - Validation and error handling
- **Implementation Details**:
  - Uses React Hook Form
  - Integrates with NextAuth.js
  - Client component with state
- **Key Props**:
  - `onSuccess`: Callback after successful login
  - `defaultValues`: Optional pre-filled values
- **File Location**: `/src/components/login-form/LoginForm.tsx`

**2. SignupForm**
- **Purpose**: Handles new user registration
- **Key Features**:
  - Email/password registration
  - Field validation
  - Terms agreement
- **Implementation Details**:
  - Uses React Hook Form with Zod validation
  - Calls signup API endpoint
  - Handles various error states
- **Key Props**:
  - `onSuccess`: Callback after successful registration
- **File Location**: `/src/components/signup-form/SignUpForm.tsx`

### 4. Google Integration Components

Components for connecting and interacting with Google Calendar.

#### Google Component Relationships

```
               ┌───────────────────────┐
               │Google Connection      │
               │Context                │
               └───────────┬───────────┘
                           │
          ┌────────────────┼────────────────┬──────────────────┐
          │                │                │                  │
          ▼                ▼                ▼                  ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐  ┌──────────────┐
│Google Connect   │ │Connection   │ │Google Sync  │  │Google        │
│Button           │ │Status       │ │Controls     │  │Settings Panel│
└─────────────────┘ └─────────────┘ └─────────────┘  └──────────────┘
                           │
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
      ┌─────────────────┐     ┌────────────────┐
      │Google Auth API  │     │Token Storage   │
      └─────────────────┘     └────────────────┘
```

#### Google Component Implementation Details

**1. GoogleConnectButton**
- **Purpose**: Button to initiate Google connection
- **Key Features**:
  - Initiates OAuth flow
  - Shows connection status
  - Loading states during connection
- **Implementation Details**:
  - Uses GoogleConnectionContext
  - Redirects to Google OAuth
  - Handles connection errors
- **Key Props**:
  - `variant`: Visual style variant
  - `onSuccess`: Callback after connection
- **File Location**: `/src/components/google/GoogleConnectButton.tsx`

**2. GoogleConnectionProvider**
- **Purpose**: Provides Google connection state
- **Key Features**:
  - Manages connection state
  - Provides connection methods
  - Handles token refresh
- **Implementation Details**:
  - Context provider pattern
  - Integrates with API endpoints
  - Manages token storage
- **Key Props**:
  - `children`: React children
- **File Location**: `/src/contexts/GoogleConnectionContext.tsx`

## Component Patterns and Best Practices

### Server vs. Client Components

The application carefully separates server and client components:

```
# Server Component Example - No 'use client' directive
import { getUserEvents } from '@/lib/actions/calendar';

export default async function EventsList() {
  const events = await getUserEvents();
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}

# Client Component Example - Has 'use client' directive
'use client';

import { useState } from 'react';
import { createEvent } from '@/lib/actions/calendar';

export default function EventForm() {
  const [title, setTitle] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEvent({ title });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Component Composition Pattern

Components are composed together rather than using inheritance:

```tsx
// Base component
function Card({ children, className }) {
  return <div className={cn("rounded-lg p-4 shadow-md", className)}>{children}</div>;
}

// Composed component
function EventCard({ event }) {
  return (
    <Card className="bg-primary-900">
      <h3>{event.title}</h3>
      <p>{format(event.startDate, 'p')}</p>
    </Card>
  );
}
```

### Props Interface Pattern

All components use TypeScript interfaces for props:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({ 
  variant = "default", 
  size = "md", 
  isLoading = false,
  children,
  ...props 
}: ButtonProps) {
  // Component implementation
}
```

### Error Handling Pattern

Components implement consistent error handling:

```tsx
function DataComponent({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchDataById(id);
        setData(result);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
}
```

## Component Testing

Components are tested using React Testing Library:

```tsx
// Example test for LoginForm component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders login form with email and password fields', () => {
    render(<LoginForm onSuccess={() => {}} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('shows validation errors for empty fields', async () => {
    render(<LoginForm onSuccess={() => {}} />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

## Component Style Guide

The application follows these styling conventions:

1. **Tailwind CSS**: Primary styling method using utility classes
2. **CSS Variables**: Custom properties for theme values
3. **CSS Modules**: For complex component-specific styles
4. **Responsive Design**: Mobile-first approach with responsive breakpoints
5. **Dark Mode**: Built-in dark mode support via next-themes

Example of component styling:

```tsx
// Button component with Tailwind styling
function Button({ variant = "default", size = "md", children, ...props }) {
  const variantClasses = {
    default: "bg-primary text-white hover:bg-primary-600",
    outline: "border border-primary text-primary hover:bg-primary-50",
    ghost: "text-primary hover:bg-primary-50",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button 
      className={`rounded transition-colors ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## See Also

- [Architecture Documentation](./02-architecture.md)
- [State Management](./04-state-management.md)
- [API Documentation](./05-api-documentation.md) 