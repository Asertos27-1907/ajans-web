"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { contactRepository, settingsRepository } from "@/lib/repositories";
import { hasValue } from "@/lib/utils";
import type { SiteSettings } from "@/types";
import { useEffect } from "react";

export default function ContactFormSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    settingsRepository.get().then(setSettings);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eMap: Record<string, string> = {};
    if (!name.trim()) eMap.name = "Ad gerekli";
    if (!email.trim()) eMap.email = "E-posta gerekli";
    if (!subject.trim()) eMap.subject = "Konu gerekli";
    if (!message.trim()) eMap.message = "Mesaj gerekli";
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    setLoading(true);
    try {
      await contactRepository.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide grid gap-10 lg:grid-cols-2">
      <div>
        <p className="eyebrow">İletişim</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Bize ulaşın
        </h1>
        <p className="mt-4 text-ink-muted">
          Casting talepleri, iş ortaklığı ve genel sorularınız için formu
          kullanabilirsiniz.
        </p>
        {settings ? (
          <address className="mt-8 space-y-1 text-base not-italic text-ink-muted">
            {settings.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </address>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {settings && hasValue(settings.instagram) ? (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Instagram
            </a>
          ) : null}
          {settings && hasValue(settings.facebook) ? (
            <a
              href={settings.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Facebook
            </a>
          ) : null}
          {settings && hasValue(settings.phone) ? (
            <a href={`tel:${settings.phone}`}>{settings.phone}</a>
          ) : null}
          {settings && hasValue(settings.email) ? (
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          ) : null}
        </div>
      </div>

      <div className="border border-border bg-surface p-6 shadow-[var(--shadow-soft)] md:p-8">
        {sent ? (
          <div>
            <h2 className="text-xl font-semibold">Mesajınız alındı</h2>
            <p className="mt-2 text-sm text-ink-muted">
              En kısa sürede dönüş yapılacaktır.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Ad Soyad" required error={errors.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label="E-posta" required error={errors.email}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Telefon">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label="Konu" required error={errors.subject}>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </FormField>
            <FormField label="Mesaj" required error={errors.message}>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </FormField>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
