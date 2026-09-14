"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Clapperboard,
  Drama,
  Film,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SERVICE_IMAGE_FALLBACKS } from "@/config/site-images";
import type { SiteSettings } from "@/types";

const icons = {
  GraduationCap,
  Drama,
  Sparkles,
  Film,
  Briefcase,
  Clapperboard,
} as const;

export function ServicesPageContent({ settings }: { settings: SiteSettings }) {
  const services = settings.services
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-secondary text-white">
        <div className="pointer-events-none absolute top-10 right-[12%] h-20 w-20 rotate-6 border border-white/15" />
        <div className="container-wide py-14 md:py-20">
          <Reveal direction="up">
            <p className="eyebrow text-white/50">Hizmetler</p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              {settings.servicesSectionTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/70">
              Eğitimden casting süreçlerine, menajerlikten prodüksiyon
              desteğine kadar profesyonel yetenek yönetimi.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide space-y-10">
          {services.map((service, idx) => {
            const Icon = icons[service.icon as keyof typeof icons] ?? Clapperboard;
            const image =
              service.imageUrl ??
              SERVICE_IMAGE_FALLBACKS[idx % SERVICE_IMAGE_FALLBACKS.length];
            const reverse = idx % 2 === 1;
            return (
              <Reveal key={service.id} direction={reverse ? "right" : "left"} delay={0.04}>
                <article
                  className={`group grid items-center gap-6 overflow-hidden border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[var(--shadow-soft)] lg:grid-cols-2 ${
                    reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-bg-muted">
                    <Image
                      src={image}
                      alt={service.title}
                      fill
                      className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width:1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="border-l-2 border-transparent p-6 transition duration-300 group-hover:border-primary md:p-10">
                    <Icon className="text-primary" size={26} strokeWidth={1.6} />
                    <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                      {service.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-ink-muted">
                      {service.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="container-wide mt-12">
          <Link href="/basvuru" className="inline-flex cursor-pointer">
            <Button size="lg">Oyuncu Başvurusu</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
