"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/public/BrandLogo";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@artiakademi.local");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("E-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1ec] px-4">
      <div className="w-full max-w-md rounded border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-6 inline-block rounded bg-white p-2">
          <BrandLogo />
        </div>
        <h1 className="font-display text-2xl font-semibold">Yönetim girişi</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Mock login — gerçek Supabase Auth sonra bağlanacak.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <FormField label="E-posta" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Şifre" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </Button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-ink-muted hover:text-ink">
          ← Siteye dön
        </Link>
      </div>
    </div>
  );
}
