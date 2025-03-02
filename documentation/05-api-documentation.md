# SKILLIZE MVP - API DOCUMENTATION

## API Overview

The API layer of Skillize MVP consists of three main components:
1. **Next.js API Routes** - RESTful endpoints for client-server communication
2. **Server Actions** - Direct function calls from client to server
3. **External API Integration** - Integration with Google Calendar API

This document provides comprehensive documentation for each API endpoint and server action, including request/response formats, authentication requirements, and error handling.

## API Architecture Overview

```
+-----------------------+
|     Client Side       |
|                       |
| +-------------------+ |
| | React Components  | |
| +-------------------+ |
|           |           |
| +-------------------+ |
| | React Query       | |
| +-------------------+ |
+-----------|-----------+
             |
             v
 +-----------------------+
 |      API Layer        |
 |                       |
 | +-------------------+ |
 | | Next.js API Routes| |<----+
 | +-------------------+ |     |
 |           |           |     |
 | +-------------------+ |     |
 | | Server Actions    |<------+
 | +-------------------+ |     |
 |           |           |     |
 | +-------------------+ |     |
 | | Next.js Middleware| |     |
 | +-------------------+ |     |
 +-----------|-----------+     |
             |                 |
             v                 |
 +-----------------------+     |
 |   Backend Services    |     |
 |                       |     |
 | +-------------------+ |     |
 | | React Server      | |     |
 | | Components        | |     |
 | +-------------------+ |     |
 |           |           |     |
 | +-------------------+ |     |
 | | Supabase Client   | |     |
 | +-------------------+ |     |
 +-----------|-----------+     |
             |                 |
             v                 |
 +-----------------------+     |
 |  External Services    |     |
 |                       |     |
 | +-------------------+ |     |
 | | Google Calendar   | |     |
 | | API               | |     |
 | +-------------------+ |     |
 |                       |     |
 | +-------------------+ |     |
 | | Supabase API      | |     |
 | +-------------------+ |     |
 +-----------------------+     |
                               |
 +---------------------------+ |
 |                           |-+
 |       Client Side         |
 +---------------------------+
```

## Authentication Flow

```
User        Client App       Auth API        JWT Service      Database
 |              |               |                |               |
 |              |               |                |               |
 | Enter        |               |                |               |
 | Credentials  |               |                |               |
 |------------->|               |                |               |
 |              | POST /api/auth/signin          |               |
 |              |-------------->|                |               |
 |              |               |                |               |
 |              |               | Verify Credentials             |
 |              |               |------------------------------->|
 |              |               |                |               |
 |              |               |                |               |
 |              |               |                |               |
 |              |               |                |               |
 |              |               |                |               |
 |---------Valid Credentials Path---------------->               |
 |              |               |                |               |
 |              |               | User Found + Password Match    |
 |              |               |<-------------------------------|
 |              |               |                |               |
 |              |               | Generate Tokens|               |
 |              |               |--------------->|               |
 |              |               |                |               |
 |              |               | Access & Refresh Tokens        |
 |              |               |<---------------|               |
 |              |               |                |               |
 |              | Return Tokens + User Data      |               |
 |              |<--------------|                |               |
 |              |               |                |               |
 |              | Store in Auth |                |               |
 |              | Context       |                |               |
 |              |-------------->|                |               |
 |              |               |                |               |
 | Redirect to  |               |                |               |
 | Dashboard    |               |                |               |
 |<-------------|               |                |               |
 |              |               |                |               |
 |              |               |                |               |
 |---------Invalid Credentials Path-------------->               |
 |              |               |                |               |
 |              |               | User Not Found/Password Mismatch
 |              |               |<-------------------------------|
 |              |               |                |               |
 |              | 401 Unauthorized               |               |
 |              |<--------------|                |               |
 |              |               |                |               |
 | Show Error   |               |                |               |
 | Message      |               |                |               |
 |<-------------|               |                |               |
 |              |               |                |               |
 |              |               |                |               |
 |              | Request with Bearer Token      |               |
 |              |-------------->|                |               |
 |              |               |                |               |
 |              |               | Validate Token |               |
 |              |               |--------------->|               |
 |              |               |                |               |
 |              |               |                |               |
 |---------Valid Token Path--------------------->|               |
 |              |               |                |               |
 |              |               | Token Valid    |               |
 |              |               |<---------------|               |
 |              |               |                |               |
 |              | Process Request               |               |
 |              |<--------------|                |               |
 |              |               |                |               |
 |              |               |                |               |
 |---------Expired Token Path------------------>|                |
 |              |               |                |               |
 |              |               | Token Expired  |               |
 |              |               |<---------------|               |
 |              |               |                |               |
 |              | 401 Unauthorized               |               |
 |              |<--------------|                |               |
 |              |               |                |               |
 |              | POST /api/auth/refresh         |               |
 |              |-------------->|                |               |
 |              |               |                |               |
 |              |               | Generate New Tokens            |
 |              |               |--------------->|               |
 |              |               |                |               |
 |              |               | New Access & Refresh Tokens    |
 |              |               |<---------------|               |
 |              |               |                |               |
 |              | Return New Tokens              |               |
 |              |<--------------|                |               |
 |              |               |                |               |
```

## Google Calendar Integration Flow

```
User        Skillize App    API Layer      Database     OAuth Service   Google API
 |              |               |              |              |              |
 |              |               |              |              |              |
 | Request to   |               |              |              |              |
 | Connect      |               |              |              |              |
 | Google Cal   |               |              |              |              |
 |------------->|               |              |              |              |
 |              | Initiate      |              |              |              |
 |              | OAuth Flow    |              |              |              |
 |              |-------------->|              |              |              |
 |              |               |              |              |              |
 |              |               | Request Authorization URL   |              |
 |              |               |------------------------------------------>|
 |              |               |              |              |              |
 |              |               | Return Authorization URL    |              |
 |              |               |<------------------------------------------|
 |              |               |              |              |              |
 |              | Redirect to   |              |              |              |
 |              | Google Auth   |              |              |              |
 |              |<--------------|              |              |              |
 |              |               |              |              |              |
 |              | Display      |              |              |              |
 |              | Google Login |              |              |              |
 |              | & Consent    |              |              |              |
 |<-------------|               |              |              |              |
 |              |               |              |              |              |
 |              | Grant        |              |              |              |
 |              | Permissions  |              |              |              |
 |---------------------------------------------------------->|              |
 |              |               |              |              |              |
 |              | Redirect with Authorization Code            |              |
 |              |<----------------------------------------------------------|
 |              |               |              |              |              |
 |              | Exchange Code |              |              |              |
 |              | for Tokens    |              |              |              |
 |              |-------------->|              |              |              |
 |              |               |              |              |              |
 |              |               | Request Access & Refresh Tokens            |
 |              |               |------------------------------------------>|
 |              |               |              |              |              |
 |              |               | Return OAuth Tokens                        |
 |              |               |<------------------------------------------|
 |              |               |              |              |              |
 |              |               | Store        |              |              |
 |              |               | Encrypted    |              |              |
 |              |               | Tokens       |              |              |
 |              |               |------------->|              |              |
 |              |               |              |              |              |
 |              |               | Confirm      |              |              |
 |              |               | Storage      |              |              |
 |              |               |<-------------|              |              |
 |              |               |              |              |              |
 |              | Connection    |              |              |              |
 |              | Successful    |              |              |              |
 |              |<--------------|              |              |              |
 |              |               |              |              |              |
 |              |               |              |              |              |
 |              |               |              |              |              |
 |-----Valid Tokens Path------>|              |              |              |
 |              |               | Request Calendar Events                    |
 |              |               |------------------------------------------>|
 |              |               |              |              |              |
 |              |               | Return Calendar Events                     |
 |              |               |<------------------------------------------|
 |              |               |              |              |              |
 |              |               | Update Local |              |              |
 |              |               | Events       |              |              |
 |              |               |------------->|              |              |
 |              |               |              |              |              |
 |              |               | Confirm      |              |              |
 |              |               | Update       |              |              |
 |              |               |<-------------|              |              |
 |              |               |              |              |              |
 |              | Sync Complete |              |              |              |
 |              |<--------------|              |              |              |
 |              |               |              |              |              |
 |              |               |              |              |              |
 | Display      |               |              |              |              |
 | Sync Status  |               |              |              |              |
 |<-------------|               |              |              |              |
 |              |               |              |              |              |
 |              |               |              |              |              |
 |-----Expired Tokens Path---->|              |              |              |
 |              |               | Request Token Refresh                      |
 |              |               |------------------------------------------>|
 |              |               |              |              |              |
 |              |               | New Access Token                           |
 |              |               |<------------------------------------------|
 |              |               |              |              |              |
 |              |               | Update Stored|              |              |
 |              |               | Tokens       |              |              |
 |              |               |------------->|              |              |
 |              |               |              |              |              |
 |              |               | Request Calendar Events                    |
 |              |               |------------------------------------------>|
 |              |               |              |              |              |
 |              |               |              |              |              |
 |-----Failed Refresh Path---->|              |              |              |
 |              |               |              |              |              |
 |              |               | Refresh Failed                             |
 |              |               |<------------------------------------------|
 |              |               |              |              |              |
 |              |               | Authentication|              |              |
 |              |               | Required      |              |              |
 |              |<--------------|              |              |              |
 |              |               |              |              |              |
 |              |               |              |              |              |
 | Request      |               |              |              |              |
 | Re-auth      |               |              |              |              |
 |<-------------|               |              |              |              |
 |              |               |              |              |              |
```

## Authentication API

### API Routes

#### `POST /api/auth/signup`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response Codes:**
- `201 Created`: User successfully created
  ```json
  {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- `400 Bad Request`: Invalid input
  ```json
  {
    "error": "Invalid input",
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
  ```
- `409 Conflict`: Email already exists
  ```json
  {
    "error": "Email already exists"
  }
  ```

#### `POST /api/auth/[...nextauth]`

NextAuth.js endpoint for handling multiple providers and authentication flows.

**Supports:**
- Email/Password authentication
- Google OAuth
- Token refresh
- Session management

#### `GET /api/auth/refresh-google`

Refreshes Google OAuth tokens.

**Authentication:** JWT token required

**Response Codes:**
- `200 OK`: Tokens refreshed successfully
  ```json
  {
    "expires_at": "2023-12-31T23:59:59Z",
    "success": true
  }
  ```
- `401 Unauthorized`: Invalid authentication
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- `500 Internal Server Error`: Server error occurred
  ```json
  {
    "error": "Failed to refresh tokens"
  }
  ```

## Calendar API

### API Routes

#### `GET /api/events`

Retrieves events for a specified date range.

**Authentication:** JWT token required

**Query Parameters:**
- `startDate`: ISO string of the start date (required)
- `endDate`: ISO string of the end date (required)

**Response Codes:**
- `200 OK`: Events retrieved successfully
  ```json
  {
    "events": [
      {
        "id": "evt_123",
        "title": "Team Meeting",
        "description": "Weekly sync",
        "startAt": "2023-10-15T10:00:00Z",
        "endAt": "2023-10-15T11:00:00Z",
        "isAllDay": false,
        "googleEventId": "google_evt_123"
      }
    ]
  }
  ```
- `401 Unauthorized`: Invalid authentication
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid date range",
    "details": "End date must be after start date"
  }
  ```

### Server Actions

#### `createEvent`

Creates a new calendar event.

**Parameters:**
```typescript
function createEvent(params: {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  isAllDay?: boolean;
  syncWithGoogle?: boolean;
}): Promise<Event>;
```

**Returns:** Created event object

**Example:**
```typescript
'use client';

import { createEvent } from '@/actions/events';
import { useMutation } from '@tanstack/react-query';

export function CreateEventButton() {
  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      console.log('Event created:', event);
    },
  });
  
  return (
    <button
      onClick={() => 
        mutation.mutate({
          title: 'New Meeting',
          startAt: new Date('2023-10-20T09:00:00Z'),
          endAt: new Date('2023-10-20T10:00:00Z'),
          syncWithGoogle: true,
        })
      }
    >
      Create Event
    </button>
  );
}
```

#### `updateEvent`

Updates an existing calendar event.

**Parameters:**
```typescript
function updateEvent(params: {
  id: string;
  title?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  isAllDay?: boolean;
  syncWithGoogle?: boolean;
}): Promise<Event>;
```

**Returns:** Updated event object

#### `deleteEvent`

Deletes a calendar event.

**Parameters:**
```typescript
function deleteEvent(params: {
  id: string;
  deleteFromGoogle?: boolean;
}): Promise<{ success: boolean }>;
```

**Returns:** Success status

## Google Integration API

### API Routes

#### `GET /api/google/sync`

Synchronizes events between the application and Google Calendar.

**Authentication:** JWT token required

**Response Codes:**
- `200 OK`: Sync completed successfully
  ```json
  {
    "added": 5,
    "updated": 2,
    "deleted": 1,
    "syncTime": "2023-10-16T15:45:30Z"
  }
  ```
- `401 Unauthorized`: Invalid authentication
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- `404 Not Found`: Google connection not found
  ```json
  {
    "error": "Google Calendar not connected"
  }
  ```
- `500 Internal Server Error`: Sync failed
  ```json
  {
    "error": "Failed to sync with Google Calendar",
    "details": "API quota exceeded"
  }
  ```

## User API

### API Routes

#### `GET /api/users/me`

Retrieves the current user's profile.

**Authentication:** JWT token required

**Response Codes:**
- `200 OK`: Profile retrieved successfully
  ```json
  {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-09-01T12:34:56Z",
      "preferences": {
        "theme": "dark",
        "defaultView": "week"
      }
    }
  }
  ```
- `401 Unauthorized`: Invalid authentication
  ```json
  {
    "error": "Unauthorized"
  }
  ```

## API Request-Response Flow

```
                                 +-------------------+
                                 | Client Component  |
                                 +--------+----------+
                                          |
                                          | API Request
                                          v
 +--------------------------------------------------------------+
 |                    API Request Processing                    |
 |                                                              |
 |  +----------------+        +----------------+                |
 |  |                |        |                |                |
 |  | API Route      |------->| Input          |                |
 |  | Handler        |        | Validation     |                |
 |  |                |        |                |                |
 |  +----------------+        +--------+-------+                |
 |                                     |                        |
 |                                     |                        |
 |                            +--------v-------+                |
 |                            |                |                |
 |       +---Valid----------->| Auth Check     |                |
 |       |                    |                |                |
 |       |                    +--------+-------+                |
 |       |                             |                        |
 |       |                             |                        |
 |       |                    +--------v-------+                |
 |       |                    |                |                |
 |       |     +--Authorized->| Business Logic |                |
 |       |     |              |                |                |
 |       |     |              +--------+-------+                |
 |       |     |                       |                        |
 |       |     |              +--------v-------+                |
 |       |     |              |                |                |
 |       |     |              | Database       |                |
 |       |     |              | Operation      |                |
 |       |     |              |                |                |
 |       |     |              +--------+-------+                |
 |       |     |                       |                        |
 +-------|-----|---Invalid-------------|------------------------+
         |     |                       |
         |     |                       |
 +-------v-----|----------------Success|------------------------+
 |              Response Handling      |                        |
 |                                     |                        |
 |  +----------------+                 |     +----------------+ |
 |  |                |                 |     |                | |
 |  | Validation     |                 |     | Success        | |
 |  | Error          |                 +---->| Response       | |
 |  |                |                       |                | |
 |  +-------+--------+                       +--------+-------+ |
 |          |                                         |         |
 |          |        +----------------+               |         |
 |          |        |                |               |         |
 |          |        | Auth Error     |               |         |
 |          |        |                |<--Unauthorized|         |
 |          |        +-------+--------+               |         |
 |          |                |                        |         |
 |          |        +-------v--------+               |         |
 |          |        |                |               |         |
 |          |        | Server Error   |<------Error---|         |
 |          |        |                |                         |
 |          |        +-------+--------+                         |
 |          |                |                                  |
 +----------|----------------|----------------------------------+
            |                |
            |                |
            v                v
      +-----+----------------+-----+
      |                            |
      |      Client Component      |
      |                            |
      +----------------------------+
```

## Server Action vs API Route Decision Flow

```
+-----------------------+
| New API Feature Needed|
+-----------+-----------+
            |
            v
      +-----+------+
      |            |
      | Is it a    |
      | mutation?  |
      |            |
      +-----+------+
            |
     +------+-------+
     |              |
Yes  |              | No
     v              v
+----+-----+   +----+-----+
|          |   |          |
| Accessed |   | Used in  |
| by       |   | RSC?     |
| external |   |          |
| clients? |   |          |
+----+-----+   +----+-----+
     |              |
+----+----+    +----+----+
|         |    |         |
| Yes     | No | Yes     | No
|         |    |         |
v         v    v         v
+-------+ +----+----+ +-------+ +----------+
| Use   | | Needs    | | Use   | | Requires |
| API   | | progress.| | Server| | complex  |
| Route | | enhance? | | Action| | middle-  |
|       | |          | |       | | ware?    |
+---+---+ +----+-----+ +---+---+ +-----+----+
    |          |           |           |
    |          |           |           |
    |     Yes  |           |     Yes   |
    |     +----v           |     +-----v
    |     |                |     |
    |     v                |     v
    |   +-+-------+        |   +-+-------+
    +-->|  Use    |        +-->|  Use    |
        |  API    |            |  API    |
        |  Route  |            |  Route  |
        +---------+            +---------+
            |                      |
            v                      |
    +-------+----------+           |
    | API Route Handler|           |
    | app/api/events/  |           |
    | route.ts         |           |
    |                  |           |
    | export async     |           |
    | function POST()  |           |
    | {...}            |           |
    +------------------+           |
                                   |
     No                            |
     |                             |
     v                             |
    ++----------------+            |
    | Use Server      |<-----------+
    | Action          |
    +-+---------------+
      |
      v
    +-+------------------+
    | Client Wrapper for |
    | React Query:       |
    | 'use client';      |
    | import { use-      |
    | Mutation } from    |
    | '@tanstack/react-  |
    | query';            |
    +--------------------+
```

## Error Handling

The API implements a consistent error handling strategy to provide clear error messages to clients.

### Error Types

1. **Validation Errors**: Return `400 Bad Request` with details about validation failures
2. **Authentication Errors**: Return `401 Unauthorized` when authentication is missing or invalid
3. **Permission Errors**: Return `403 Forbidden` when the user doesn't have permission
4. **Not Found Errors**: Return `404 Not Found` when the requested resource doesn't exist
5. **Server Errors**: Return `500 Internal Server Error` for unexpected errors

### Example Error Response

```json
{
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "message": "The request contains invalid data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2023-10-16T14:30:45Z",
  "requestId": "req_123abc"
}
```

### Error Handling Implementation

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  
  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
  
  static validation(message: string, details?: any) {
    return new ApiError(message, 400, 'VALIDATION_ERROR', details);
  }
  
  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }
  
  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }
  
  static notFound(message: string = 'Resource not found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }
  
  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

// Middleware for handling errors
export function errorHandler(err: unknown, req: Request, res: Response) {
  console.error(err);
  
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || createRequestId(),
    });
  }
  
  // Default to internal server error for unexpected errors
  return res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || createRequestId(),
  });
} 