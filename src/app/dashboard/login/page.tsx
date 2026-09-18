"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/public/BrandLogo";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { getPublicSupabaseConfigError } from "@/lib/supabase/env";

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid api key") ||
    lower.includes("invalid jwt") ||
    lower.includes("api key")
  ) {
    return "Supabase API anahtarı geçersiz. .env.local içindeki NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY değerini kontrol edip sunucuyu yeniden başlatın.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("fetch failed")
  ) {
    return "Supabase sunucusuna bağlanılamadı. İnternet bağlantınızı ve NEXT_PUBLIC_SUPABASE_URL değerini kontrol edin.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "E-posta veya şifre hatalı.";
  }
  if (lower.includes("email not confirmed")) {
    return "E-posta adresiniz henüz doğrulanmamış.";
  }
  if (lower.includes("too many requests")) {
    return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
  }
  return "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.";
}

type AuthDebugInfo = {
  message: string;
  status: number | null;
  code: string | null;
  name: string | null;
};

function serializeAuthError(error: unknown): AuthDebugInfo {
  if (!error || typeof error !== "object") {
    return {
      message: error == null ? "" : String(error),
      status: null,
      code: null,
      name: null,
    };
  }

  const err = error as {
    message?: unknown;
    status?: unknown;
    code?: unknown;
    name?: unknown;
    toJSON?: () => Record<string, unknown>;
  };

  const json =
    typeof err.toJSON === "function" ? err.toJSON() : ({} as Record<string, unknown>);

  const message =
    (typeof err.message === "string" && err.message) ||
    (typeof json.message === "string" && json.message) ||
    (error instanceof Error ? error.message : "") ||
    String(error);

  const statusRaw = err.status ?? json.status;
  const codeRaw = err.code ?? json.code;
  const nameRaw = err.name ?? json.name;

  return {
    message,
    status: typeof statusRaw === "number" ? statusRaw : null,
    code: typeof codeRaw === "string" ? codeRaw : null,
    name: typeof nameRaw === "string" ? nameRaw : null,
  };
}

function logAuthDebug(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  // console.warn: Next.js red error overlay is triggered by console.error
  console.warn(`[auth/${scope}]`, serializeAuthError(error));
}

function mapResetError(error: unknown): string {
  const info = serializeAuthError(error);
  const lower = info.message.toLowerCase();

  if (
    lower.includes("invalid api key") ||
    lower.includes("invalid jwt") ||
    (lower.includes("api key") && info.status === 401)
  ) {
    return "Supabase API anahtarı geçersiz. .env.local içindeki NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY değerini kontrol edip sunucuyu yeniden başlatın.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    info.status === 0
  ) {
    return "Supabase sunucusuna bağlanılamadı. İnternet bağlantınızı ve NEXT_PUBLIC_SUPABASE_URL değerini kontrol edin.";
  }
  if (lower.includes("rate") || lower.includes("too many") || info.status === 429) {
    return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
  }
  if (
    lower.includes("smtp") ||
    lower.includes("error sending") ||
    (lower.includes("email") && lower.includes("send")) ||
    (typeof info.status === "number" && info.status >= 500)
  ) {
    return "Şifre sıfırlama e-postası gönderilemedi. E-posta/SMTP ayarlarını kontrol edin.";
  }
  if (lower.includes("redirect") || lower.includes("not allowed")) {
    return "Şifre sıfırlama yönlendirme adresi geçersiz. Supabase Redirect URLs ayarını kontrol edin.";
  }

  return "Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.";
}

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onForgotPassword() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Şifre sıfırlama için e-posta adresinizi girin.");
      return;
    }

    const configError = getPublicSupabaseConfigError();
    if (configError) {
      setError(configError);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/update-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );

      if (resetError) {
        logAuthDebug("reset", resetError);
        setError(mapResetError(resetError));
        return;
      }

      setInfo(
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Supabase yapılandırması")) {
        setError(message);
      } else {
        logAuthDebug("reset", err);
        setError(mapResetError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || !password.trim()) {
      setError("E-posta ve şifre gerekli");
      return;
    }

    const configError = getPublicSupabaseConfigError();
    if (configError) {
      setError(configError);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        logAuthDebug("login", signInError);
        setError(mapAuthError(signInError.message));
        return;
      }

      const user = data.user ?? data.session?.user;
      if (!user || !data.session?.access_token) {
        setError("Oturum oluşturulamadı. Lütfen tekrar deneyin.");
        await supabase.auth.signOut();
        return;
      }

      // Ensure browser auth storage/cookies are readable before profile gate.
      const {
        data: { user: confirmedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !confirmedUser) {
        logAuthDebug("login-getUser", userError);
        await supabase.auth.signOut();
        setError("Oturum doğrulanamadı. Lütfen tekrar deneyin.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        await supabase.auth.signOut();
        setError("Oturum çerezi oluşmadı. Lütfen tekrar deneyin.");
        return;
      }

      // Server gate: cookie session + profile (user-scoped, then secret fallback).
      let profileGate: {
        ok: boolean;
        status: number;
        code?: string;
        message?: string;
        details?: {
          message?: string;
          code?: string | null;
          details?: string | null;
          hint?: string | null;
        } | null;
      } = { ok: false, status: 0 };

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
          details?: {
            message?: string;
            code?: string | null;
            details?: string | null;
            hint?: string | null;
          };
          profile?: { id: string; role: string; active: boolean };
        };

        if (res.ok && payload.profile) {
          profileGate = { ok: true, status: res.status };
          break;
        }

        profileGate = {
          ok: false,
          status: res.status,
          code: payload.code,
          message: payload.error,
          details: payload.details ?? null,
        };

        // Cookie may lag one tick after signIn; retry once.
        if (res.status === 401 && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          continue;
        }
        break;
      }

      if (!profileGate.ok) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth/login-profile]", {
            status: profileGate.status,
            code: profileGate.code ?? null,
            message: profileGate.message ?? null,
            details: profileGate.details ?? null,
          });
        }

        await supabase.auth.signOut();

        if (profileGate.code === "inactive") {
          setError("Hesabınız pasif durumda. Giriş yapamazsınız.");
          return;
        }
        if (profileGate.code === "forbidden_role") {
          setError("Bu hesaba yönetim paneli erişimi tanımlı değil.");
          return;
        }
        if (profileGate.code === "profile_missing") {
          setError("Kullanıcı profili bulunamadı. Yöneticinizle iletişime geçin.");
          return;
        }
        if (profileGate.code === "no_session" || profileGate.status === 401) {
          setError("Oturum sunucuya taşınamadı. Lütfen tekrar deneyin.");
          return;
        }

        const hint = (profileGate.details?.hint || "").toLowerCase();
        const msg = (profileGate.details?.message || profileGate.message || "").toLowerCase();
        if (
          profileGate.details?.code === "42501" ||
          msg.includes("permission denied") ||
          hint.includes("grant select")
        ) {
          setError(
            "Profil tablosu erişim izni eksik. Supabase SQL Editor'da src/lib/auth/fix-profiles-access.sql dosyasını çalıştırın.",
          );
          return;
        }

        setError("Kullanıcı profili okunamadı. Yöneticinizle iletişime geçin.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Supabase yapılandırması")) {
        setError(message);
      } else {
        logAuthDebug("login", err);
        setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-muted px-4">
      <div className="w-full max-w-md rounded border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-6 inline-block rounded bg-white p-2">
          <BrandLogo />
        </div>
        <h1 className="font-display text-2xl font-semibold">Yönetim girişi</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Yönetim paneline erişmek için e-posta ve şifrenizi girin.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <FormField label="E-posta" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FormField>
          <FormField label="Şifre" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          {info ? <p className="text-xs text-ink-muted">{info}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </Button>
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={loading}
            className="w-full cursor-pointer text-center text-sm text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Şifremi unuttum
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-ink-muted hover:text-ink">
          ← Siteye dön
        </Link>
      </div>
    </div>
  );
}
