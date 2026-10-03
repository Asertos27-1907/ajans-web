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
import { fullName, cn } from "@/lib/utils";

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
  age: "",
  gender: "kadin" as Gender,
  city: "",
  heightCm: "",
  weightKg: "",
  hairColor: "",
  eyeColor: "",
  experience: "",
  projects: "",
  adminNotes: "",
  isActive: true,
  showOnWebsite: false,
  isFeatured: false,
  displayOrder: "",
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
      age: actor.age ? String(actor.age) : "",
      gender: actor.gender,
      city: actor.city,
      heightCm: actor.heightCm ? String(actor.heightCm) : "",
      weightKg: actor.weightKg ? String(actor.weightKg) : "",
      hairColor: actor.hairColor || "",
      eyeColor: actor.eyeColor || "",
      experience: actor.experience || "",
      projects: actor.projects || "",
      adminNotes: actor.adminNotes || "",
      isActive: actor.isActive,
      showOnWebsite: actor.showOnWebsite,
      isFeatured: actor.isFeatured,
      displayOrder:
        actor.displayOrder != null ? String(actor.displayOrder) : "",
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

  function buildPayload() {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      birthDate: form.birthDate,
      age: form.age ? Number(form.age) : null,
      gender: form.gender,
      city: form.city.trim(),
      heightCm: Number(form.heightCm) || undefined,
      weightKg: Number(form.weightKg) || undefined,
      hairColor: form.hairColor.trim(),
      eyeColor: form.eyeColor.trim(),
      experience: form.experience.trim(),
      projects: form.projects.trim(),
      adminNotes: form.adminNotes.trim(),
      isActive: form.isActive,
      showOnWebsite: form.showOnWebsite,
      isFeatured: form.isFeatured,
      displayOrder: form.displayOrder ? Number(form.displayOrder) : null,
    };
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();

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
    if (!confirm("Bu fotoğraf silinsin mi?")) return;
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

  async function setPrimary(photoId: string) {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const updated = await actorRepository.update(editing.id, {
        primaryPhotoId: photoId,
      });
      if (updated) {
        setEditing(updated);
        setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ana fotoğraf ayarlanamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(
    actor: Actor,
    field: "isActive" | "showOnWebsite" | "isFeatured",
    e: React.MouseEvent,
  ) {
    e.preventDefault();
    e.stopPropagation();
    const prev = actor[field];
    setItems((items) =>
      items.map((a) => (a.id === actor.id ? { ...a, [field]: !prev } : a)),
    );
    try {
      const updated = await actorRepository.update(actor.id, {
        [field]: !prev,
      });
      if (updated) {
        setItems((items) =>
          items.map((a) => (a.id === updated.id ? updated : a)),
        );
      }
    } catch {
      setItems((items) =>
        items.map((a) => (a.id === actor.id ? { ...a, [field]: prev } : a)),
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
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          title="Oyuncu bulunamadı"
          description="Filtreleri değiştirmeyi deneyin."
        />
      ) : (
        <div className="overflow-x-auto rounded border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-muted text-xs tracking-wide text-ink-soft uppercase">
              <tr>
                <th className="px-3 py-3 font-semibold">Oyuncu</th>
                <th className="hidden px-3 py-3 font-semibold sm:table-cell">Şehir</th>
                <th className="hidden px-3 py-3 font-semibold md:table-cell">Yaş</th>
                <th className="px-3 py-3 font-semibold">Durum</th>
                <th className="hidden px-3 py-3 font-semibold lg:table-cell">Web</th>
                <th className="hidden px-3 py-3 font-semibold lg:table-cell">Öne çıkan</th>
                <th className="px-3 py-3 font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((actor) => (
                <tr key={actor.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-bg-muted">
                        {actor.coverPhotoUrl ? (
                          <Image
                            src={actor.coverPhotoUrl}
                            alt={fullName(actor.firstName, actor.lastName)}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">
                          {fullName(actor.firstName, actor.lastName)}
                        </p>
                        <p className="text-xs text-ink-muted sm:hidden">
                          {actor.city} · {actor.age}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 sm:table-cell">{actor.city}</td>
                  <td className="hidden px-3 py-3 md:table-cell">{actor.age || "—"}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={(e) => toggleField(actor, "isActive", e)}
                      className={cn(
                        "cursor-pointer rounded px-2 py-1 text-[11px] font-semibold text-white",
                        actor.isActive ? "bg-success" : "bg-danger",
                      )}
                    >
                      {actor.isActive ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <button
                      type="button"
                      onClick={(e) => toggleField(actor, "showOnWebsite", e)}
                      className={cn(
                        "cursor-pointer rounded px-2 py-1 text-[11px] font-semibold",
                        actor.showOnWebsite
                          ? "bg-primary/15 text-primary"
                          : "bg-bg-muted text-ink-muted",
                      )}
                    >
                      {actor.showOnWebsite ? "Görünür" : "Gizli"}
                    </button>
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <button
                      type="button"
                      onClick={(e) => toggleField(actor, "isFeatured", e)}
                      className={cn(
                        "cursor-pointer rounded px-2 py-1 text-[11px] font-semibold",
                        actor.isFeatured
                          ? "bg-secondary/15 text-secondary"
                          : "bg-bg-muted text-ink-muted",
                      )}
                    >
                      {actor.isFeatured ? "Öne çıkan" : "—"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/oyuncular/${actor.id}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border hover:bg-bg-muted"
                        aria-label="Görüntüle"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(actor)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border hover:bg-bg-muted"
                        aria-label="Düzenle"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeActor(actor)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border hover:bg-danger/10 hover:text-danger"
                        aria-label="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <FormField label="Yaş">
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
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
                <FormField label="Saç rengi">
                  <Input
                    value={form.hairColor}
                    onChange={(e) => setForm({ ...form, hairColor: e.target.value })}
                  />
                </FormField>
                <FormField label="Göz rengi">
                  <Input
                    value={form.eyeColor}
                    onChange={(e) => setForm({ ...form, eyeColor: e.target.value })}
                  />
                </FormField>
                <FormField label="Sıra">
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm({ ...form, displayOrder: e.target.value })
                    }
                    placeholder="1, 2, 3…"
                  />
                </FormField>
                <FormField label="Deneyim" className="sm:col-span-2">
                  <Textarea
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    rows={3}
                  />
                </FormField>
                <FormField label="Oynadığı projeler" className="sm:col-span-2">
                  <Textarea
                    value={form.projects}
                    onChange={(e) => setForm({ ...form, projects: e.target.value })}
                    rows={3}
                    placeholder="Her satıra bir proje"
                  />
                </FormField>
                <FormField label="Not (yalnızca dashboard)" className="sm:col-span-2">
                  <Textarea
                    value={form.adminNotes}
                    onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                    rows={2}
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

                <label className="flex cursor-pointer items-center gap-2 text-sm">
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
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={form.showOnWebsite}
                    onChange={(e) =>
                      setForm({ ...form, showOnWebsite: e.target.checked })
                    }
                  />
                  Web sitesinde göster
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                  />
                  Ana sayfada öne çıkar
                </label>

                {editing?.photos?.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    {editing.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-[3/4] overflow-hidden border border-border"
                      >
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
                        {photo.isCover ? (
                          <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Ana
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white"
                            onClick={() => setPrimary(photo.id)}
                          >
                            Ana fotoğraf yap
                          </button>
                        )}
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
                      <div
                        key={src}
                        className="relative aspect-[3/4] overflow-hidden border border-border"
                      >
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
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
