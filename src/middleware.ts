import { withAuth } from "next-auth/middleware";

export default withAuth({
  // You can add custom options here if needed
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|login|signup).*)',
  ],
};