"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { calcAge, cn } from "@/lib/utils";
import { applicationRepository } from "@/lib/repositories";
import type { Application, Gender } from "@/types";

const STEPS = [
  "Kişisel Bilgiler",
  "Fiziksel Bilgiler",
  "Kariyer ve Yetenek",
  "Medya",
  "Onay",
] as const;

type FormState = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender | "";
  city: string;
  district: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  heightCm: string;
  weightKg: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  shoeSize: string;
  topSize: string;
  bottomSize: string;
  bust: string;
  waist: string;
  hips: string;
  actingExperience: string;
  actingEducation: string;
  projects: string;
  roles: string;
  languages: string;
  accents: string;
  sports: string;
  dance: string;
  instruments: string;
  specialSkills: string;
  drivingLicense: string;
  occupation: string;
  bio: string;
  showreelUrl: string;
  youtubeUrl: string;
  vimeoUrl: string;
  instagram: string;
  portfolioUrl: string;
  kvkk: boolean;
  privacy: boolean;
};

type FakeFile = { id: string; name: string; preview: string; kind: "portre" | "tam_boy" | "ek" };

const initial: FormState = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  city: "",
  district: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  heightCm: "",
  weightKg: "",
  hairColor: "",
  eyeColor: "",
  skinTone: "",
  shoeSize: "",
  topSize: "",
  bottomSize: "",
  bust: "",
  waist: "",
  hips: "",
  actingExperience: "",
  actingEducation: "",
  projects: "",
  roles: "",
  languages: "",
  accents: "",
  sports: "",
  dance: "",
  instruments: "",
  specialSkills: "",
  drivingLicense: "",
  occupation: "",
  bio: "",
  showreelUrl: "",
  youtubeUrl: "",
  vimeoUrl: "",
  instagram: "",
  portfolioUrl: "",
  kvkk: false,
  privacy: false,
};

function FakeUpload({
  label,
  kind,
  files,
  onAdd,
  onRemove,
  max = 1,
}: {
  label: string;
  kind: FakeFile["kind"];
  files: FakeFile[];
  onAdd: (f: FakeFile) => void;
  onRemove: (id: string) => void;
  max?: number;
}) {
  const current = files.filter((f) => f.kind === kind);
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <div
        className="rounded-[var(--radius)] border border-dashed border-border-strong bg-bg-warm/40 p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (current.length >= max) return;
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          onAdd({
            id: `${kind}-${Date.now()}`,
            name: file.name,
            preview: URL.createObjectURL(file),
            kind,
          });
        }}
      >
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-ink-muted">
            <Upload size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>Sürükle bırak veya dosya seç</p>
              <p className="mt-1 text-xs">JPG/PNG · maks. {max} dosya · demo yükleme</p>
            </div>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex h-9 items-center rounded border border-border-strong bg-surface px-3 text-sm font-medium">
              Dosya seç
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={current.length >= max}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || current.length >= max) return;
                onAdd({
                  id: `${kind}-${Date.now()}`,
                  name: file.name,
                  preview: URL.createObjectURL(file),
                  kind,
                });
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {current.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {current.map((f) => (
              <li key={f.id} className="relative overflow-hidden rounded border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.preview} alt={f.name} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded bg-black/70 p-1 text-white"
                  onClick={() => onRemove(f.id)}
                  aria-label="Kaldır"
                >
                  <X size={14} />
                </button>
                <p className="truncate px-2 py-1 text-[11px] text-ink-muted">{f.name}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export function ApplicationWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [files, setFiles] = useState<FakeFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const age = useMemo(
    () => (form.birthDate ? calcAge(form.birthDate) : null),
    [form.birthDate],
  );
  const under18 = age != null && age < 18;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(index: number) {
    const e: Record<string, string> = {};
    if (index === 0) {
      if (!form.firstName.trim()) e.firstName = "Ad gerekli";
      if (!form.lastName.trim()) e.lastName = "Soyad gerekli";
      if (!form.birthDate) e.birthDate = "Doğum tarihi gerekli";
      if (!form.gender) e.gender = "Cinsiyet gerekli";
      if (!form.city.trim()) e.city = "Şehir gerekli";
      if (!form.phone.trim()) e.phone = "Telefon gerekli";
      if (!form.email.trim()) e.email = "E-posta gerekli";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Geçerli e-posta girin";
      if (under18) {
        if (!form.guardianName.trim()) e.guardianName = "Veli adı gerekli";
        if (!form.guardianPhone.trim()) e.guardianPhone = "Veli telefonu gerekli";
      }
    }
    if (index === 1) {
      if (!form.heightCm) e.heightCm = "Boy gerekli";
      if (!form.weightKg) e.weightKg = "Kilo gerekli";
      if (!form.hairColor) e.hairColor = "Saç rengi gerekli";
      if (!form.eyeColor) e.eyeColor = "Göz rengi gerekli";
    }
    if (index === 4) {
      if (!form.kvkk) e.kvkk = "KVKK onayı gerekli";
      if (!form.privacy) e.privacy = "Gizlilik onayı gerekli";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const portrait =
        files.find((f) => f.kind === "portre")?.preview ??
        "/placeholders/actor-01.jpg";
      const full =
        files.find((f) => f.kind === "tam_boy")?.preview ?? portrait;
      const extras = files.filter((f) => f.kind === "ek");

      const payload: Omit<Application, "id" | "createdAt" | "updatedAt"> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: form.birthDate,
        age: age ?? 0,
        gender: form.gender as Gender,
        city: form.city.trim(),
        district: form.district.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        guardianName: under18 ? form.guardianName.trim() : undefined,
        guardianPhone: under18 ? form.guardianPhone.trim() : undefined,
        heightCm: Number(form.heightCm) || 0,
        weightKg: Number(form.weightKg) || 0,
        hairColor: form.hairColor,
        eyeColor: form.eyeColor,
        skinTone: form.skinTone,
        shoeSize: form.shoeSize,
        topSize: form.topSize,
        bottomSize: form.bottomSize,
        bust: form.bust,
        waist: form.waist,
        hips: form.hips,
        actingExperience: form.actingExperience,
        actingEducation: form.actingEducation,
        projects: form.projects,
        roles: form.roles,
        languages: form.languages,
        accents: form.accents,
        sports: form.sports,
        dance: form.dance,
        instruments: form.instruments,
        specialSkills: form.specialSkills,
        drivingLicense: form.drivingLicense,
        occupation: form.occupation,
        bio: form.bio,
        showreelUrl: form.showreelUrl || undefined,
        youtubeUrl: form.youtubeUrl || undefined,
        vimeoUrl: form.vimeoUrl || undefined,
        instagram: form.instagram || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
        photos: [
          {
            id: "new-p1",
            applicationId: "new",
            url: portrait,
            thumbnailUrl: portrait,
            type: "portre",
            alt: "Portre",
          },
          {
            id: "new-p2",
            applicationId: "new",
            url: full,
            thumbnailUrl: full,
            type: "tam_boy",
            alt: "Tam boy",
          },
          ...extras.map((f, i) => ({
            id: `new-ek-${i}`,
            applicationId: "new",
            url: f.preview,
            thumbnailUrl: f.preview,
            type: "ek" as const,
            alt: f.name,
          })),
        ],
        status: "yeni",
        tags: ["web-basvuru"],
        adminNotes: "",
        isFavorite: false,
      };
      await applicationRepository.create(payload);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-soft)] md:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--success)_15%,white)] text-success">
          <Check size={28} />
        </div>
        <h2 className="font-display mt-5 text-2xl font-semibold">
          Başvurunuz alındı
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Teşekkür ederiz. Ekibimiz başvurunuzu inceleyecek ve uygun
          görüldüğünde sizinle iletişime geçecektir.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Ana sayfaya dön</Button>
          </Link>
          <Link href="/oyuncular">
            <Button>Oyuncuları incele</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">
              Adım {step + 1} / {STEPS.length}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{STEPS[step]}</h2>
          </div>
          <p className="text-sm text-ink-muted">{Math.round(((step + 1) / STEPS.length) * 100)}%</p>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg-warm">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <ol className="mt-4 hidden gap-2 md:flex">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex-1 truncate text-xs",
                i <= step ? "text-ink font-medium" : "text-ink-soft",
              )}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-5 px-4 py-6 sm:px-6">
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Ad" required error={errors.firstName}>
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </FormField>
            <FormField label="Soyad" required error={errors.lastName}>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </FormField>
            <FormField label="Doğum tarihi" required error={errors.birthDate}>
              <Input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
            </FormField>
            <FormField label="Yaş">
              <Input value={age == null ? "" : String(age)} readOnly placeholder="Otomatik" />
            </FormField>
            <FormField label="Cinsiyet" required error={errors.gender}>
              <Select value={form.gender} onChange={(e) => set("gender", e.target.value as Gender | "")}>
                <option value="">Seçin</option>
                <option value="kadin">Kadın</option>
                <option value="erkek">Erkek</option>
                <option value="diger">Diğer</option>
                <option value="belirtmek_istemiyor">Belirtmek istemiyor</option>
              </Select>
            </FormField>
            <FormField label="Şehir" required error={errors.city}>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </FormField>
            <FormField label="İlçe">
              <Input value={form.district} onChange={(e) => set("district", e.target.value)} />
            </FormField>
            <FormField label="Telefon" required error={errors.phone}>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </FormField>
            <FormField label="WhatsApp">
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </FormField>
            <FormField label="E-posta" required error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </FormField>
            <FormField label="İkamet adresi" className="sm:col-span-2">
              <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
            </FormField>
            {under18 ? (
              <>
                <FormField label="Veli adı soyadı" required error={errors.guardianName}>
                  <Input value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
                </FormField>
                <FormField label="Veli telefonu" required error={errors.guardianPhone}>
                  <Input value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
                </FormField>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Boy (cm)" required error={errors.heightCm}>
              <Input type="number" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} />
            </FormField>
            <FormField label="Kilo (kg)" required error={errors.weightKg}>
              <Input type="number" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
            </FormField>
            <FormField label="Saç rengi" required error={errors.hairColor}>
              <Input value={form.hairColor} onChange={(e) => set("hairColor", e.target.value)} />
            </FormField>
            <FormField label="Göz rengi" required error={errors.eyeColor}>
              <Input value={form.eyeColor} onChange={(e) => set("eyeColor", e.target.value)} />
            </FormField>
            <FormField label="Ten rengi">
              <Input value={form.skinTone} onChange={(e) => set("skinTone", e.target.value)} />
            </FormField>
            <FormField label="Ayakkabı no">
              <Input value={form.shoeSize} onChange={(e) => set("shoeSize", e.target.value)} />
            </FormField>
            <FormField label="Üst beden">
              <Input value={form.topSize} onChange={(e) => set("topSize", e.target.value)} />
            </FormField>
            <FormField label="Alt beden">
              <Input value={form.bottomSize} onChange={(e) => set("bottomSize", e.target.value)} />
            </FormField>
            <FormField label="Göğüs">
              <Input value={form.bust} onChange={(e) => set("bust", e.target.value)} />
            </FormField>
            <FormField label="Bel">
              <Input value={form.waist} onChange={(e) => set("waist", e.target.value)} />
            </FormField>
            <FormField label="Kalça">
              <Input value={form.hips} onChange={(e) => set("hips", e.target.value)} />
            </FormField>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Oyunculuk deneyimi">
              <Textarea value={form.actingExperience} onChange={(e) => set("actingExperience", e.target.value)} />
            </FormField>
            <FormField label="Oyunculuk eğitimi">
              <Textarea value={form.actingEducation} onChange={(e) => set("actingEducation", e.target.value)} />
            </FormField>
            <FormField label="Çalıştığı projeler">
              <Textarea value={form.projects} onChange={(e) => set("projects", e.target.value)} />
            </FormField>
            <FormField label="Rol bilgileri">
              <Textarea value={form.roles} onChange={(e) => set("roles", e.target.value)} />
            </FormField>
            <FormField label="Yabancı diller">
              <Input value={form.languages} onChange={(e) => set("languages", e.target.value)} />
            </FormField>
            <FormField label="Aksan / şive">
              <Input value={form.accents} onChange={(e) => set("accents", e.target.value)} />
            </FormField>
            <FormField label="Spor">
              <Input value={form.sports} onChange={(e) => set("sports", e.target.value)} />
            </FormField>
            <FormField label="Dans">
              <Input value={form.dance} onChange={(e) => set("dance", e.target.value)} />
            </FormField>
            <FormField label="Enstrüman">
              <Input value={form.instruments} onChange={(e) => set("instruments", e.target.value)} />
            </FormField>
            <FormField label="Özel yetenekler">
              <Input value={form.specialSkills} onChange={(e) => set("specialSkills", e.target.value)} />
            </FormField>
            <FormField label="Ehliyet">
              <Input value={form.drivingLicense} onChange={(e) => set("drivingLicense", e.target.value)} />
            </FormField>
            <FormField label="Meslek">
              <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
            </FormField>
            <FormField label="Kısa biyografi" className="sm:col-span-2">
              <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            </FormField>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <FakeUpload
              label="Portre fotoğrafı"
              kind="portre"
              files={files}
              max={1}
              onAdd={(f) => setFiles((prev) => [...prev.filter((x) => x.kind !== "portre"), f])}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
            <FakeUpload
              label="Tam boy fotoğraf"
              kind="tam_boy"
              files={files}
              max={1}
              onAdd={(f) => setFiles((prev) => [...prev.filter((x) => x.kind !== "tam_boy"), f])}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
            <FakeUpload
              label="Ek fotoğraflar"
              kind="ek"
              files={files}
              max={6}
              onAdd={(f) => setFiles((prev) => [...prev, f])}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Showreel linki">
                <Input value={form.showreelUrl} onChange={(e) => set("showreelUrl", e.target.value)} />
              </FormField>
              <FormField label="YouTube / Vimeo">
                <Input value={form.youtubeUrl || form.vimeoUrl} onChange={(e) => set("youtubeUrl", e.target.value)} />
              </FormField>
              <FormField label="Instagram">
                <Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
              </FormField>
              <FormField label="Diğer portföy">
                <Input value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} />
              </FormField>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <div className="grid gap-3 rounded border border-border bg-bg-warm/40 p-4 text-sm sm:grid-cols-2">
              <p><span className="text-ink-muted">Ad Soyad:</span> {form.firstName} {form.lastName}</p>
              <p><span className="text-ink-muted">Yaş:</span> {age ?? "-"}</p>
              <p><span className="text-ink-muted">Şehir:</span> {form.city}</p>
              <p><span className="text-ink-muted">Boy:</span> {form.heightCm || "-"} cm</p>
              <p><span className="text-ink-muted">Telefon:</span> {form.phone}</p>
              <p><span className="text-ink-muted">E-posta:</span> {form.email}</p>
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.kvkk}
                onChange={(e) => set("kvkk", e.target.checked)}
              />
              <span>
                <Link href="/kvkk" className="underline underline-offset-2" target="_blank">
                  KVKK
                </Link>{" "}
                metnini okudum ve onaylıyorum.
              </span>
            </label>
            {errors.kvkk ? <p className="text-xs text-danger">{errors.kvkk}</p> : null}
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.privacy}
                onChange={(e) => set("privacy", e.target.checked)}
              />
              <span>
                <Link href="/gizlilik" className="underline underline-offset-2" target="_blank">
                  Gizlilik
                </Link>{" "}
                politikasını okudum ve onaylıyorum.
              </span>
            </label>
            {errors.privacy ? <p className="text-xs text-danger">{errors.privacy}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || submitting}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft size={16} /> Geri
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => {
              if (validateStep(step)) setStep((s) => s + 1);
            }}
          >
            Devam <ChevronRight size={16} />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </Button>
        )}
      </div>
    </div>
  );
}
