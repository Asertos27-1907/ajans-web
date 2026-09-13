"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus, RotateCcw } from "lucide-react";
import { actorRepository } from "@/lib/repositories";
import type { Actor, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { GENDER_LABELS } from "@/config/constants";
import { fullName, cn } from "@/lib/utils";

export default function ActorsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Actor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [webFilter, setWebFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      const result = await actorRepository.list({
        search: search || undefined,
        city: city || undefined,
        gender: (gender as Gender) || undefined,
        isActive:
          activeFilter === "" ? undefined : activeFilter === "1",
        showOnWebsite:
          webFilter === "" ? undefined : webFilter === "1",
        isFeatured:
          featuredFilter === "" ? undefined : featuredFilter === "1",
        page: 1,
        pageSize: 60,
      });
      let data = result.data;
      if (ageMin) data = data.filter((a) => a.age >= Number(ageMin));
      if (ageMax) data = data.filter((a) => a.age <= Number(ageMax));
      setItems(data);
      setTotal(data.length);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(items.map((i) => i.city))).sort(),
    [items],
  );

  async function createActor() {
    setCreating(true);
    const actor = await actorRepository.create({
      firstName: "Yeni",
      lastName: "Oyuncu",
      birthDate: "2000-01-01",
      age: 26,
      city: "İzmir",
      gender: "kadin",
      heightCm: 170,
      weightKg: 55,
      hairColor: "Kahverengi",
      eyeColor: "Kahverengi",
      bodySize: "M",
      bio: "Yeni eklenen oyuncu profili.",
      experiences: "",
      projects: "",
      photos: [],
      coverPhotoUrl: "/assets/photos/p01.jpg",
      isActive: true,
      showOnWebsite: false,
      isFeatured: false,
    });
    setCreating(false);
    router.push(`/dashboard/oyuncular/${actor.id}`);
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
    setCity("");
    setGender("");
    setAgeMin("");
    setAgeMax("");
    setActiveFilter("");
    setWebFilter("");
    setFeaturedFilter("");
    setTimeout(() => load(), 0);
  }

  return (
    <div>
      <PageHeader
        title="Oyuncular"
        description={`${total} kayıt`}
        actions={
          <Button size="sm" onClick={createActor} disabled={creating}>
            <Plus size={14} /> Yeni oyuncu
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 rounded border border-border bg-surface p-4 md:grid-cols-3 xl:grid-cols-4">
        <FormField label="Ara (ad / şehir)">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad soyad veya şehir"
          />
        </FormField>
        <FormField label="Şehir">
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Tümü</option>
            {["İzmir", "İstanbul", "Ankara", "Antalya", "Bursa", "Muğla", "Eskişehir", ...cities]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </Select>
        </FormField>
        <FormField label="Cinsiyet">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Tümü</option>
            {Object.entries(GENDER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Yaş min">
          <Input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
        </FormField>
        <FormField label="Yaş max">
          <Input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
        </FormField>
        <FormField label="Durum">
          <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="">Tümü</option>
            <option value="1">Aktif</option>
            <option value="0">Pasif</option>
          </Select>
        </FormField>
        <FormField label="Web görünürlüğü">
          <Select value={webFilter} onChange={(e) => setWebFilter(e.target.value)}>
            <option value="">Tümü</option>
            <option value="1">Webde gösteriliyor</option>
            <option value="0">Gizli</option>
          </Select>
        </FormField>
        <FormField label="Öne çıkan">
          <Select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)}>
            <option value="">Tümü</option>
            <option value="1">Öne çıkan</option>
            <option value="0">Diğer</option>
          </Select>
        </FormField>
        <div className="flex items-end gap-2 md:col-span-3 xl:col-span-4">
          <Button onClick={load}>Filtrele</Button>
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw size={14} /> Temizle
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState title="Oyuncu bulunamadı" description="Filtreleri değiştirmeyi deneyin." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((actor) => (
            <article
              key={actor.id}
              className="group overflow-hidden border border-border bg-surface transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]"
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
                    "absolute top-3 left-3 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-[11px] font-semibold text-white shadow",
                    actor.isActive ? "bg-success" : "bg-danger",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {actor.isActive ? "Aktif" : "Pasif"}
                </button>
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <Link
                    href={`/dashboard/oyuncular/${actor.id}`}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-black/65 text-white hover:bg-primary"
                    aria-label="Görüntüle"
                  >
                    <Eye size={14} />
                  </Link>
                  <Link
                    href={`/dashboard/oyuncular/${actor.id}`}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-black/65 text-white hover:bg-secondary"
                    aria-label="Düzenle"
                  >
                    <Pencil size={14} />
                  </Link>
                </div>
              </div>
              <div className="p-3">
                <Link
                  href={`/dashboard/oyuncular/${actor.id}`}
                  className="cursor-pointer text-sm font-semibold text-ink hover:text-primary"
                >
                  {fullName(actor.firstName, actor.lastName)}
                </Link>
                <p className="mt-1 text-xs text-ink-muted">
                  {actor.city} · {actor.age} · {GENDER_LABELS[actor.gender]}
                </p>
                <p className="mt-1 text-[11px] text-ink-soft">
                  {actor.showOnWebsite ? "Web’de görünür" : "Web’de gizli"}
                  {actor.isFeatured ? " · Öne çıkan" : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
