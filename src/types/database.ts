export interface Event {
  id: string;
  user_id: string;
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