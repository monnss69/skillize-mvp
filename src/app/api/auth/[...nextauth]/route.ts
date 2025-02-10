import NextAuth, { NextAuthOptions, Session, Profile, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

interface ExtendedProfile extends Profile {
  email_verified?: boolean;
  email?: string;
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/web/login',
  },
  callbacks: {
    session({ session, token, user }: { session: Session; token: JWT; user: any }) {
      // Add custom properties to the session object
      const extendedSession = session as ExtendedSession;
      if (token) {
        extendedSession.user.id = token.id as string;
      }
      return session;
    },
    signIn({ user, account, profile }: { 
      user: any;
      account: Account | null;
      profile?: ExtendedProfile;
    }) {
      return true; // Allow sign-in for other providers
    },
    redirect({ url, baseUrl }) {
      // Handle redirects after sign-in
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Redirect to calendar page after successful sign in
      return `${baseUrl}/web/calendar`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };