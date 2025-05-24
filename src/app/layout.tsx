import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../styles/globals.css";
import { NextAuthProvider } from "@/providers/nextAuthProvider";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/providers/reactQueryProvider";
import { GoogleConnectionProvider } from '@/contexts/googleConnectContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skillize - Personalized AI Scheduler",
  description: "Skillize is a personalized AI scheduler that helps you schedule your time effectively.",
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.ico' },
      { rel: 'icon', url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
      { rel: 'manifest', url: '/site.webmanifest' }
    ]
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Skillize'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.className} antialiased`}
      >
        <ReactQueryProvider>
          <NextAuthProvider>
            <GoogleConnectionProvider>
              <Toaster richColors />
              {children}
            </GoogleConnectionProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
