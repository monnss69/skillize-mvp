export interface UpdateUser {
  id: string;
  email?: string;
  username?: string;
  timezone?: string;
  avatar_url?: string;
}

export interface CreateUser {
  email: string;
  username: string;
  timezone: string;
  avatar_url?: string;
}

