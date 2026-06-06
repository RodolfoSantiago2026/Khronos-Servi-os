import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

const supabaseUrl = (env.supabase.url || 'https://placeholder.supabase.co').trim();
const supabaseAnonKey = (env.supabase.anonKey || 'placeholder').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
