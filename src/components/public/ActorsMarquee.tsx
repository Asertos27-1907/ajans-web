"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Actor } from "@/types";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { fullName, cn } from "@/lib/utils";

export function ActorsMarqueeSection({ actors }: { actors: Actor[] }) {
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!actors.length) return null;

  const loop = [...actors, ...actors];

  return (
    <section className="section-pad overflow-hidden border-y border-border bg-bg">
      <div className="container-wide">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Portföy</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              OYUNCULARIMIZ
            </h2>
            <p className="mt-3 text-ink-muted">
              Sahnenin ve kameranın yeni yüzlerini keşfedin.
            </p>
          </div>
        </Reveal>
      </div>

      <div
        className="relative mt-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={cn(
            "flex w-max gap-4 px-4 md:gap-5",
            !reduceMotion && "actors-marquee",
            paused && !reduceMotion && "actors-marquee-paused",
          )}
        >
          {loop.map((actor, i) => {
            const name = fullName(actor.firstName, actor.lastName);
            return (
              <Link
                key={`${actor.id}-${i}`}
                href={`/oyuncular/${actor.slug}`}
                className="group relative w-[42vw] shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-[28vw] md:w-[18vw] lg:w-[14vw]"
                tabIndex={i >= actors.length ? -1 : 0}
                aria-hidden={i >= actors.length ? true : undefined}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-bg-muted">
                  {actor.coverPhotoUrl ? (
                    <Image
                      src={actor.coverPhotoUrl}
                      alt={`${name} - +Akademi oyuncusu`}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width:640px) 42vw, (max-width:1024px) 28vw, 14vw"
                      priority={i < 4}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition group-hover:opacity-95" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-sm font-medium tracking-wide text-white">
                      {name}
                    </p>
                    <p className="text-[11px] tracking-wider text-white/70 uppercase">
                      Oyuncu
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="container-wide mt-10 flex justify-center">
        <Link href="/oyuncular">
          <Button variant="outline">
            TÜM OYUNCULARI GÖR →
          </Button>
        </Link>
      </div>
    </section>
  );
}
