"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Plus, RotateCcw, X } from "lucide-react";
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
  coverPhotoUrl: "/assets/actor-01.jpg",
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
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      const result = await actorRepository.list({
        search: search || undefined,
        gender: (gender as Gender) || undefined,
        isActive: status === "" ? undefined : status === "1",
        page: 1,
        pageSize: 60,
      });
      setItems(result.data);
      setTotal(result.total);
      setLoading(false);
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
      coverPhotoUrl: actor.coverPhotoUrl,
    });
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  async function save() {
    setSaving(true);
    const age = form.birthDate ? calcAge(form.birthDate) : 0;
    const payload = {
      firstName: form.firstName.trim() || "Yeni",
      lastName: form.lastName.trim() || "Oyuncu",
      phone: form.phone.trim() || undefined,
      birthDate: form.birthDate || "2000-01-01",
      age,
      gender: form.gender,
      city: form.city.trim() || "İzmir",
      heightCm: Number(form.heightCm) || undefined,
      weightKg: Number(form.weightKg) || undefined,
      experience: form.experience.trim(),
      isActive: form.isActive,
      coverPhotoUrl: form.coverPhotoUrl,
    };

    if (editing) {
      const updated = await actorRepository.update(editing.id, {
        ...payload,
        photos: editing.photos.length
          ? editing.photos.map((p, i) =>
              i === 0 ? { ...p, url: form.coverPhotoUrl, thumbnailUrl: form.coverPhotoUrl } : p,
            )
          : [
              {
                id: `${editing.id}-1`,
                actorId: editing.id,
                url: form.coverPhotoUrl,
                thumbnailUrl: form.coverPhotoUrl,
                alt: fullName(payload.firstName, payload.lastName),
                isCover: true,
                sortOrder: 1,
              },
            ],
      });
      if (updated) {
        setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } else {
      const actor = await actorRepository.create({
        ...payload,
        photos: [
          {
            id: `new-1`,
            actorId: "",
            url: form.coverPhotoUrl,
            thumbnailUrl: form.coverPhotoUrl,
            alt: fullName(payload.firstName, payload.lastName),
            isCover: true,
            sortOrder: 1,
          },
        ],
        showOnWebsite: false,
        isFeatured: false,
      });
      setItems((prev) => [actor, ...prev]);
      setTotal((t) => t + 1);
    }
    setSaving(false);
    closeModal();
  }

  async function toggleActive(actor: Actor, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const updated = await actorRepository.update(actor.id, {
      isActive: !actor.isActive,
    });
    if (updated) {
      setItems((prev) => prev.map((a) => (a.id === actor.id ? updated : a)));
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
                  <Image
                    src={actor.coverPhotoUrl}
                    alt={fullName(actor.firstName, actor.lastName)}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
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
                <FormField label="Kapak fotoğrafı URL" className="sm:col-span-2">
                  <Input
                    value={form.coverPhotoUrl}
                    onChange={(e) =>
                      setForm({ ...form, coverPhotoUrl: e.target.value })
                    }
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
                {form.coverPhotoUrl ? (
                  <div className="relative aspect-[3/4] max-w-[160px] overflow-hidden border border-border sm:col-span-2">
                    <Image
                      src={form.coverPhotoUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
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
