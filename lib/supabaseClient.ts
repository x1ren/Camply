import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client with session persistence enabled
// This ensures the session is stored in localStorage and persists across browser sessions
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true, // Persist session in localStorage
      autoRefreshToken: true, // Automatically refresh expired tokens
      detectSessionInUrl: true, // Detect session from URL (for OAuth callbacks)
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // Let Supabase use its default storage key format
      // It will be: sb-<project-ref>-auth-token
    },
  }
);
