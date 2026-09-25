"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { applicationRepository, actorRepository } from "@/lib/repositories";
import type { Application, ApplicationStatus, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { PageHeader, StatusBadge } from "@/components/ui/StatusBadge";
import { GENDER_LABELS, STATUS_LABELS } from "@/config/constants";
import { formatDateTR, fullName } from "@/lib/utils";
import { MAX_PHOTOS } from "@/lib/applications/schema";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("new");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [experience, setExperience] = useState("");
  const [projects, setProjects] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  function syncFields(data: Application) {
    setNote(data.adminNotes);
    setStatus(data.status);
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setPhone(data.phone || "");
    setCity(data.city || "");
    setBirthDate(data.birthDate || "");
    setAge(data.age != null ? String(data.age) : "");
    setGender(data.gender || "");
    setHeightCm(data.heightCm != null ? String(data.heightCm) : "");
    setWeightKg(data.weightKg != null ? String(data.weightKg) : "");
    setHairColor(data.hairColor || "");
    setEyeColor(data.eyeColor || "");
    setExperience(data.experience || "");
    setProjects(data.projects || "");
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await applicationRepository.getById(params.id);
        setApp(data);
        if (data) syncFields(data);
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
    setActionSuccess("");
    try {
      const updated = await applicationRepository.updateStatus(app.id, status);
      setApp(updated);
      setActionSuccess("Durum kaydedildi.");
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
    setActionSuccess("");
    try {
      const updated = await applicationRepository.update(app.id, {
        adminNotes: note,
      });
      setApp(updated);
      setActionSuccess("Not kaydedildi.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Not kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile() {
    if (!app) return;
    setSaving(true);
    setActionError("");
    setActionSuccess("");
    try {
      const updated = await applicationRepository.update(app.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        birthDate: birthDate || "",
        age: age.trim() ? Number(age) : null,
        gender: gender || "",
        heightCm: heightCm.trim() ? Number(heightCm) : null,
        weightKg: weightKg.trim() ? Number(weightKg) : null,
        hairColor: hairColor,
        eyeColor: eyeColor,
        experience: experience,
        projects: projects,
        adminNotes: note,
      });
      setApp(updated);
      syncFields(updated);
      setActionSuccess("Başvuru bilgileri kaydedildi.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Profil kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhotos(fileList: FileList | null) {
    if (!app || !fileList?.length) return;
    setUploading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const remaining = MAX_PHOTOS - app.photos.length;
      if (remaining <= 0) {
        setActionError(
          "Bu başvuruda zaten 5 fotoğraf var. Yeni fotoğraf eklenemez.",
        );
        return;
      }
      const files = Array.from(fileList).slice(0, remaining);
      const updated = await applicationRepository.uploadPhotos(app.id, files);
      setApp(updated);
      setActionSuccess("Fotoğraflar yüklendi.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Fotoğraflar yüklenemedi.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function addTag() {
    if (!app || !tag.trim()) return;
    setActionError("");
    setActionSuccess("");
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
    setActionSuccess("");
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

  const remainingPhotos = MAX_PHOTOS - app.photos.length;

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
      {actionSuccess ? (
        <p className="mb-4 text-sm text-secondary">{actionSuccess}</p>
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
              İletişim Bilgileri
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Ad" required>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormField>
              <FormField label="Soyad" required>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormField>
              <FormField label="Telefon" required>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                />
              </FormField>
              <FormField label="Şehir" required>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </FormField>
            </div>
          </section>

          <section className="border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
              Kişisel Bilgiler
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Doğum tarihi ve yaş birbirinden bağımsızdır; biri diğerini
              otomatik değiştirmez.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Doğum tarihi">
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </FormField>
              <FormField label="Yaş">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </FormField>
              <FormField label="Cinsiyet" className="sm:col-span-2">
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | "")}
                >
                  <option value="">Seçin</option>
                  {Object.entries(GENDER_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          <section className="border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
              Fiziksel Özellikler
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Boy (cm)">
                <Input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </FormField>
              <FormField label="Kilo (kg)">
                <Input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </FormField>
              <FormField label="Saç rengi">
                <Input
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                />
              </FormField>
              <FormField label="Göz rengi">
                <Input
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                />
              </FormField>
            </div>
          </section>

          <section className="border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
              Oyunculuk Bilgileri
            </h2>
            <div className="mt-4 grid gap-4">
              <FormField label="Deneyim">
                <Textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={4}
                />
              </FormField>
              <FormField label="Oynadığı projeler">
                <Textarea
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                  rows={4}
                  placeholder="Dizi, film, reklam, tiyatro vb."
                />
              </FormField>
              <FormField label="Not">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </FormField>
            </div>
            <Button className="mt-4" onClick={saveProfile} disabled={saving}>
              Kaydet
            </Button>
          </section>

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
                  Fotoğraf yok. Public formda fotoğraf istenmez; buradan
                  ekleyebilirsiniz.
                </p>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                className="hidden"
                disabled={remainingPhotos <= 0 || uploading}
                onChange={(e) => uploadPhotos(e.target.files)}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={remainingPhotos <= 0 || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Yükleniyor..." : "Fotoğraf ekle"}
              </Button>
              <span className="text-xs text-ink-muted">
                {app.photos.length}/{MAX_PHOTOS} · JPG/PNG/WEBP · max 10 MB
              </span>
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
            <FormField label="Admin notu (hızlı)">
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
