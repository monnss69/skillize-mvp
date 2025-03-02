# SKILLIZE MVP - ARCHITECTURE

## Architecture Overview

Skillize MVP follows a modern client-server architecture using Next.js 15 with App Router, with a combination of Server Components (RSC) and Client Components, server-side rendering, and API routes. The application uses Supabase as its primary database and integrates with external services like Google Calendar.

### High-Level Architecture Diagram

```
+---------------------+
|    Client (Browser) |
|                     |
|  +---------------+  |
|  | UI Components |  |
|  +-------+-------+  |
|          |          |
|  +-------v-------+  |
|  | Client-Side   |  |
|  | Rendering     |  |
|  +-------+-------+  |
|          |          |
|  +-------v-------+  |
|  | Client State  |  |
|  | Management    |  |
|  +---------------+  |
+----------+----------+
           |
           v
+---------------------+
|    Next.js Server   |
|                     |
|  +---------------+  |
|  | Server-Side   |  |
|  | Rendering     |<-+
|  +-------+-------+  |
|          |          |
|  +-------v-------+  |
|  | React Server  |  |
|  | Components    |  |
|  +---------------+  |
|                     |
|  +---------------+  |
|  | API Routes    |  |
|  +---------------+  |
|                     |
|  +---------------+  |
|  | Server Actions|  |
|  +---------------+  |
|                     |
|  +---------------+  |
|  | Middleware    |  |
|  +---------------+  |
+----------+----------+
           |
           v
+---------------------+     +---------------------+
| External Services   |     | Data Storage        |
|                     |     |                     |
| +---------------+   |     | +---------------+   |
| | Google        |   |     | | Supabase      |   |
| | Calendar API  |<--+---->| | Database      |   |
| +---------------+   |     | +---------------+   |
+---------------------+     +---------------------+
```

## Main Components

The architecture is composed of several interconnected components:

### 1. Authentication System

The authentication system is implemented using NextAuth.js and provides multiple authentication methods.

#### Component Diagram

```
+-------------------------+     +-------------------------+
| Authentication Components|     | Auth API               |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Login Form        |---+---->| | NextAuth API      |   |
| +-------------------+   |     | | Routes            |   |
|                         |     | +-------------------+   |
| +-------------------+   |     |          ^              |
| | Signup Form       |---+---->| +-------------------+   |
| +-------------------+   |     | | Signup API        |   |
|                         |     | +-------------------+   |
| +-------------------+   |     |                         |
| | OAuth Buttons     |---+---->| +-------------------+   |
| +-------------------+   |     | | Token Refresh API |   |
+-------------------------+     | +-------------------+   |
                                +-------------------------+
                                           |
                                           v
+-------------------------+     +-------------------------+
| Auth Configuration      |     | Auth Middleware        |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Auth Providers    |<--+-----| | Protected Routes  |   |
| +-------------------+   |     | +-------------------+   |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Session Config    |<--+-----| | Token Validation  |   |
| +-------------------+   |     | +-------------------+   |
|                         |     +-------------------------+
| +-------------------+   |                 |
| | Auth Callbacks    |<--+                 |
| +-------------------+   |                 v
+-------------------------+     +-------------------------+
                                | Auth Storage           |
                                |                         |
                                | +-------------------+   |
                                | | Session Store     |   |
                                | +-------------------+   |
                                |                         |
                                | +-------------------+   |
                                | | Token Store       |   |
                                | +-------------------+   |
                                +-------------------------+
```

#### Detailed Authentication Flow

**First-time User Registration:**
1. User navigates to `/signup` page
2. SignupForm component (`/src/components/signup-form/SignUpForm.tsx`) renders
3. User enters registration details
4. Form data validated with Zod schema
5. On submission, form calls signup API (`/src/app/api/auth/signup/route.ts`)
6. API creates new user in Supabase with hashed password
7. User redirected to login page
8. User completes login process
9. Session token created and stored
10. User redirected to dashboard

**Email/Password Authentication:**
1. User navigates to `/login` page
2. LoginForm component renders
3. User enters credentials
4. On submission, form calls NextAuth API (`/src/app/api/auth/[...nextauth]/route.ts`)
5. NextAuth credential provider validates credentials
6. If valid, JWT session token created
7. Session token stored in cookies
8. User redirected to dashboard

**Google OAuth Authentication:**
1. User clicks "Sign in with Google" button
2. NextAuth redirects to Google Auth endpoint
3. User grants permissions on Google's site
4. Google redirects to callback URL with auth code
5. NextAuth exchanges code for access and refresh tokens
6. User account created or retrieved in database
7. Google tokens stored in database
8. JWT session token created and stored
9. User redirected to dashboard

**Token Refresh Flow:**
1. When making authenticated requests, middleware checks token validity
2. If token expired, refresh token API called automatically
3. If refresh successful, new token stored and request continues
4. If refresh fails, user redirected to login

**Key Files:**
- `/src/app/api/auth/auth.config.ts`: NextAuth configuration
- `/src/app/api/auth/[...nextauth]/route.ts`: NextAuth API handler
- `/src/app/api/auth/signup/route.ts`: User registration endpoint
- `/src/app/api/auth/refresh-token/route.ts`: Token refresh logic
- `/src/middleware.ts`: Route protection middleware
- `/src/components/login-form/LoginForm.tsx`: Login UI component
- `/src/components/signup-form/SignUpForm.tsx`: Registration UI component

### 2. Calendar Interface

The calendar interface is the core of the application, providing visualization and management of events.

#### Component Diagram

```
+-------------------------+     +-------------------------+
| Calendar Page           |     | Calendar Components     |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Week View         |---+---->| | Week Grid Client  |   |
| +-------------------+   |     | +-------------------+   |
|                         |     |          |              |
| +-------------------+   |     | +-------------------+   |
| | Calendar Sidebar  |   |     | | Time Slots        |<--+
| +-------------------+   |     | +-------------------+   |
|          |              |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Date Picker       |<--+-----| | Event Cards       |<--+
| +-------------------+   |     | +-------------------+   |
+-------------------------+     |          |              |
                                | +-------------------+   |
                                | | Create Event Modal|<--+
                                | +-------------------+   |
                                |                         |
                                | +-------------------+   |
                                | | Edit Event Modal  |<--+
                                | +-------------------+   |
                                +-------------------------+
                                           |
                                           v
+-------------------------+     +-------------------------+
| Calendar Data           |     | Calendar Logic          |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Supabase Events   |<--+---->| | Recurrence Logic  |   |
| +-------------------+   |     | +-------------------+   |
|          ^              |     |                         |
|          |              |     | +-------------------+   |
| +-------------------+   |     | | Event Mapping     |   |
| | Google Events     |<--+---->| +-------------------+   |
| +-------------------+   |     |                         |
|          ^              |     | +-------------------+   |
|          |              |     | | Time Zone Handling|   |
| +-------------------+   |     | +-------------------+   |
| | Events Store      |<--+     +-------------------------+
| +-------------------+   |
+-------------------------+
```

#### Detailed Calendar Flow

**Calendar View Loading:**
1. User navigates to `/calendar` page
2. Server component renders initial page
3. Client hydration occurs
4. WeekGridClient component initializes
5. Date range for current view calculated
6. Event fetching triggered through `useEvents` hook
7. Local events fetched from Supabase
8. If Google connected, Google events also fetched
9. Events processed (recurring events expanded)
10. Events positioned on grid based on time slots
11. Calendar view rendered with events

**Event Creation Flow:**
1. User clicks on time slot or "Create Event" button
2. CreateEventModal component opens
3. User fills event details (title, time, recurrence, etc.)
4. On submission, form validated with Zod schema
5. If Google connected, choice to save to Google or locally
6. Server action `createEvent` called
7. Event stored in Supabase database
8. If selected, event also created in Google Calendar via API
9. Calendar view refreshed with new event
10. Success notification shown

**Event Editing Flow:**
1. User clicks existing event
2. Event details fetched (differs for Google vs. local events)
3. EditEventModal component opens with pre-filled data
4. User modifies event details
5. On submission, server action `updateEvent` called
6. Event updated in appropriate storage (Supabase and/or Google)
7. Calendar view refreshed
8. Success notification shown

**Recurring Event Handling:**
1. When creating event, user can set recurrence pattern
2. Pattern stored as RRULE format string
3. On calendar load, recurrence engine processes rules
4. Virtual event instances generated for view date range
5. Events rendered with recurring indicator
6. When editing, user can edit series or single instance

**Key Files:**
- `/src/components/calendar/week-view/WeekGridClient.tsx`: Main calendar grid component
- `/src/components/calendar/week-view/components/event/EventCard.tsx`: Event display component
- `/src/components/calendar/week-view/components/create-event-modal/CreateEventModal.tsx`: Event creation UI
- `/src/lib/calendar/recurrence.ts`: Recurrence handling logic
- `/src/lib/actions/calendar.ts`: Calendar server actions
- `/src/hooks/useEvents.ts`: Custom hook for event fetching and state

### 3. Google Calendar Integration

The Google integration allows seamless connection with Google Calendar for synchronization of events.

#### Component Diagram

```
+-------------------------+     +-------------------------+
| Google Integration UI   |     | Google Context          |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Connect Button    |---+---->| | Google Connection |   |
| +-------------------+   |     | | Context           |   |
|                         |     | +-------------------+   |
| +-------------------+   |     |          |              |
| | Connection Status |<--+-----| +-------------------+   |
| +-------------------+   |     | | Connection State  |   |
|                         |     | +-------------------+   |
| +-------------------+   |     +-------------------------+
| | Sync Controls     |---+                |
| +-------------------+   |                |
+-------------------------+                |
                                           v
+-------------------------+     +-------------------------+
| Google API              |     | Token Storage           |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Google Auth API   |<--+---->| | Supabase DB      |   |
| +-------------------+   |     | +-------------------+   |
|                         |     +-------------------------+
| +-------------------+   |                |
| | Google Calendar   |   |                |
| | API               |   |                v
| +-------------------+   |     +-------------------------+
|                         |     | Sync Logic              |
| +-------------------+   |     |                         |
| | Token Refresh API |<--+     | +-------------------+   |
| +-------------------+   |     | | Event Mapping     |   |
+-------------------------+     | +-------------------+   |
                                |                         |
                                | +-------------------+   |
                                | | Conflict          |   |
                                | | Resolution        |   |
                                | +-------------------+   |
                                |                         |
                                | +-------------------+   |
                                | | Differential Sync |   |
                                | +-------------------+   |
                                +-------------------------+
```

#### Detailed Google Integration Flow

**Connection Establishment:**
1. User navigates to settings or calendar page
2. Connection status checked via GoogleConnectionContext
3. If not connected, "Connect Google" button shown
4. User clicks button
5. Redirect to Google OAuth consent screen
6. User grants calendar access permissions
7. Google redirects to callback URL with auth code
8. Server exchanges code for access and refresh tokens
9. Tokens stored in Supabase database
10. Connection status updated in UI
11. Initial sync triggered automatically

**Calendar Synchronization:**
1. After connection or manual sync trigger
2. `syncGoogleEvents` server action called
3. Token refreshed if needed
4. Google Calendar API queried for events in date range
5. Events transformed from Google format to app format
6. Events stored/updated in Supabase
7. Local events mapped for Google (only if two-way sync)
8. Local events pushed to Google Calendar (if two-way sync)
9. Sync status updated
10. Calendar UI refreshed with merged events

**Token Refresh Process:**
1. Before any Google API request, token validity checked
2. If token expired, refresh token used to get new access token
3. New tokens stored in database
4. Original request continues with new token
5. If refresh fails, user notified of connection issue

**Key Files:**
- `/src/contexts/GoogleConnectionContext.tsx`: Google connection state management
- `/src/components/google/GoogleConnectButton.tsx`: Connection UI component
- `/src/app/api/google/sync/route.ts`: Synchronization API endpoint
- `/src/app/api/auth/refresh-google/route.ts`: Token refresh endpoint
- `/src/lib/actions/calendar.ts`: Calendar actions including Google sync
- `/src/lib/calendar/google.ts`: Google Calendar utility functions

### 4. UI Component System

The UI system provides a consistent and responsive user interface throughout the application.

#### Component Hierarchy

```
+-------------------------+     +-------------------------+
| Layout Components       |     | Theme System            |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Root Layout       |---+---->| | Theme Provider    |   |
| +-------------------+   |     | +-------------------+   |
|          |              |     |          |              |
| +-------------------+   |     | +-------------------+   |
| | Auth Layout       |<--+-----| | Color Scheme      |   |
| +-------------------+   |     | +-------------------+   |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Dashboard Layout  |<--+-----| | Typography        |   |
| +-------------------+   |     | +-------------------+   |
+----------+----------+---+     +-------------------------+
           |              |
           |              |
           v              v
+-------------------------+     +-------------------------+
| Composed UI Components  |     | Base UI Components      |
|                         |     |                         |
| +-------------------+   |     | +-------------------+   |
| | Calendar          |---+---->| | Button            |   |
| | Components        |   |     | +-------------------+   |
| +-------------------+   |     |                         |
|                         |     | +-------------------+   |
| +-------------------+   |     | | Input             |   |
| | Auth Components   |---+---->| +-------------------+   |
| +-------------------+   |     |                         |
|                         |     | +-------------------+   |
| +-------------------+   |     | | Modal             |   |
| | Settings          |---+---->| +-------------------+   |
| | Components        |   |     |                         |
| +-------------------+   |     | +-------------------+   |
+-------------------------+     | | Form              |   |
                                | +-------------------+   |
                                |                         |
                                | +-------------------+   |
                                | | Select            |   |
                                | +-------------------+   |
                                |                         |
                                | +-------------------+   |
                                | | Tabs              |   |
                                | +-------------------+   |
                                +-------------------------+
```

#### Detailed UI Interaction Flow

**Theme and Layout:**
1. Root layout (`/src/app/layout.tsx`) initializes core providers
2. ThemeProvider applies selected theme (dark/light)
3. Layout selection based on authentication status
4. For authenticated users, dashboard layout applied
5. For unauthenticated users, auth layout applied
6. Responsive adaptations based on viewport size

**Component Composition:**
1. Base UI components from shadcn/ui provide foundation
2. Domain-specific components compose base components
3. Layout components provide structural container
4. Server components used where possible for performance
5. Client components used for interactive elements
6. Atomic design pattern followed for composition

**Form Handling:**
1. Forms use React Hook Form for state management
2. Zod schemas define validation rules
3. Form submission triggers server actions
4. Error messages displayed inline with fields
5. Loading states shown during async operations

**Key Files:**
- `/src/app/layout.tsx`: Root layout component
- `/src/components/ui/`: Base UI components
- `/src/styles/globals.css`: Global styles
- `/tailwind.config.ts`: Tailwind configuration

## Directory Structure Explained

The codebase follows a domain-driven directory structure:

```
skillize-mvp/
├── src/
│   ├── app/                  # App router pages and layouts
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── events/       # Event management endpoints
│   │   │   ├── google/       # Google integration endpoints
│   │   │   └── users/        # User management endpoints
│   │   ├── calendar/         # Calendar page
│   │   ├── login/            # Login page
│   │   ├── settings/         # Settings pages
│   │   ├── signup/           # Signup page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── calendar/         # Calendar specific components
│   │   │   └── week-view/    # Week view calendar components
│   │   ├── login-form/       # Login form components
│   │   ├── signup-form/      # Signup form components
│   │   ├── ui/               # Reusable UI components
│   │   ├── google/           # Google integration components
│   │   ├── settings/         # Settings components
│   │   └── providers/        # Context providers
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and modules
│   │   ├── actions/          # Server actions
│   │   ├── auth/             # Authentication utilities
│   │   ├── calendar/         # Calendar utilities
│   │   └── supabase/         # Supabase client and utilities
│   ├── styles/               # Global styles
│   └── types/                # TypeScript type definitions
```

### Directory Organization Rationale

1. **App Directory**: Contains all Next.js App Router pages, layouts, and API routes
   - Each route has its own directory with `page.tsx` file
   - API routes are organized by domain (auth, events, etc.)
   - Layout files provide consistent UI structure

2. **Components Directory**: Contains reusable React components organized by feature domain
   - UI components: Base UI elements from shadcn/ui
   - Feature-specific components: Organization reflects feature hierarchy
   - Each component follows single responsibility principle
   - Higher-level components compose lower-level ones

3. **Contexts Directory**: Contains React Context providers for global state
   - Each context focuses on a specific domain
   - Provides state and actions related to that domain
   - Used for cross-component state sharing

4. **Hooks Directory**: Contains custom React hooks
   - Data fetching hooks abstract API calls
   - UI utility hooks for responsive behavior
   - Business logic hooks encapsulate complex operations

5. **Lib Directory**: Contains utility functions organized by domain
   - Actions: Server actions for data mutations
   - Auth: Authentication utilities
   - Calendar: Calendar-specific utilities
   - Supabase: Database client and utilities

6. **Types Directory**: Contains TypeScript type definitions
   - Shared types used across multiple files
   - Organized by domain for easy reference

## Code Flow Examples

### Example 1: User Authentication Flow

```
┌────┐       ┌─────────────┐      ┌──────────────┐     ┌────────────┐     ┌─────────────┐
│User│       │Login Form UI│      │NextAuth API  │     │Supabase DB │     │Google OAuth │
└─┬──┘       └─────┬───────┘      └──────┬───────┘     └─────┬──────┘     └──────┬──────┘
  │                │                     │                   │                   │
  │ Enter credentials                    │                   │                   │
  │───────────────>│                     │                   │                   │
  │                │                     │                   │                   │
  │                │ Submit login        │                   │                   │
  │                │────────────────────>│                   │                   │
  │                │                     │                   │                   │
  │                │                     │                   │                   │
  │                │                     │───────────────────┘                   │
  │                │                     │ Email/Password Login                  │
  │                │                     │ ┌──────────────────┐                  │
  │                │                     │ │Verify credentials│                  │
  │                │                     │ └────────┬─────────┘                  │
  │                │                     │          │                            │
  │                │                     │<─────────┘                            │
  │                │                     │ Validation result                     │
  │                │                     │                                       │
  │                │                     │                                       │
  │                │                     │ Google Login                          │
  │                │                     │ ┌─────────────────┐                   │
  │                │                     │ │Redirect to OAuth│                   │
  │                │                     │ └───────┬─────────┘                   │
  │                │                     │         │                             │
  │                │                     │         │─────────────────────────────>
  │                │                     │                                       │
  │<─────────────────────────────────────┘───────────────────────────────────────┘
  │ Grant permissions                                                            │
  │─────────────────────────────────────────────────────────────────────────────>│
  │                                                                              │
  │                                      │<──────────────────────────────────────┘
  │                                      │ Auth callback with code               │
  │                                      │                                       │
  │                                      │ ┌────────────────┐                    │
  │                                      │ │Exchange code 4 │                    │
  │                                      │ │tokens          │                    │
  │                                      │ └───────┬────────┘                    │
  │                                      │         │                             │
  │                                      │         │─────────────────────────────>
  │                                      │                                       │
  │                                      │<──────────────────────────────────────┘
  │                                      │ Access & refresh tokens               │
  │                                      │                                       │
  │                                      │───────────────────>│                  |
  │                                      │ Store tokens       │                  │
  │                                      │                    │                  │
  │                                      │<───────────────────┘                  │
  │                                      │                                       │
  │                                      │ ┌────────────────┐                    │
  │                                      │ │Generate session│                    │
  │                                      │ │JWT             │                    │
  │                                      │ └───────┬────────┘                    │
  │                                      │         │                             │
  │                                      │<────────┘                             │
  │                │<─────────────────────┘                                      │
  │                │ Session cookie & redirect                                   │
  │                │                                                             │
  │<───────────────┘                                                             │
  │ Redirect to dashboard                                                        │
  │                                                                              │
```

**File Interactions:**
1. `/src/components/login-form/LoginForm.tsx` - User interface
2. `/src/app/api/auth/[...nextauth]/route.ts` - API endpoint
3. `/src/app/api/auth/auth.config.ts` - Auth configuration
4. `/src/lib/supabase/getClient.ts` - Database access

### Example 2: Calendar Event Creation Flow

```
┌──────┐          ┌────────────┐          ┌──────────────┐       ┌──────────────┐       ┌─────────┐ ┌───────────┐
│ User │          │ Calendar UI│          │Create Event  │       │Server Action │       │Supabase │ │Google     │
│      │          │            │          │Modal         │       │              │       │DB       │ │Calendar API│
└──┬───┘          └─────┬──────┘          └──────┬───────┘       └──────┬───────┘       └────┬────┘ └─────┬─────┘
   │                    │                        │                      │                    │            │
   │ Click new button   │                        │                      │                    │            │
   │───────────────────>│                        │                      │                    │            │
   │                    │                        │                      │                    │            │
   │                    │ Open modal             │                      │                    │            │
   │                    │───────────────────────>│                      │                    │            │
   │                    │                        │                      │                    │            │
   │ Fill event details │                        │                      │                    │            │
   │───────────────────────────────────────────> │                      │                    │            │
   │                    │                        │                      │                    │            │
   │                    │                        │ Validate form (Zod)  │                    │            │
   │                    │                        │───────────────────┐  │                    │            │
   │                    │                        │                   │  │                    │            │
   │                    │                        │<──────────────────┘  │                    │            │
   │                    │                        │                      │                    │            │
   │                    │                        │ Submit event         │                    │            │
   │                    │                        │─────────────────────>│                    │            │
   │                    │                        │                      │                    │            │
   │                    │                        │                      │ Create Google event│            │
   │                    │                        │                      │────────────────────────────────>│
   │                    │                        │                      │                    │            │
   │                    │                        │                      │<────────────────────────────────│
   │                    │                        │                      │ Google event ID    │            │
   │                    │                        │                      │                    │            │
   │                    │                        │                      │ Store event        │            │
   │                    │                        │                      │───────────────────>│            │
   │                    │                        │                      │                    │            │
   │                    │                        │                      │<───────────────────│            │
   │                    │                        │                      │ Success confirm    |            │
   │                    │                        │                      │                    │            │
   │                    │                        │<─────────────────────│                    │            │
   │                    │                        │ Success response     │                    │            │
   │                    │                        │                      │                    │            │
   │                    │<───────────────────────│                      │                    │            │
   │                    │ Close modal & update   │                      │                    │            │
   │                    │                        │                      │                    │            │
   │<───────────────────│                        │                      │                    │            │
   │ Show updated calendar                       │                      │                    │            │
   │                    │                        │                      │                    │            │
```

**File Interactions:**
1. `/src/components/calendar/week-view/WeekGridClient.tsx` - Calendar UI
2. `/src/components/calendar/week-view/components/create-event-modal/CreateEventModal.tsx` - Modal UI
3. `/src/lib/actions/calendar.ts` - Server action
4. `/src/lib/calendar/google.ts` - Google API utilities
5. `/src/hooks/useEvents.ts` - Event data hook

## See Also

- [Component Documentation](./03-components.md) - Detailed component documentation
- [State Management](./04-state-management.md) - State management approach
- [API Documentation](./05-api-documentation.md) - API endpoints and usage
- [Database Schema](./06-database-schema.md) - Database structure and relationships 