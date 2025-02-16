import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await req.json();
    const supabase = createClient();

    const { error } = await supabase
      .from('oauth_connections')
      .update({
        calendar_sync_enabled: enabled,
        last_synced_at: enabled ? new Date().toISOString() : null,
      })
      .eq('user_id', session.user.id)
      .eq('provider', 'google');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating calendar sync:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar sync settings' },
      { status: 500 }
    );
  }
} 