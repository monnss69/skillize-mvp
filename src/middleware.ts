import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth({
  // You can add custom options here if needed
  pages: {
    signIn: '/web/login',
  },
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|web/login|web/signup).*)',
  ],
};