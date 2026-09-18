"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BrandLogo } from "@/components/public/BrandLogo";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { getPublicSupabaseConfigError } from "@/lib/supabase/env";

/** Prevents a second PKCE exchange of the same auth code (Strict Mode / remount). */
const exchangedAuthCodes = new Set<string>();

function logRecoveryDebug(
  scope: string,
  error: { message?: string; status?: number; code?: string; name?: string } | null,
) {
  if (process.env.NODE_ENV !== "development" || !error) return;
  console.warn(`[auth/recovery/${scope}]`, {
    message: error.message ?? null,
    status: error.status ?? null,
    code: error.code ?? null,
    name: error.name ?? null,
  });
}

function clearRecoveryParamsFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  [
    "code",
    "sb_flow_id",
    "token_hash",
    "type",
    "error",
    "error_description",
    "error_code",
  ].forEach((key) => url.searchParams.delete(key));
  url.hash = "";
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function readHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(raw);
}

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function establishRecoverySession() {
      const configError = getPublicSupabaseConfigError();
      if (configError) {
        if (!cancelled) {
          setLinkError(configError);
          setChecking(false);
        }
        return;
      }

      let supabase;
      try {
        supabase = createClient();
      } catch (err) {
        if (!cancelled) {
          setLinkError(
            err instanceof Error
              ? err.message
              : "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
          );
          setChecking(false);
        }
        return;
      }

      const authError =
        searchParams.get("error_description") || searchParams.get("error");
      if (authError) {
        logRecoveryDebug("url", { message: authError });
        if (!cancelled) {
          setLinkError(
            "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
          );
          setChecking(false);
        }
        return;
      }

      try {
        // createBrowserClient uses PKCE + detectSessionInUrl: awaiting getSession
        // lets the client finish auto-exchange before we do anything else.
        await supabase.auth.getSession();

        const initialUser = await supabase.auth.getUser();
        let user = initialUser.data.user;
        if (initialUser.error) {
          logRecoveryDebug("getUser-after-init", initialUser.error);
        }

        // Manual PKCE exchange only if auto-detect did not establish a session.
        const code =
          searchParams.get("code") ||
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("code")
            : null);
        const flowId =
          searchParams.get("sb_flow_id") ||
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("sb_flow_id")
            : null);

        if (!user && code && !exchangedAuthCodes.has(code)) {
          exchangedAuthCodes.add(code);
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(
              code,
              flowId ? { flowId } : undefined,
            );

          if (exchangeError) {
            logRecoveryDebug("exchange", exchangeError);
            // Race: detectSessionInUrl may have already exchanged successfully.
            const retry = await supabase.auth.getUser();
            user = retry.data.user;
            if (!user) {
              if (!cancelled) {
                setLinkError(
                  "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
                );
                setChecking(false);
              }
              return;
            }
          } else {
            const afterExchange = await supabase.auth.getUser();
            user = afterExchange.data.user;
            if (afterExchange.error) {
              logRecoveryDebug("getUser-after-exchange", afterExchange.error);
            }
          }

          clearRecoveryParamsFromUrl();
        }

        // token_hash recovery (email template confirm links)
        const tokenHash =
          searchParams.get("token_hash") ||
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("token_hash")
            : null);
        const otpType =
          searchParams.get("type") ||
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("type")
            : null);

        if (!user && tokenHash && otpType === "recovery") {
          const { error: otpError } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: tokenHash,
          });
          if (otpError) {
            logRecoveryDebug("verifyOtp", otpError);
          } else {
            const afterOtp = await supabase.auth.getUser();
            user = afterOtp.data.user;
            clearRecoveryParamsFromUrl();
          }
        }

        // Legacy implicit/hash recovery: #access_token&refresh_token&type=recovery
        if (!user && typeof window !== "undefined") {
          const hashParams = readHashParams();
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          const hashType = hashParams.get("type");

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) {
              logRecoveryDebug("setSession-hash", sessionError);
            } else {
              if (
                hashType &&
                hashType !== "recovery" &&
                process.env.NODE_ENV === "development"
              ) {
                console.warn("[auth/recovery/hash]", { type: hashType });
              }
              const afterHash = await supabase.auth.getUser();
              user = afterHash.data.user;
              clearRecoveryParamsFromUrl();
            }
          }
        }

        if (cancelled) return;

        if (!user) {
          setLinkError(
            "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
          );
          setChecking(false);
          return;
        }

        // Strip sensitive query/hash once session is confirmed.
        if (
          code ||
          tokenHash ||
          (typeof window !== "undefined" &&
            window.location.hash.includes("access_token"))
        ) {
          clearRecoveryParamsFromUrl();
        }

        setChecking(false);
      } catch (err) {
        logRecoveryDebug("unexpected", {
          message: err instanceof Error ? err.message : "unknown",
        });
        if (!cancelled) {
          setLinkError(
            "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
          );
          setChecking(false);
        }
      }
    }

    void establishRecoverySession();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Şifre alanları boş bırakılamaz.");
      return;
    }
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: sessionUserError,
      } = await supabase.auth.getUser();

      if (sessionUserError || !user) {
        logRecoveryDebug("submit-session", sessionUserError);
        setLinkError(
          "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        logRecoveryDebug("updateUser", updateError);
        const lower = updateError.message.toLowerCase();
        if (lower.includes("same password") || lower.includes("different")) {
          setError("Yeni şifre eskisiyle aynı olamaz.");
        } else if (
          lower.includes("session") ||
          lower.includes("jwt") ||
          lower.includes("expired") ||
          lower.includes("not authenticated")
        ) {
          setLinkError(
            "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.",
          );
        } else {
          setError("Şifre güncellenemedi. Lütfen tekrar deneyin.");
        }
        return;
      }

      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => {
        router.replace("/dashboard/login");
        router.refresh();
      }, 1800);
    } catch (err) {
      logRecoveryDebug("submit", {
        message: err instanceof Error ? err.message : "unknown",
      });
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
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
        <h1 className="font-display text-2xl font-semibold">Yeni şifre belirle</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Hesabınız için yeni bir şifre oluşturun.
        </p>

        {checking ? (
          <p className="mt-6 text-sm text-ink-muted">Bağlantı doğrulanıyor...</p>
        ) : linkError ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-danger">{linkError}</p>
            <Link
              href="/dashboard/login"
              className="inline-block text-sm text-ink-muted hover:text-ink"
            >
              ← Giriş sayfasına dön
            </Link>
          </div>
        ) : success ? (
          <p className="mt-6 text-sm text-ink">
            Şifreniz başarıyla güncellendi.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <FormField label="Yeni şifre" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Yeni şifre tekrar" required>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>
            {error ? <p className="text-xs text-danger">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-muted px-4">
          <p className="text-sm text-ink-muted">Yükleniyor...</p>
        </div>
      }
    >
      <UpdatePasswordForm />
    </Suspense>
  );
}
