"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { actorRepository } from "@/lib/repositories";
import type { Actor, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/StatusBadge";
import { GENDER_LABELS } from "@/config/constants";
import { calcAge, fullName } from "@/lib/utils";

export default function ActorEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await actorRepository.getById(params.id);
      setActor(data);
      setLoading(false);
    });
  }, [params.id]);

  async function save() {
    if (!actor) return;
    setSaving(true);
    const age = actor.birthDate ? calcAge(actor.birthDate) : actor.age;
    await actorRepository.update(actor.id, { ...actor, age });
    setSaving(false);
  }

  async function remove() {
    if (!actor) return;
    if (!confirm("Oyuncu silinsin mi?")) return;
    await actorRepository.remove(actor.id);
    router.push("/dashboard/oyuncular");
  }

  if (loading) return <div className="skeleton h-64 rounded" />;
  if (!actor) return <p>Oyuncu bulunamadı.</p>;

  function set<K extends keyof Actor>(key: K, value: Actor[K]) {
    setActor((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div>
      <PageHeader
        title={fullName(actor.firstName, actor.lastName)}
        description="Oyuncu düzenle"
        actions={
          <>
            <Button variant="danger" size="sm" onClick={remove}>
              Sil
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden rounded border border-border bg-bg-warm">
          <Image src={actor.coverPhotoUrl} alt="" fill className="object-cover" sizes="240px" />
        </div>
        <div className="grid gap-4 rounded border border-border bg-surface p-5 sm:grid-cols-2">
          <FormField label="Ad">
            <Input value={actor.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </FormField>
          <FormField label="Soyad">
            <Input value={actor.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </FormField>
          <FormField label="Doğum tarihi">
            <Input type="date" value={actor.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </FormField>
          <FormField label="Şehir">
            <Input value={actor.city} onChange={(e) => set("city", e.target.value)} />
          </FormField>
          <FormField label="Cinsiyet">
            <Select
              value={actor.gender}
              onChange={(e) => set("gender", e.target.value as Gender)}
            >
              {Object.entries(GENDER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Boy">
            <Input type="number" value={actor.heightCm} onChange={(e) => set("heightCm", Number(e.target.value))} />
          </FormField>
          <FormField label="Kilo">
            <Input type="number" value={actor.weightKg} onChange={(e) => set("weightKg", Number(e.target.value))} />
          </FormField>
          <FormField label="Saç">
            <Input value={actor.hairColor} onChange={(e) => set("hairColor", e.target.value)} />
          </FormField>
          <FormField label="Göz">
            <Input value={actor.eyeColor} onChange={(e) => set("eyeColor", e.target.value)} />
          </FormField>
          <FormField label="Beden">
            <Input value={actor.bodySize} onChange={(e) => set("bodySize", e.target.value)} />
          </FormField>
          <FormField label="Telefon">
            <Input value={actor.phone || ""} onChange={(e) => set("phone", e.target.value)} />
          </FormField>
          <FormField label="E-posta">
            <Input value={actor.email || ""} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="Kapak görseli URL" className="sm:col-span-2">
            <Input value={actor.coverPhotoUrl} onChange={(e) => set("coverPhotoUrl", e.target.value)} />
          </FormField>
          <FormField label="Biyografi" className="sm:col-span-2">
            <Textarea value={actor.bio} onChange={(e) => set("bio", e.target.value)} />
          </FormField>
          <FormField label="Deneyimler" className="sm:col-span-2">
            <Textarea value={actor.experiences} onChange={(e) => set("experiences", e.target.value)} />
          </FormField>
          <FormField label="Projeler" className="sm:col-span-2">
            <Textarea value={actor.projects} onChange={(e) => set("projects", e.target.value)} />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={actor.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Aktif
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={actor.showOnWebsite} onChange={(e) => set("showOnWebsite", e.target.checked)} />
            Web sitesinde göster
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={actor.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
            Öne çıkar
          </label>
        </div>
      </div>
      <Link href="/dashboard/oyuncular" className="mt-4 inline-block text-sm text-ink-muted hover:text-ink">
        ← Listeye dön
      </Link>
    </div>
  );
}
