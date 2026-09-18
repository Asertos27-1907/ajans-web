import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

function isNewSupabaseApiKey(key: string): boolean {
  return key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
}

/**
 * Server-only Supabase client using the secret key.
 * Never import this into Client Components.
 *
 * New `sb_secret_…` keys are not JWTs. They must go in `apikey` only;
 * sending them as `Authorization: Bearer` can break PostgREST/Storage.
 */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const secretKey = (process.env.SUPABASE_SECRET_KEY ?? "").trim();

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY",
    );
  }

  const useApikeyOnly = isNewSupabaseApiKey(secretKey);

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: useApikeyOnly
      ? {
          fetch: async (input, init) => {
            const headers = new Headers(init?.headers);
            headers.set("apikey", secretKey);
            const authorization = headers.get("Authorization");
            if (
              authorization === `Bearer ${secretKey}` ||
              authorization === secretKey
            ) {
              headers.delete("Authorization");
            }
            return fetch(input, { ...init, headers });
          },
        }
      : undefined,
  });
}
