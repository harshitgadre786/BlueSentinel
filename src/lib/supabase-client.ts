import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client-safe Supabase resolver. Only public anonymous keys are used in browser contexts.
// Sensitive keys such as SUPABASE_SERVICE_ROLE_KEY are strictly forbidden in client bundles.
const getSupabaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT ||
    (typeof process !== "undefined" && process.env ? process.env.SUPABASE_URL : "") ||
    ""
  );
};

const getSupabaseAnonKey = (): string => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    (typeof process !== "undefined" && process.env ? process.env.SUPABASE_ANON_KEY : "") ||
    ""
  );
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-ref") &&
    !supabaseAnonKey.includes("your-supabase-anon-public-key")
);

// Initialize Supabase client only when configured with valid environment variables
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
