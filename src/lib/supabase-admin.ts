import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim();

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.\n' +
    'The server-side client is falling back to the public anon key. If Row Level Security (RLS) is active,\n' +
    'admin read/write operations will fail. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.'
  );
}

/**
 * Supabase client for server-only operations.
 * Uses service_role key to bypass RLS policies when performing authorized admin actions.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
