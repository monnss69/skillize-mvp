// src/app/api/auth/auth.config.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { ExtendedSession } from '@/types';
import { compare } from 'bcryptjs';
import { createClient } from '@/lib/supabase/server';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = 'https://oauth2.googleapis.com/token';

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // 1 hour
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider with custom profile mapping
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code",
          scope: "https://www.googleapis.com/auth/calendar openid profile email",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          google_id: profile.sub, // Save the Google unique id in your user object
        };
      },
    }),
    // Credentials Provider for Email/Password Login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your-email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const supabase = createClient();

        // Fetch user from Supabase
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (error || !user) {
          throw new Error('Invalid email or password');
        }

        if (user.auth_type !== 'local' || !user.password_hash) {
          throw new Error('Invalid authentication method');
        }

        // Compare password
        const isValid = await compare(credentials.password, user.password_hash);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          auth_type: user.auth_type,
          timezone: user.timezone,
        };
      },
    }),
  ],
  pages: {
    signIn: '/web/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        // Store the actual user ID from Supabase
        token.id = user.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : null;
        // Store googleId separately if needed
        if (account.provider === 'google') {
          token.googleId = (user as any).google_id;
        }
      }
      // If access token has not expired, return it
      if (typeof token.accessTokenExpires === 'number' && token.accessTokenExpires > Date.now()) {
        return token;
      }
      // Otherwise, refresh the access token
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      if (token) {
        // Ensure we're setting the Supabase user ID here
        extendedSession.user.id = token.id as string;
        extendedSession.user.accessToken = token.accessToken as string;
        extendedSession.user.refreshToken = token.refreshToken as string;
        // Keep googleId as additional information if needed
        extendedSession.user.googleId = token.googleId as string;
      }
      return extendedSession;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const supabase = createClient();
        
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, auth_type, google_id')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            // Add the Supabase user ID to the user object
            user.id = existingUser.id;
            
            // Update existing user's Google ID if not set
            if (!existingUser.google_id) {
              await supabase
                .from('users')
                .update({
                  google_id: profile?.sub,
                  auth_type: existingUser.auth_type === 'local' ? 'hybrid' : 'google',
                  avatar_url: user.image,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingUser.id);
            }

            // Update or create OAuth connection
            const { data: oauthData, error: oauthError } = await supabase
              .from('oauth_connections')
              .upsert({
                user_id: existingUser.id,
                provider: 'google',
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at 
                  ? new Date(account.expires_at * 1000).toISOString()
                  : null,
                email: user.email,
                profile_data: profile,
              }, {
                onConflict: 'id'
              });

            if (oauthError) throw oauthError;
            if (oauthData) {
              // Update the session with the new OAuth connection data
              user.id = existingUser.id;
            }

            return true;
          }

          // Create new user
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              email: user.email,
              username: profile?.name,
              auth_type: 'google',
              google_id: profile?.sub,
              avatar_url: user.image,
              email_verified: true,
              timezone: 'Asia/Tokyo', // You might want to get this from the client
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (userError) throw userError;

          // Add the new Supabase user ID to the user object
          user.id = newUser.id;

          // Create OAuth connection
          await supabase
            .from('oauth_connections')
            .insert({
              user_id: newUser.id,
              provider: 'google',
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at 
                ? new Date(account.expires_at * 1000).toISOString()
                : null,
              email: user.email,
              profile_data: profile,
              calendar_sync_enabled: true,
              last_synced_at: null,
            });

          return true;
        } catch (error) {
          console.error('Error handling Google sign in:', error);
          return false;
        }
      }

      return true; // Allow other sign-in methods to proceed
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};