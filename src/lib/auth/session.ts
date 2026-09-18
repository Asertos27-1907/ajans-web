import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canManageAdmins,
  isDashboardRole,
  type Profile,
  type ProfileRole,
} from "@/lib/auth/types";

export type { Profile, ProfileRole };
export { canManageAdmins, isDashboardRole };

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, active")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data && isDashboardRole(data.role)) {
    return {
      id: data.id,
      email: null,
      full_name: null,
      role: data.role,
      active: Boolean(data.active),
    };
  }

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[auth/session] profile user-scoped", {
      message: error.message,
      code: error.code ?? null,
      details: error.details ?? null,
      hint: error.hint ?? null,
    });
  }

  // Fallback after verified getUser(): secret client bypasses recursive/broken RLS
  // once service_role has table privileges (see fix-profiles-access.sql).
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: adminData, error: adminError } = await admin
      .from("profiles")
      .select("id, role, active")
      .eq("id", userId)
      .maybeSingle();

    if (adminError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth/session] profile admin", {
          message: adminError.message,
          code: adminError.code ?? null,
          details: adminError.details ?? null,
          hint: adminError.hint ?? null,
        });
      }
      return null;
    }

    if (!adminData || !isDashboardRole(adminData.role)) {
      return null;
    }

    return {
      id: adminData.id,
      email: null,
      full_name: null,
      role: adminData.role,
      active: Boolean(adminData.active),
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[auth/session] profile admin-init", {
        message: err instanceof Error ? err.message : "unknown",
      });
    }
    return null;
  }
}

/**
 * Resolves the authenticated dashboard user + profile.
 * Returns null when there is no valid session or profile.
 */
export async function getAuthProfile(): Promise<{
  userId: string;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await fetchProfile(user.id);
  if (!profile) {
    return null;
  }

  return { userId: user.id, profile };
}

/**
 * Protects /dashboard panel routes.
 * Unauthenticated / invalid role → login.
 * Inactive profile → signOut then login.
 */
export async function requireDashboardUser(): Promise<{
  userId: string;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/dashboard/login");
  }

  const profile = await fetchProfile(user.id);

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/dashboard/login");
  }

  if (!profile.active) {
    await supabase.auth.signOut();
    redirect("/dashboard/login");
  }

  return { userId: user.id, profile };
}

/** Owner-only routes (e.g. /dashboard/adminler). */
export async function requireOwner(): Promise<{
  userId: string;
  profile: Profile;
}> {
  const auth = await requireDashboardUser();

  if (!canManageAdmins(auth.profile.role)) {
    redirect("/dashboard");
  }

  return auth;
}
