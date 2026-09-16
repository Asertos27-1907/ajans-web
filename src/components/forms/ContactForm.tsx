"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { contactRepository } from "@/lib/repositories";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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

  if (sent) {
    return (
      <div className="border border-border bg-surface p-6 md:p-8">
        <h2 className="text-xl font-semibold">Mesajınız alındı</h2>
        <p className="mt-2 text-sm text-ink-muted">
          En kısa sürede dönüş yapılacaktır.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-6 md:p-8"
    >
      <h2 className="text-lg font-semibold">Mesaj gönder</h2>
      <FormField label="Ad Soyad" required error={errors.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="E-posta" required error={errors.email}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Telefon">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>
      <FormField label="Konu" required error={errors.subject}>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </FormField>
      <FormField label="Mesaj" required error={errors.message}>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </FormField>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
