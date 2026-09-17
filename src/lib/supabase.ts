import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your project's URL and anon key."
  );
}

// Single shared client. Fine for Phase 1 (no auth yet, no per-request
// session handling needed). Revisit when auth lands in the Future Phase.
//
// Not using a generic Database type here yet — hand-writing one that
// matches supabase-js's expected shape is error-prone (see Phase 1 build
// fix). When the schema grows in Phase 2+, generate it properly with
// `supabase gen types typescript` instead.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

