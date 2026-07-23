import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type TypedClient = SupabaseClient<Database>;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

/** Anon client — RLS applies. Safe anywhere on the server. */
export function createPublicClient(): TypedClient {
  return createClient<Database>(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false } },
  );
}

/**
 * Service-role client — BYPASSES RLS. Server only, admin code paths only
 * (kitchen dashboard, order confirmation lookup). Never import from a
 * client component.
 */
export function createAdminClient(): TypedClient {
  return createClient<Database>(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false } },
  );
}
