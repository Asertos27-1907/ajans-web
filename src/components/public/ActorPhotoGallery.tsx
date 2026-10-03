"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Actor, ActorPhoto } from "@/types";
import { fullName, cn } from "@/lib/utils";

export function ActorPhotoGallery({ actor }: { actor: Actor }) {
  const photos = actor.photos.filter((p) => p.url);
  const [active, setActive] = useState<ActorPhoto | null>(null);
  const name = fullName(actor.firstName, actor.lastName);
  const cover = photos.find((p) => p.isCover) || photos[0];

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!cover) {
    return (
      <div className="aspect-[3/4] bg-bg-muted" aria-hidden />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setActive(cover)}
        className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`${name} fotoğrafını büyüt`}
      >
        <Image
          src={cover.url}
          alt={`${name} - +Akademi oyuncusu`}
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 40vw"
          priority
        />
      </button>

      {photos.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(photo)}
              className={cn(
                "relative aspect-square cursor-pointer overflow-hidden bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                photo.id === cover.id ? "ring-1 ring-primary" : "",
              )}
              aria-label={`${name} galeri fotoğrafı`}
            >
              <Image
                src={photo.thumbnailUrl || photo.url}
                alt={photo.alt || `${name} - +Akademi oyuncusu`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      ) : null}

      {active ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt || `${name} - +Akademi oyuncusu`}
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
