"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ClipboardList,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { trackApplicationConversion } from "@/lib/analytics/google-ads";
import { trackApplicationLead } from "@/lib/analytics/meta-pixel";
import type { SiteSettings } from "@/types";

export function ApplicationForm({
  settings,
}: {
  settings?: Pick<SiteSettings, "phone" | "email" | "whatsapp">;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const submittingRef = useRef(false);
  const conversionTrackedRef = useRef(false);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setPhone("");
    setCity("");
    setKvkk(false);
    setWebsite("");
    setErrors({});
    setFormError("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (firstName.trim().length < 2) e.firstName = "Ad en az 2 karakter olmalı";
    if (lastName.trim().length < 2) e.lastName = "Soyad en az 2 karakter olmalı";
    if (!phone.trim()) e.phone = "Telefon gerekli";
    if (city.trim().length < 2) e.city = "Şehir gerekli";
    if (!kvkk) e.kvkk = "KVKK onayı gerekli";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("first_name", firstName.trim());
      formData.set("last_name", lastName.trim());
      formData.set("phone", phone.trim());
      formData.set("city", city.trim());
      formData.set("kvkk", kvkk ? "true" : "false");
      formData.set("website", website);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setFormError(data.error || "Başvuru gönderilemedi.");
        return;
      }

      if (!conversionTrackedRef.current) {
        conversionTrackedRef.current = true;
        trackApplicationConversion();
        trackApplicationLead();
      }

      resetForm();
      setSuccessMessage(
        data.message ||
          "Başvurunuz başarıyla alındı. Uygun adaylarla iletişime geçilecektir.",
      );
      setDone(true);
    } catch {
      setFormError("Başvuru gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      if (!conversionTrackedRef.current) {
        submittingRef.current = false;
      }
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-border bg-surface p-8 text-center md:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Check size={28} />
        </div>
        <h2 className="font-display mt-5 text-2xl font-semibold">
          Başvurunuz alındı
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          {successMessage ||
            "Başvurunuz başarıyla alındı. Uygun adaylarla iletişime geçilecektir."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Ana sayfa</Button>
          </Link>
          <Link href="/hizmetler">
            <Button>Hizmetlerimizi Keşfedin</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="relative border border-border bg-surface p-5 shadow-[var(--shadow-soft)] md:p-8"
      >
        {/* Honeypot — gizle, botlar doldurursa reddedilir */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        >
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ad" required error={errors.firstName}>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </FormField>
          <FormField label="Soyad" required error={errors.lastName}>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </FormField>
          <FormField label="Telefon" required error={errors.phone}>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Şehir" required error={errors.city}>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </FormField>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 cursor-pointer"
            checked={kvkk}
            onChange={(e) => setKvkk(e.target.checked)}
            disabled={submitting}
          />
          <span>
            <Link
              href="/kvkk"
              className="underline underline-offset-2 hover:text-primary"
              target="_blank"
            >
              KVKK
            </Link>{" "}
            metnini okudum ve kişisel verilerimin başvuru değerlendirmesi için
            işlenmesini onaylıyorum.
          </span>
        </label>
        {errors.kvkk ? (
          <p className="mt-1 text-xs text-danger">{errors.kvkk}</p>
        ) : null}

        {formError ? (
          <p className="mt-4 text-sm text-danger">{formError}</p>
        ) : null}

        <div className="mt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting}
          >
            {submitting ? "Gönderiliyor..." : "BAŞVURU YAP"}
          </Button>
        </div>
      </form>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<AlertCircle size={18} />} title="Dikkat etmeniz gerekenler" tone="petrol">
          Formu doldururken herhangi bir problem yaşıyorsanız, lütfen iletişim
          bilgilerimiz üzerinden bizimle iletişime geçin.
          {settings?.phone || settings?.email ? (
            <span className="mt-2 block text-ink">
              {settings.phone ? <span className="block">{settings.phone}</span> : null}
              {settings.email ? <span className="block">{settings.email}</span> : null}
            </span>
          ) : null}
        </InfoCard>
        <InfoCard icon={<Heart size={18} />} title="Teşekkür" tone="burgundy">
          +Akademi’yi tercih ettiğiniz ve başvuru formumuzu doldurarak bize
          güvendiğiniz için teşekkür ederiz. Kişisel bilgilerinizin gizliliğini
          ve güvenliğini korumaya büyük özen gösteriyoruz.
        </InfoCard>
        <InfoCard icon={<ClipboardList size={18} />} title="Süreç" tone="petrol">
          Başvurusu olumlu değerlendirilen adaylarla iletişime geçilir. Gerekli
          durumlarda adaylar ofisimize davet edilir; profesyonel fotoğraf ve
          tanıtım çalışmaları tamamlandıktan sonra oyuncu havuzumuza dahil
          edilir. Uygun proje ve roller oluştuğunda adaylarla tekrar iletişime
          geçilir.
        </InfoCard>
        <InfoCard icon={<ShieldCheck size={18} />} title="KVKK" tone="burgundy">
          Başvuruyu göndererek verdiğiniz bilgilerin doğruluğunu beyan etmiş ve
          KVKK / aydınlatma metninde belirtilen koşulları kabul etmiş olursunuz.
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone: "burgundy" | "petrol";
}) {
  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center text-white",
            tone === "burgundy" ? "bg-primary" : "bg-secondary",
          )}
        >
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </article>
  );
}
