# SKILLIZE MVP - OVERVIEW

## Purpose and Problem Statement

Skillize MVP is a personalized AI scheduler application designed to help users efficiently manage their time and events. The application addresses several key challenges in personal scheduling:

1. **Calendar Management**: Provides a modern, intuitive interface for scheduling and managing events
2. **Google Calendar Integration**: Offers seamless two-way synchronization with Google Calendar
3. **Authentication & User Management**: Secure user account system with multiple authentication methods
4. **Personalized Event Management**: Customizable event creation and management

### Target Users

- Professionals managing busy schedules
- Students organizing academic and personal activities
- Teams coordinating shared calendars
- Anyone seeking to optimize their time management

### Key Differentiators

- **Modern UI/UX**: Dark-themed, responsive interface built with Tailwind CSS and shadcn/ui
- **Google Calendar Integration**: Bidirectional synchronization with existing calendar systems
- **Multi-provider Authentication**: Flexible login options (credentials, OAuth)
- **NextJS 15 Architecture**: Leveraging the latest App Router and Server Components for optimal performance

## Technical Foundation

The application is built as a web-based solution using:

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions, Supabase
- **Authentication**: NextAuth.js
- **State Management**: React Query, Zustand
- **External APIs**: Google Calendar API

## Core Functionality Workflow

The application operates through these key workflows:

### User Authentication Workflow

```
┌──────────────┐
│              │
│  User Visits │
│     Site     │
│              │
└───────┬──────┘
        │
        ▼
┌──────────────┐     ┌───────────┐     ┌─────────────┐
│              │     │           │     │             │
│ Has Account? ├─No──►  Sign Up  ├────►  Complete   │
│              │     │           │     │  Sign Up    │
└───────┬──────┘     └───────────┘     │   Form      │
        │                              │             │
        │ Yes                          └──────┬──────┘
        │                                     │
        ▼                                     ▼
┌──────────────┐                      ┌──────────────┐
│              │                      │              │
│    Login     │                      │ Validate Form│
│              │                      │     Data     │
└───────┬──────┘                      │              │
        │                             └──────┬───────┘
        │                                    │
        ▼                                    ▼
┌──────────────┐                      ┌──────────────┐     ┌───────────────┐
│   Complete   │                      │ Create User  │     │  Redirect to  │
│  Login Form  │                      │  in Database │     │   Dashboard   │
│              │                      │              │     │               │
└───────┬──────┘                      └──────┬───────┘     └───────────────┘
        │                                    │
        ▼                                    ▼
┌──────────────┐                      ┌──────────────┐
│    Verify    │                      │  Create Auth │
│  Credentials │                      │   Session    │
│              │                      │              │
└───────┬──────┘                      └──────────────┘
        │
        ▼
┌──────────────────┐
│                  │
│  Login Method?   │
│                  │
└┬────────────────┬┘
 │                │
 │                │
Email/Password    Google OAuth
 │                │
 ▼                ▼
┌──────────┐     ┌────────────┐
│  Verify  │     │ Redirect   │
│ Password │     │ to Google  │
└────┬─────┘     └─────┬──────┘
     │                 │
     │                 ▼
     │           ┌────────────┐
     │           │Google Auth │
     │           │    Flow    │
     │           └─────┬──────┘
     │                 │
     │                 ▼
     │           ┌────────────┐
     │           │Get Google  │
     │           │  Tokens    │
     │           └─────┬──────┘
     │                 │
     ▼                 ▼
┌──────────────────────────┐
│                          │
│    Create Auth Session   │
│                          │
└────────────┬─────────────┘
             │
             ▼
┌───────────────────────────┐
│                           │
│   Access Protected Routes │
│                           │
└───────────────────────────┘
```

### Calendar Management Workflow

```
┌───────────────┐
│               │
│  User Opens   │
│   Calendar    │
│               │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│               │
│ Load Calendar │
│     View      │
│               │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│               │
│  Fetch User's │
│    Events     │
│               │
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│                   │
│ Has Google        │
│ Connection?       │
│                   │
└┬─────────────────┬┘
 │                 │
 │                 │
Yes                No
 │                 │
 ▼                 ▼
┌────────────┐    ┌──────────────┐
│            │    │              │
│ Sync with  │    │Display Local │
│ Google     │    │ Events Only  │
│ Calendar   │    │              │
│            │    │              │
└─────┬──────┘    └──────┬───────┘
      │                  │
      ▼                  │
┌───────────────────┐    │
│                   │    │
│ Merge Local &     │    │
│ Google Events     │    │
│                   │    │
└─────────┬─────────┘    │
          │              │
          ▼              ▼
┌───────────────────────────────────┐
│                                   │
│      Render Calendar with Events  │
│                                   │
└───────────────────┬───────────────┘
                    │
                    ▼
┌───────────────────────────────────┐
│                                   │
│      User Interacts with Calendar │
│                                   │
└───────────────────┬───────────────┘
                    │
                    ▼
┌────────────────────────────────────┐
│                                    │
│            Action Type?            │
│                                    │
└┬──────────────┬───────────────────┬┘
 │              │                   │
 │              │                   │
Create Event   Edit Event        Delete Event
 │              │                   │
 ▼              ▼                   ▼
┌────────┐  ┌────────────┐    ┌────────────┐
│        │  │            │    │            │
│ Open   │  │ Open Edit  │    │ Confirm &  │
│ Create │  │ Event      │    │ Delete     │
│ Event  │  │ Modal      │    │ Event      │
│ Modal  │  │            │    │            │
│        │  │            │    │            │
└───┬────┘  └─────┬──────┘    └─────┬──────┘
    │            │                 │
    ▼            ▼                 ▼
[Event Creation Flow]  [Event Edit Flow]  [Event Delete Flow]
```

### Google Integration Workflow

```
┌────────────────────┐
│                    │
│   User Accesses    │
│      Settings      │
│                    │
└──────────┬─────────┘
           │
           ▼
┌────────────────────────┐
│                        │
│  Navigate to Connected │
│        Services        │
│                        │
└───────────┬────────────┘
            │
            ▼
┌─────────────────────┐
│                     │
│  Already Connected? │
│                     │
└┬────────────────────┘
 │
 │
No                     Yes
 │                      │
 ▼                      ▼
┌────────────────┐    ┌────────────────┐
│                │    │                │
│ Click Connect  │    │ View Connected │
│     Google     │    │     Status     │
│                │    │                │
└───────┬────────┘    └┬──────────────┬┘
        │              │              │
        ▼              │              │
┌────────────────┐     │              │
│                │     │              │
│  Redirect to   │     ▼              ▼
│  Google OAuth  │   ┌──────────────┐ ┌────────────┐
│                │   │              │ │            │
└───────┬────────┘   │View Connected│ │ Disconnect │
        │            │  Calendars   │ │   Option   │
        ▼            │              │ │            │
┌────────────────┐   └──────────────┘ └──────┬─────┘
│                │                           │
│  User Grants   │                           ▼
│Calendar Perms  │                    ┌──────────────┐
│                │                    │              │
└───────┬────────┘                    │    Revoke    │
        │                             │Google Access │
        ▼                             │              │
┌────────────────┐                    └──────┬───────┘
│                │                           │
│  Redirect to   │                           ▼
│  Callback URL  │                    ┌──────────────┐
│                │                    │              │
└───────┬────────┘                    │Remove Tokens │
        │                             │  from DB     │
        ▼                             │              │
┌────────────────┐                    └──────┬───────┘
│                │                           │
│Exchange Code   │                           ▼
│   for Tokens   │                    ┌──────────────┐
│                │                    │              │
└───────┬────────┘                    │    Update    │
        │                             │ Connection   │
        ▼                             │    Status    │
┌────────────────┐                    │              │
│                │                    └──────────────┘
│  Store Access  │
│& Refresh Tokens│
│                │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│                │
│Update Connect  │
│    Status      │
│                │
└───────┬────────┘
        │
        ▼
┌──────────────────┐
│                  │
│ Trigger Initial  │
│      Sync        │
│                  │
└───────┬──────────┘
        │
        ▼
┌─────────────────────┐
│                     │
│ Fetch Google        │
│ Calendar Events     │
│                     │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│                      │
│ Map to Application   │
│      Format          │
│                      │
└───────────┬──────────┘
            │
            ▼
┌───────────────────────┐
│                       │
│ Merge with Local      │
│     Events            │
│                       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│                       │
│ Update UI with        │
│    New Events         │
│                       │
└───────────────────────┘
```

## Data Flow and Storage

The application uses a hybrid data approach:

1. **User Data**:
   - Authentication details stored in Supabase
   - User profiles and preferences in Supabase database
   - Sessions managed through NextAuth

2. **Calendar Data**:
   - Local events stored in Supabase database
   - Google events fetched from Google Calendar API
   - Merged and displayed in the client UI

3. **Integration Data**:
   - OAuth tokens stored securely in Supabase
   - Refresh operations managed through server-side code

## Next Steps and Development Roadmap

The Skillize MVP is planned to evolve with these features:

1. **Enhanced AI Scheduling**: Smart scheduling recommendations
2. **Additional Calendar Providers**: Microsoft Outlook, Apple Calendar
3. **Team Collaboration**: Shared calendars and scheduling
4. **Mobile Applications**: Native iOS and Android apps

## Source Code Organization

See the [Architecture](./02-architecture.md) document for details on codebase structure. 