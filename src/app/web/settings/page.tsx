import { createClient } from '@/lib/supabase/server';
import { GoogleLinkButton } from '@/components/account/GoogleLinkButton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { FcGoogle } from 'react-icons/fc';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const supabase = createClient();

  // Fetch user's OAuth connections
  const { data: oauthConnections } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', session?.user?.id)
    .eq('provider', 'google')
    .single();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        
        {oauthConnections ? (
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <FcGoogle className="w-6 h-6" />
              <div>
                <p className="font-medium">Google Account</p>
                <p className="text-sm text-gray-400">{oauthConnections.email}</p>
              </div>
            </div>
            
            {oauthConnections.calendar_sync_enabled && (
              <p className="text-sm text-green-500 mt-2">
                Calendar sync is enabled
              </p>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-gray-400 mb-4">
              Link your Google account to enable calendar sync
            </p>
            <GoogleLinkButton />
          </div>
        )}
      </div>
    </div>
  );
} 