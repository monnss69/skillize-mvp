export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string; // ISO timestamp
  end_time: string;   // ISO timestamp
  color: string | null;
  recurrence_rule: string | null;      // RRULE string (e.g., "FREQ=WEEKLY;COUNT=10")
  is_recurring: boolean;               // Whether this is a recurring event
  recurrence_id: string | null;        // Series identifier
  source: string | null;
  status: "confirmed" | "cancelled",               // Source of the event ('google', 'local', etc.)
  created_at: string;
  updated_at: string;
}

export interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  start_time: string; // ISO timestamp
  end_time: string;   // ISO timestamp
  color: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OAuthConnection {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_sync_enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
  profile_data: Record<string, any> | null;
}

export interface Calendar {
  user_id: string;
  title: string;
  color: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  auth_type: "local" | "google" | "apple";
  google_id: string | null;
  timezone: string;
  email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_study_time: {
    start_time: string;
    end_time: string;
    preference: "morning" | "afternoon" | "evening";
  };
  study_duration: number;
  break_duration: number;
  learning_style: "visual" | "auditory" | "kinesthetic";
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string;
  duration: string; // PostgreSQL interval type represented as string in TypeScript
  difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
  estimated_completion_time: string; // PostgreSQL interval type represented as string in TypeScript
  created_at: string;
  updated_at: string;
}
