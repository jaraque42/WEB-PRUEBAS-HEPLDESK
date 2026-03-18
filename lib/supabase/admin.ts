import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

