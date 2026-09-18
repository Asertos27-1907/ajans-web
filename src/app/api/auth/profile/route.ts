import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDashboardRole } from "@/lib/auth/types";

export const runtime = "nodejs";

function serializeProfileError(error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
} | null) {
  if (!error) return null;
  return {
    message: error.message,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  };
}

/**
 * Post-login profile gate.
 * Uses cookie session (getUser) then reads profiles via secret client
 * so a missing/recursive authenticated RLS path cannot block own-profile reads
 * once service_role has table privileges.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Oturum bulunamadı.", code: "no_session" },
        { status: 401 },
      );
    }

    let profile: {
      id: string;
      role: string;
      active: boolean;
    } | null = null;
    let profileError: {
      message: string;
      code?: string;
      details?: string;
      hint?: string;
    } | null = null;

    // 1) Prefer user-scoped read (correct when GRANTs + RLS are healthy).
    {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, active")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        profileError = error;
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth/profile] user-scoped", serializeProfileError(error));
        }
      } else {
        profile = data;
      }
    }

    // 2) Fallback: verified user id + secret client (bypasses RLS).
    if (!profile) {
      try {
        const admin = createAdminClient();
        const { data, error } = await admin
          .from("profiles")
          .select("id, role, active")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          profileError = error;
          if (process.env.NODE_ENV === "development") {
            console.warn("[auth/profile] admin", serializeProfileError(error));
          }
        } else {
          profile = data;
          profileError = null;
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth/profile] admin-init", {
            message: err instanceof Error ? err.message : "unknown",
          });
        }
      }
    }

    if (profileError && !profile) {
      return NextResponse.json(
        {
          error: "Kullanıcı profili okunamadı.",
          code: "profile_query_failed",
          details: serializeProfileError(profileError),
        },
        { status: 403 },
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Kullanıcı profili bulunamadı.", code: "profile_missing" },
        { status: 404 },
      );
    }

    if (!profile.active) {
      return NextResponse.json(
        { error: "Hesabınız pasif durumda.", code: "inactive" },
        { status: 403 },
      );
    }

    if (!isDashboardRole(profile.role)) {
      return NextResponse.json(
        { error: "Yönetim paneli erişimi yok.", code: "forbidden_role" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      userId: user.id,
      profile: {
        id: profile.id,
        role: profile.role,
        active: profile.active,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[auth/profile]", {
        message: err instanceof Error ? err.message : "unknown",
      });
    }
    return NextResponse.json(
      { error: "Profil doğrulanamadı.", code: "unexpected" },
      { status: 500 },
    );
  }
}
