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
  const [status, setStatus] = useState<ApplicationStatus>("new");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await applicationRepository.getById(params.id);
        setApp(data);
        if (data) {
          setNote(data.adminNotes);
          setStatus(data.status);
        }
      } catch {
        setApp(null);
      } finally {
        setLoading(false);
      }
    });
  }, [params.id]);

  async function saveStatus() {
    if (!app) return;
    setSaving(true);
    setActionError("");
    try {
      const updated = await applicationRepository.updateStatus(app.id, status);
      setApp(updated);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Durum güncellenemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!app) return;
    setSaving(true);
    setActionError("");
    try {
      const updated = await applicationRepository.update(app.id, {
        adminNotes: note,
      });
      setApp(updated);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Not kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addTag() {
    if (!app || !tag.trim()) return;
    setActionError("");
    try {
      const tags = Array.from(new Set([...app.tags, tag.trim()]));
      const updated = await applicationRepository.update(app.id, { tags });
      setApp(updated);
      setTag("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Etiket eklenemedi.",
      );
    }
  }

  async function removeTag(value: string) {
    if (!app) return;
    setActionError("");
    try {
      const tags = app.tags.filter((t) => t !== value);
      const updated = await applicationRepository.update(app.id, { tags });
      setApp(updated);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Etiket kaldırılamadı.",
      );
    }
  }

  async function archive() {
    if (!app) return;
    if (!confirm("Başvuru arşivlensin mi?")) return;
    setSaving(true);
    setActionError("");
    try {
      const updated = await applicationRepository.archive(app.id);
      setApp(updated);
      setStatus("archived");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Arşivleme başarısız.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!app) return;
    if (!confirm("Başvuru arşivlenecek. Devam edilsin mi?")) return;
    setSaving(true);
    setActionError("");
    try {
      await applicationRepository.remove(app.id);
      router.push("/dashboard/basvurular");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "İşlem başarısız.",
      );
      setSaving(false);
    }
  }

  async function convertToActor() {
    if (!app) return;
    setSaving(true);
    setActionError("");
    try {
      await actorRepository.fromApplication(app);
      router.push("/dashboard/oyuncular");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Aktarım başarısız.",
      );
      setSaving(false);
    }
  }

  if (loading) return <div className="skeleton h-64 rounded" />;
  if (!app) return <p>Başvuru bulunamadı.</p>;

  const infoRows: [string, string | number | undefined][] = [
    ["Telefon", app.phone],
    ["Doğum tarihi", app.birthDate],
    ["Yaş", app.age],
    ["Cinsiyet", GENDER_LABELS[app.gender]],
    ["Şehir", app.city],
    ["Boy", app.heightCm ? `${app.heightCm} cm` : undefined],
    ["Kilo", app.weightKg ? `${app.weightKg} kg` : undefined],
    ["Başvuru tarihi", formatDateTR(app.createdAt)],
  ];

  return (
    <div>
      <PageHeader
        title={fullName(app.firstName, app.lastName)}
        description={`Başvuru · ${formatDateTR(app.createdAt)}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={archive} disabled={saving}>
              Arşivle
            </Button>
            <Button variant="danger" size="sm" onClick={remove} disabled={saving}>
              Sil
            </Button>
            <Button size="sm" onClick={convertToActor} disabled={saving}>
              Oyuncuya Dönüştür
            </Button>
          </>
        }
      />

      {actionError ? (
        <p className="mb-4 text-sm text-danger">{actionError}</p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={app.status} />
        <div className="flex flex-wrap gap-1">
          {app.tags.map((t) => (
            <button
              key={t}
              type="button"
              className="rounded bg-secondary-soft px-2 py-0.5 text-xs text-secondary hover:opacity-80"
              onClick={() => removeTag(t)}
              title="Etiketi kaldır"
            >
              {t} ×
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
              Başvuru bilgileri
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {infoRows
                .filter(([, v]) => v !== undefined && v !== "")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          {app.experience ? (
            <section className="border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
                Deneyim
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {app.experience}
              </p>
            </section>
          ) : null}

          <section className="border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
              Fotoğraflar
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {app.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-[3/4] overflow-hidden bg-bg-muted"
                >
                  {photo.thumbnailUrl || photo.url ? (
                    <Image
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized
                    />
                  ) : null}
                </div>
              ))}
              {!app.photos.length ? (
                <p className="col-span-full text-sm text-ink-muted">
                  Fotoğraf yok.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="border border-border bg-surface p-4">
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
          <div className="border border-border bg-surface p-4">
            <FormField label="Admin notu">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>
            <Button
              className="mt-3 w-full"
              variant="outline"
              onClick={saveNote}
              disabled={saving}
            >
              Notu kaydet
            </Button>
          </div>
          <div className="border border-border bg-surface p-4">
            <FormField label="Etiket ekle">
              <Input value={tag} onChange={(e) => setTag(e.target.value)} />
            </FormField>
            <Button className="mt-3 w-full" variant="outline" onClick={addTag}>
              Ekle
            </Button>
          </div>
          <Link
            href="/dashboard/basvurular"
            className="block cursor-pointer text-sm text-ink-muted hover:text-primary"
          >
            ← Listeye dön
          </Link>
        </aside>
      </div>
    </div>
  );
}
