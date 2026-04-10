import { createClient } from '@supabase/supabase-js'

// Anon key is safe to expose — RLS policies enforce what this client can do
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// ⚠️ supabaseAdmin (service role) has been intentionally removed from the browser.
// If server-side admin operations are ever needed, use a Supabase Edge Function.
