import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string | null;
      refreshToken?: string | null;
      timezone?: string;
      googleId?: string;
      provider?: string;
    };
  }

  interface JWT {
    id?: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpires?: number;
    error?: string;
    googleId?: string;
    timezone?: string;
    provider?: string;
  }
} 