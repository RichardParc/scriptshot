import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your project's URL and anon key."
  );
}

// Single shared client. Fine for Phase 1 (no auth yet, no per-request
// session handling needed). Revisit when auth lands in the Future Phase.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
