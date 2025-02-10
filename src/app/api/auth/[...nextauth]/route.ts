import NextAuth, { NextAuthOptions, Session, Profile, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { ExtendedSession, ExtendedProfile } from '@/types';

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code",
          scope: "https://www.googleapis.com/auth/calendar openid profile email"
        }
      }
    }),
  ],
  pages: {
    signIn: '/web/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in
      if (account) {
        token.id = token.id ?? account.providerAccountId;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : null;
      }
      // Return previous token if the access token has not expired yet
      if (typeof token.accessTokenExpires === 'number' && token.accessTokenExpires > Date.now()) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      if (token) {
        extendedSession.user.id = token.id as string;
        extendedSession.user.accessToken = token.accessToken as string;
        extendedSession.user.refreshToken = token.refreshToken as string;
      }
      return extendedSession;
    },
    async signIn({ user, account, profile }) {
      return true; // Allow sign-in for all users
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/web/calendar`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Function to refresh access token
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
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };