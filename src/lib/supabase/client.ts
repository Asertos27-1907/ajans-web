import { createBrowserClient } from "@supabase/ssr";
import {
  getPublicSupabaseConfigError,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

export function createClient() {
  const configError = getPublicSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
