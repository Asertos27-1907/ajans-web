"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { applicationRepository, actorRepository } from "@/lib/repositories";
import type { Application, ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { PageHeader, StatusBadge } from "@/components/ui/StatusBadge";
import { GENDER_LABELS, STATUS_LABELS } from "@/config/constants";
import { formatDateTR, fullName } from "@/lib/utils";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("yeni");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await applicationRepository.getById(params.id);
      setApp(data);
      if (data) {
        setNote(data.adminNotes);
        setStatus(data.status);
      }
      setLoading(false);
    });
  }, [params.id]);

  async function saveStatus() {
    if (!app) return;
    setSaving(true);
    const updated = await applicationRepository.updateStatus(app.id, status);
    setApp(updated);
    setSaving(false);
  }

  async function saveNote() {
    if (!app) return;
    setSaving(true);
    const updated = await applicationRepository.update(app.id, { adminNotes: note });
    setApp(updated);
    setSaving(false);
  }

  async function addTag() {
    if (!app || !tag.trim()) return;
    const tags = Array.from(new Set([...app.tags, tag.trim()]));
    const updated = await applicationRepository.update(app.id, { tags });
    setApp(updated);
    setTag("");
  }

  async function toggleFavorite() {
    if (!app) return;
    const updated = await applicationRepository.update(app.id, {
      isFavorite: !app.isFavorite,
    });
    setApp(updated);
  }

  async function archive() {
    if (!app) return;
    const updated = await applicationRepository.updateStatus(app.id, "arsiv");
    setApp(updated);
    setStatus("arsiv");
  }

  async function remove() {
    if (!app) return;
    if (!confirm("Başvuru silinsin mi?")) return;
    await applicationRepository.remove(app.id);
    router.push("/dashboard/basvurular");
  }

  async function convertToActor() {
    if (!app) return;
    setSaving(true);
    await actorRepository.fromApplication(app);
    await applicationRepository.updateStatus(app.id, "kabul");
    setSaving(false);
    router.push("/dashboard/oyuncular");
  }

  if (loading) {
    return <div className="skeleton h-64 rounded" />;
  }
  if (!app) {
    return <p>Başvuru bulunamadı.</p>;
  }

  return (
    <div>
      <PageHeader
        title={fullName(app.firstName, app.lastName)}
        description={`Başvuru · ${formatDateTR(app.createdAt)}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={toggleFavorite}>
              {app.isFavorite ? "Favoriden çıkar" : "Favorile"}
            </Button>
            <Button variant="outline" size="sm" onClick={archive}>
              Arşivle
            </Button>
            <Button variant="danger" size="sm" onClick={remove}>
              Sil
            </Button>
            <Button size="sm" onClick={convertToActor} disabled={saving}>
              Oyuncu havuzuna aktar
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={app.status} />
        <div className="flex flex-wrap gap-1">
          {app.tags.map((t) => (
            <span key={t} className="rounded bg-bg-warm px-2 py-0.5 text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded border border-border bg-surface p-5">
            <h2 className="font-semibold">Kişisel bilgiler</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Yaş", app.age],
                ["Cinsiyet", GENDER_LABELS[app.gender]],
                ["Şehir", `${app.city} / ${app.district}`],
                ["Telefon", app.phone],
                ["WhatsApp", app.whatsapp],
                ["E-posta", app.email],
                ["Adres", app.address],
                ["Veli", app.guardianName || "-"],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded border border-border bg-surface p-5">
            <h2 className="font-semibold">Fiziksel bilgiler</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              {[
                ["Boy", `${app.heightCm} cm`],
                ["Kilo", `${app.weightKg} kg`],
                ["Saç", app.hairColor],
                ["Göz", app.eyeColor],
                ["Ten", app.skinTone],
                ["Ayakkabı", app.shoeSize],
                ["Üst", app.topSize],
                ["Alt", app.bottomSize],
                ["Göğüs/Bel/Kalça", `${app.bust || "-"} / ${app.waist || "-"} / ${app.hips || "-"}`],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded border border-border bg-surface p-5">
            <h2 className="font-semibold">Kariyer</h2>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              {[
                ["Deneyim", app.actingExperience],
                ["Eğitim", app.actingEducation],
                ["Projeler", app.projects],
                ["Roller", app.roles],
                ["Diller", app.languages],
                ["Aksan", app.accents],
                ["Spor", app.sports],
                ["Dans", app.dance],
                ["Enstrüman", app.instruments],
                ["Yetenekler", app.specialSkills],
                ["Ehliyet", app.drivingLicense],
                ["Meslek", app.occupation],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <p className="text-ink-soft">{k}</p>
                  <p className="mt-1">{v || "-"}</p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-ink-soft">Biyografi</p>
                <p className="mt-1">{app.bio || "-"}</p>
              </div>
            </div>
          </section>

          <section className="rounded border border-border bg-surface p-5">
            <h2 className="font-semibold">Fotoğraflar & medya</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {app.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-[3/4] overflow-hidden rounded bg-bg-warm">
                  <Image src={photo.thumbnailUrl} alt={photo.alt} fill className="object-cover" sizes="160px" />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm text-ink-muted">
              {app.showreelUrl ? <p>Showreel: {app.showreelUrl}</p> : null}
              {app.instagram ? <p>Instagram: {app.instagram}</p> : null}
              {app.youtubeUrl ? <p>YouTube: {app.youtubeUrl}</p> : null}
              {app.portfolioUrl ? <p>Portföy: {app.portfolioUrl}</p> : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-border bg-surface p-4">
            <FormField label="Durum">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button className="mt-3 w-full" onClick={saveStatus} disabled={saving}>
              Durumu kaydet
            </Button>
          </div>
          <div className="rounded border border-border bg-surface p-4">
            <FormField label="Admin notu">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>
            <Button className="mt-3 w-full" variant="outline" onClick={saveNote} disabled={saving}>
              Notu kaydet
            </Button>
          </div>
          <div className="rounded border border-border bg-surface p-4">
            <FormField label="Etiket ekle">
              <Input value={tag} onChange={(e) => setTag(e.target.value)} />
            </FormField>
            <Button className="mt-3 w-full" variant="outline" onClick={addTag}>
              Ekle
            </Button>
          </div>
          <Link href="/dashboard/basvurular" className="block text-sm text-ink-muted hover:text-ink">
            ← Listeye dön
          </Link>
        </aside>
      </div>
    </div>
  );
}
