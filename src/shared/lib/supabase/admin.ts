import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/shared/lib/supabase/env";

/** Admin client — só no servidor. Precisa de SUPABASE_SERVICE_ROLE_KEY. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }
  return createClient(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
