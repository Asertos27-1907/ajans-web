"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import type { Actor, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/StatusBadge";
import { GENDER_LABELS } from "@/config/constants";
import { fullName } from "@/lib/utils";

type Filters = {
  search: string;
  gender: string;
  city: string;
  hairColor: string;
  eyeColor: string;
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
};

const emptyFilters: Filters = {
  search: "",
  gender: "",
  city: "",
  hairColor: "",
  eyeColor: "",
  ageMin: "",
  ageMax: "",
  heightMin: "",
  heightMax: "",
};

function matches(actor: Actor, f: Filters) {
  const q = f.search.trim().toLocaleLowerCase("tr");
  if (q) {
    const name = fullName(actor.firstName, actor.lastName).toLocaleLowerCase("tr");
    if (!name.includes(q) && !actor.city.toLocaleLowerCase("tr").includes(q)) {
      return false;
    }
  }
  if (f.gender && actor.gender !== f.gender) return false;
  if (f.city.trim()) {
    if (!actor.city.toLocaleLowerCase("tr").includes(f.city.trim().toLocaleLowerCase("tr"))) {
      return false;
    }
  }
  if (f.hairColor.trim()) {
    if (
      !actor.hairColor
        .toLocaleLowerCase("tr")
        .includes(f.hairColor.trim().toLocaleLowerCase("tr"))
    ) {
      return false;
    }
  }
  if (f.eyeColor.trim()) {
    if (
      !actor.eyeColor
        .toLocaleLowerCase("tr")
        .includes(f.eyeColor.trim().toLocaleLowerCase("tr"))
    ) {
      return false;
    }
  }
  const ageMin = f.ageMin ? Number(f.ageMin) : null;
  const ageMax = f.ageMax ? Number(f.ageMax) : null;
  if (ageMin != null && Number.isFinite(ageMin) && actor.age < ageMin) return false;
  if (ageMax != null && Number.isFinite(ageMax) && actor.age > ageMax) return false;
  const heightMin = f.heightMin ? Number(f.heightMin) : null;
  const heightMax = f.heightMax ? Number(f.heightMax) : null;
  if (heightMin != null && Number.isFinite(heightMin)) {
    if (!actor.heightCm || actor.heightCm < heightMin) return false;
  }
  if (heightMax != null && Number.isFinite(heightMax)) {
    if (!actor.heightCm || actor.heightCm > heightMax) return false;
  }
  return true;
}

function FilterFields({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (next: Filters) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FormField label="İsim ara">
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Ad soyad"
        />
      </FormField>
      <FormField label="Cinsiyet">
        <Select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        >
          <option value="">Tümü</option>
          <option value="kadin">Kadın</option>
          <option value="erkek">Erkek</option>
          <option value="diger">Diğer</option>
        </Select>
      </FormField>
      <FormField label="Şehir">
        <Input
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          placeholder="Şehir"
        />
      </FormField>
      <FormField label="Saç rengi">
        <Input
          value={filters.hairColor}
          onChange={(e) => setFilters({ ...filters, hairColor: e.target.value })}
          placeholder="Saç rengi"
        />
      </FormField>
      <FormField label="Göz rengi">
        <Input
          value={filters.eyeColor}
          onChange={(e) => setFilters({ ...filters, eyeColor: e.target.value })}
          placeholder="Göz rengi"
        />
      </FormField>
      <FormField label="Yaş min">
        <Input
          type="number"
          min={0}
          max={120}
          value={filters.ageMin}
          onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
        />
      </FormField>
      <FormField label="Yaş max">
        <Input
          type="number"
          min={0}
          max={120}
          value={filters.ageMax}
          onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
        />
      </FormField>
      <FormField label="Boy min (cm)">
        <Input
          type="number"
          value={filters.heightMin}
          onChange={(e) => setFilters({ ...filters, heightMin: e.target.value })}
        />
      </FormField>
      <FormField label="Boy max (cm)">
        <Input
          type="number"
          value={filters.heightMax}
          onChange={(e) => setFilters({ ...filters, heightMax: e.target.value })}
        />
      </FormField>
    </div>
  );
}

export function ActorsRoster({ actors }: { actors: Actor[] }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(
    () => actors.filter((a) => matches(a, filters)),
    [actors, filters],
  );

  const activeCount = Object.values(filters).filter((v) => v.trim()).length;

  return (
    <div>
      <div className="mb-6 hidden rounded border border-border bg-surface p-4 lg:block">
        <FilterFields filters={filters} setFilters={setFilters} />
        {activeCount > 0 ? (
          <div className="mt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setFilters(emptyFilters)}>
              Filtreleri temizle
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mb-5 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full"
        >
          <Filter size={14} />
          Filtreler{activeCount ? ` (${activeCount})` : ""}
        </Button>
        {mobileOpen ? (
          <div className="mt-3 rounded border border-border bg-surface p-4">
            <FilterFields filters={filters} setFilters={setFilters} />
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setFilters(emptyFilters)}
              >
                Temizle
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                Uygula
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {!filtered.length ? (
        <EmptyState
          title="Oyuncu bulunamadı"
          description={
            actors.length
              ? "Filtreleri değiştirmeyi deneyin."
              : "Yakında yeni profiller eklenecek."
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((actor) => {
            const name = fullName(actor.firstName, actor.lastName);
            const meta = [actor.city, actor.age ? String(actor.age) : ""]
              .filter(Boolean)
              .join(" · ");
            return (
              <Link
                key={actor.id}
                href={`/oyuncular/${actor.slug}`}
                className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-bg-muted">
                  {actor.coverPhotoUrl ? (
                    <Image
                      src={actor.coverPhotoUrl}
                      alt={`${name} - +Akademi oyuncusu`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <p className="text-sm font-medium tracking-wide text-white md:text-base">
                      {name}
                    </p>
                    {meta ? (
                      <p className="mt-0.5 text-xs text-white/75">{meta}</p>
                    ) : (
                      <p className="mt-0.5 text-xs text-white/75">
                        {GENDER_LABELS[actor.gender as Gender] || "Oyuncu"}
                      </p>
                    )}
                    <span className="mt-2 inline-block text-[11px] font-medium tracking-wider text-white/0 uppercase transition group-hover:text-white/90">
                      Profili Gör
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
