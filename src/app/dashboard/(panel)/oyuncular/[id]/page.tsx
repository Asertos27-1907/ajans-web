"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { actorRepository } from "@/lib/repositories";
import type { Actor } from "@/types";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/StatusBadge";
import { GENDER_LABELS } from "@/config/constants";
import { formatDateTR, fullName } from "@/lib/utils";

export default function ActorDetailPage() {
  const params = useParams<{ id: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await actorRepository.getById(params.id);
      setActor(data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="skeleton h-64 rounded" />;
  if (!actor) return <p>Oyuncu bulunamadı.</p>;

  const rows: [string, string | number | undefined][] = [
    ["Telefon", actor.phone],
    ["Doğum tarihi", actor.birthDate],
    ["Yaş", actor.age],
    ["Cinsiyet", GENDER_LABELS[actor.gender]],
    ["Şehir", actor.city],
    ["Boy", actor.heightCm ? `${actor.heightCm} cm` : undefined],
    ["Kilo", actor.weightKg ? `${actor.weightKg} kg` : undefined],
    ["Durum", actor.isActive ? "Aktif" : "Pasif"],
  ];

  return (
    <div>
      <PageHeader
        title={fullName(actor.firstName, actor.lastName)}
        description={`Oyuncu detayı · ${formatDateTR(actor.updatedAt)}`}
        actions={
          <Link href="/dashboard/oyuncular">
            <Button variant="outline" size="sm">
              Listeye dön
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden border border-border bg-bg-muted">
          <Image
            src={actor.coverPhotoUrl}
            alt={fullName(actor.firstName, actor.lastName)}
            fill
            className="object-cover"
            sizes="280px"
            priority
            unoptimized
          />
        </div>
        <div className="space-y-6">
          <section className="border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
              Bilgiler
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {rows
                .filter(([, v]) => v !== undefined && v !== "" && v !== null)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
          {actor.experience ? (
            <section className="border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
                Deneyim
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {actor.experience}
              </p>
            </section>
          ) : null}
          {actor.photos.length > 0 ? (
            <section className="border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold tracking-wide text-secondary uppercase">
                Fotoğraflar
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {actor.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-[3/4] overflow-hidden bg-bg-muted"
                  >
                    <Image
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
