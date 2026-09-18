"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { actorRepository } from "@/lib/repositories";
import type { Actor, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { GENDER_LABELS } from "@/config/constants";
import { calcAge, cn, fullName } from "@/lib/utils";

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
  gender: "kadin" as Gender,
  city: "",
  heightCm: "",
  weightKg: "",
  experience: "",
  isActive: true,
};

export default function ActorsAdminPage() {
  const [items, setItems] = useState<Actor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Actor | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      try {
        const result = await actorRepository.list({
          search: search || undefined,
          gender: (gender as Gender) || undefined,
          isActive: status === "" ? undefined : status === "1",
          page: 1,
          pageSize: 60,
        });
        setItems(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Oyuncular yüklenemedi.");
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
    setNewPhotos([]);
    setPhotoPreviews([]);
    setError("");
  }

  function openEdit(actor: Actor) {
    setCreating(false);
    setEditing(actor);
    setForm({
      firstName: actor.firstName,
      lastName: actor.lastName,
      phone: actor.phone || "",
      birthDate: actor.birthDate,
      gender: actor.gender,
      city: actor.city,
      heightCm: actor.heightCm ? String(actor.heightCm) : "",
      weightKg: actor.weightKg ? String(actor.weightKg) : "",
      experience: actor.experience || "",
      isActive: actor.isActive,
    });
    setNewPhotos([]);
    setPhotoPreviews([]);
    setError("");
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPhotos([]);
    setPhotoPreviews([]);
  }

  function onPickPhotos(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 5);
    setNewPhotos(list);
    setPhotoPreviews(list.map((f) => URL.createObjectURL(f)));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const age = form.birthDate ? calcAge(form.birthDate) : 0;
      void age;
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        birthDate: form.birthDate,
        gender: form.gender,
        city: form.city.trim(),
        heightCm: Number(form.heightCm) || undefined,
        weightKg: Number(form.weightKg) || undefined,
        experience: form.experience.trim(),
        isActive: form.isActive,
      };

      if (!payload.firstName || !payload.lastName || !payload.city || !payload.birthDate) {
        setError("Ad, soyad, şehir ve doğum tarihi zorunlu.");
        return;
      }

      if (editing) {
        let updated = await actorRepository.update(editing.id, payload);
        if (newPhotos.length) {
          updated = await actorRepository.update(editing.id, {
            newPhotos,
          });
        }
        if (updated) {
          setItems((prev) => prev.map((a) => (a.id === updated!.id ? updated! : a)));
        }
      } else {
        const actor = await actorRepository.create({
          ...payload,
          photos: newPhotos,
        });
        setItems((prev) => [actor, ...prev]);
        setTotal((t) => t + 1);
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  }

  async function removePhoto(photoId: string) {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const updated = await actorRepository.update(editing.id, {
        deletePhotoId: photoId,
      });
      if (updated) {
        setEditing(updated);
        setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fotoğraf silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(actor: Actor, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const prev = actor.isActive;
    setItems((items) =>
      items.map((a) => (a.id === actor.id ? { ...a, isActive: !prev } : a)),
    );
    try {
      const updated = await actorRepository.update(actor.id, {
        isActive: !prev,
      });
      if (updated) {
        setItems((items) =>
          items.map((a) => (a.id === updated.id ? updated : a)),
        );
      }
    } catch {
      setItems((items) =>
        items.map((a) => (a.id === actor.id ? { ...a, isActive: prev } : a)),
      );
      setError("Durum güncellenemedi.");
    }
  }

  async function removeActor(actor: Actor) {
    if (!confirm(`${fullName(actor.firstName, actor.lastName)} silinsin mi?`)) {
      return;
    }
    setError("");
    try {
      await actorRepository.remove(actor.id);
      setItems((prev) => prev.filter((a) => a.id !== actor.id));
      setTotal((t) => Math.max(0, t - 1));
      if (editing?.id === actor.id) closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme başarısız.");
    }
  }

  function clearFilters() {
    setSearch("");
    setGender("");
    setStatus("");
    setTimeout(() => load(), 0);
  }

  const modalOpen = creating || !!editing;

  return (
    <div>
      <PageHeader
        title="Oyuncular"
        description={`${total} kayıt`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Yeni oyuncu
          </Button>
        }
      />

      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

      <div className="mb-5 grid gap-3 rounded border border-border bg-surface p-4 md:grid-cols-4">
        <FormField label="Arama">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad veya şehir ara"
          />
        </FormField>
        <FormField label="Cinsiyet">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Tümü</option>
            <option value="erkek">Erkek</option>
            <option value="kadin">Kadın</option>
            <option value="diger">Diğer</option>
          </Select>
        </FormField>
        <FormField label="Durum">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tümü</option>
            <option value="1">Aktif</option>
            <option value="0">Pasif</option>
          </Select>
        </FormField>
        <div className="flex items-end gap-2">
          <Button onClick={load}>Filtrele</Button>
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw size={14} /> Temizle
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4]" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          title="Oyuncu bulunamadı"
          description="Filtreleri değiştirmeyi deneyin."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((actor) => (
            <article
              key={actor.id}
              className="group overflow-hidden border border-border bg-surface transition hover:border-secondary/40"
            >
              <div className="relative aspect-[3/4] bg-bg-muted">
                <Link
                  href={`/dashboard/oyuncular/${actor.id}`}
                  className="absolute inset-0 cursor-pointer"
                  aria-label={`${fullName(actor.firstName, actor.lastName)} detay`}
                >
                  {actor.coverPhotoUrl ? (
                    <Image
                      src={actor.coverPhotoUrl}
                      alt={fullName(actor.firstName, actor.lastName)}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width:768px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : null}
                </Link>
                <button
                  type="button"
                  onClick={(e) => toggleActive(actor, e)}
                  title={actor.isActive ? "Pasif yap" : "Aktif yap"}
                  aria-label={actor.isActive ? "Pasif yap" : "Aktif yap"}
                  className={cn(
                    "absolute top-3 left-3 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-semibold text-white shadow",
                    actor.isActive ? "bg-success" : "bg-danger",
                  )}
                >
                  {actor.isActive ? "Aktif" : "Pasif"}
                </button>
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <Link
                    href={`/dashboard/oyuncular/${actor.id}`}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-black/65 text-white hover:bg-primary"
                    aria-label="Görüntüle"
                  >
                    <Eye size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(actor)}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-black/65 text-white hover:bg-secondary"
                    aria-label="Düzenle"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeActor(actor)}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-black/65 text-white hover:bg-danger"
                    aria-label="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => openEdit(actor)}
                  className="cursor-pointer text-left text-sm font-semibold text-ink hover:text-primary"
                >
                  {fullName(actor.firstName, actor.lastName)}
                </button>
                <p className="mt-1 text-xs text-ink-muted">
                  {actor.city} · {actor.age} · {GENDER_LABELS[actor.gender]}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden bg-surface shadow-[var(--shadow-soft)] sm:rounded"
          >
            <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-3 text-white">
              <h2 className="font-display text-lg font-semibold">
                {editing ? "Oyuncu düzenle" : "Yeni oyuncu"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded hover:bg-white/10"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Ad">
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </FormField>
                <FormField label="Soyad">
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </FormField>
                <FormField label="Telefon">
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </FormField>
                <FormField label="Doğum Tarihi">
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  />
                </FormField>
                <FormField label="Cinsiyet">
                  <Select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value as Gender })
                    }
                  >
                    <option value="kadin">Kadın</option>
                    <option value="erkek">Erkek</option>
                    <option value="diger">Diğer</option>
                    <option value="belirtmek_istemiyor">Belirtmek istemiyor</option>
                  </Select>
                </FormField>
                <FormField label="Şehir">
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </FormField>
                <FormField label="Boy (cm)">
                  <Input
                    type="number"
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                  />
                </FormField>
                <FormField label="Kilo (kg)">
                  <Input
                    type="number"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  />
                </FormField>
                <FormField label="Deneyim" className="sm:col-span-2">
                  <Textarea
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    rows={3}
                  />
                </FormField>
                <FormField label="Fotoğraf ekle" className="sm:col-span-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => onPickPhotos(e.target.files)}
                  />
                </FormField>
                <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  Aktif
                </label>

                {editing?.photos?.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    {editing.photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-[3/4] overflow-hidden border border-border">
                        {photo.url ? (
                          <Image
                            src={photo.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="120px"
                            unoptimized
                          />
                        ) : null}
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded bg-black/70 p-1 text-white"
                          onClick={() => removePhoto(photo.id)}
                          aria-label="Fotoğrafı sil"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {photoPreviews.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    {photoPreviews.map((src) => (
                      <div key={src} className="relative aspect-[3/4] overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-bg-muted px-4 py-3">
              <Button variant="outline" onClick={closeModal}>
                İptal
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Güncelle"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
