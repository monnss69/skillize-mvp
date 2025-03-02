'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={15 * 60} refetchOnWindowFocus={true}>
      <SessionMonitor>{children}</SessionMonitor>
    </SessionProvider>
  )
}

// SessionMonitor handles session-related issues and monitors for unexpected session losses
function SessionMonitor({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  // Log session changes to help debug "no active session" issues
  useEffect(() => {
    if (status === 'loading') {
      console.log('Session loading...')
    } else if (status === 'authenticated') {
      console.log('Session authenticated', { hasUserId: !!session?.user?.id })
    } else if (status === 'unauthenticated') {
      console.log('Session unauthenticated')
    }
  }, [status, session])

  return <>{children}</>
}