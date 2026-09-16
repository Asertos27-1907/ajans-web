"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Clapperboard,
  Drama,
  Film,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/public/BrandLogo";
import {
  FloatDecor,
  HeroImageMotion,
  HeroMotion,
  Reveal,
  Stagger,
} from "@/components/motion/Reveal";
import { SERVICE_IMAGE_FALLBACKS } from "@/config/site-images";
import { fullName, hasValue } from "@/lib/utils";
import type { Actor, ReferenceProject, SiteSettings } from "@/types";
import { CATEGORY_LABELS } from "@/config/constants";

const icons = {
  GraduationCap,
  Drama,
  Sparkles,
  Film,
  Briefcase,
  Clapperboard,
} as const;

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const slide =
    [...settings.slides]
      .filter((s) => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;
  const title = slide?.title ?? settings.heroTitle;
  const description = slide?.description ?? settings.heroDescription;
  const imageUrl = slide?.imageUrl ?? settings.heroImageUrl;
  const ctaText = slide?.buttonText ?? settings.ctaText;
  const ctaLink = slide?.buttonLink ?? settings.ctaLink;

  return (
    <section className="relative isolate min-h-[min(88vh,920px)] overflow-hidden bg-bg-deep text-white">
      <HeroImageMotion className="absolute inset-0">
        <Image
          src={imageUrl}
          alt="+Akademi stüdyo ve prodüksiyon atmosferi"
          fill
          priority
          className="object-cover object-[center_28%] sm:object-[center_32%] md:object-center"
          sizes="100vw"
        />
      </HeroImageMotion>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

      <div className="pointer-events-none absolute inset-3 border border-white/10 sm:inset-6 md:inset-10" />
      <div className="pointer-events-none absolute top-10 left-10 hidden h-16 w-16 border-t border-l border-primary/50 md:block" />
      <div className="pointer-events-none absolute right-10 bottom-10 hidden h-16 w-16 border-r border-b border-white/25 md:block" />

      <div className="container-wide relative flex min-h-[min(88vh,920px)] flex-col justify-end pb-12 pt-24 sm:pb-16 sm:pt-28 md:justify-center md:pb-24 md:pt-32">
        <div className="max-w-3xl min-w-0">
          <HeroMotion
            delay={0.05}
            direction="none"
            className="mb-5 inline-flex sm:mb-6"
          >
            <span className="drop-shadow-[0_6px_28px_rgba(0,0,0,0.55)] [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.35))]">
              <BrandLogo variant="hero" href={null} priority />
            </span>
          </HeroMotion>
          <HeroMotion delay={0.12} direction="left">
            <p className="eyebrow text-white/60">
              {settings.agencyName || settings.companyName}
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-[clamp(1.65rem,6.4vw,4.5rem)] leading-[1.1] font-semibold tracking-tight break-words sm:mt-4 sm:leading-[1.05]">
              {title}
            </h1>
          </HeroMotion>
          <HeroMotion delay={0.26} direction="up">
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/78 sm:mt-5 sm:text-base md:text-lg">
              {description}
            </p>
          </HeroMotion>
          <HeroMotion
            delay={0.38}
            direction="up"
            className="mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap"
          >
            <Link href={ctaLink} className="w-full sm:w-auto">
              <Button size="lg" className="min-h-11 w-full sm:w-auto">
                {ctaText}
              </Button>
            </Link>
            <Link href="/hizmetler" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="min-h-11 w-full cursor-pointer border border-white/10 sm:w-auto"
              >
                Hizmetlerimizi Keşfedin
              </Button>
            </Link>
          </HeroMotion>
        </div>
      </div>
    </section>
  );
}

export function StatsSection({ settings }: { settings: SiteSettings }) {
  const stats = settings.stats.filter((s) => s.isActive);
  if (!stats.length) return null;
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-wide">
        <Stagger className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4 md:gap-8 md:py-12" direction="scale">
          {stats.map((stat) => (
            <div key={stat.id}>
              <p className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function AboutTeaser({ settings }: { settings: SiteSettings }) {
  return (
    <section className="section-pad decor-geo decor-float">
      <div className="container-wide grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal
          direction="left"
          className="frame-corner relative aspect-[5/4] overflow-hidden bg-bg-muted sm:aspect-[4/5] lg:col-span-5"
        >
          <Image
            src={settings.aboutImageUrl}
            alt="+Akademi hakkında"
            fill
            className="object-cover object-center transition duration-700 hover:scale-[1.03]"
            sizes="(max-width:1024px) 100vw, 42vw"
          />
        </Reveal>
        <Reveal direction="up" delay={0.08} className="min-w-0 lg:col-span-7">
          <p className="eyebrow">Hakkımızda</p>
          <h2 className="font-display title-accent mt-3 text-[clamp(1.5rem,5.5vw,3rem)] font-semibold tracking-tight">
            {settings.aboutTitle}
          </h2>
          {settings.aboutVision ? (
            <p className="mt-4 text-base leading-relaxed text-ink sm:mt-5 sm:text-lg md:text-xl">
              {settings.aboutVision}
            </p>
          ) : null}
          <div className="prose-site mt-5 space-y-4 text-base">
            {settings.aboutParagraphs.map((p) => (
              <p key={p.id}>{p.text}</p>
            ))}
          </div>
          <Link href="/hakkimizda" className="mt-8 inline-flex">
            <Button variant="outline" className="min-h-11">
              Daha fazla <ArrowRight size={16} />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function ServicesSection({ settings }: { settings: SiteSettings }) {
  const services = settings.services
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <section className="section-pad relative overflow-hidden bg-bg-muted">
      <FloatDecor className="bottom-8 left-6 h-28 w-28 rotate-6 border border-secondary/20 opacity-70" />
      <div className="container-wide">
        <Reveal direction="up" className="max-w-2xl min-w-0">
          <p className="eyebrow">Hizmetler</p>
          <h2 className="font-display title-accent mt-3 text-[clamp(1.5rem,5.5vw,2.25rem)] font-semibold tracking-tight">
            {settings.servicesSectionTitle}
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Eğitimden casting süreçlerine, menajerlikten prodüksiyon desteğine
            kadar profesyonel yetenek yönetimi.
          </p>
        </Reveal>
        <Stagger className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => {
            const Icon =
              icons[service.icon as keyof typeof icons] ?? Clapperboard;
            const image =
              service.imageUrl ??
              SERVICE_IMAGE_FALLBACKS[idx % SERVICE_IMAGE_FALLBACKS.length];
            return (
              <article
                key={service.id}
                className="group border border-transparent border-t border-border-strong bg-surface pt-0 shadow-none transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={image}
                    alt={service.title}
                    fill
                    className="object-cover object-center transition duration-300 group-hover:scale-[1.04]"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/20 to-transparent" />
                </div>
                <div className="border-l-2 border-transparent p-5 transition duration-300 group-hover:border-primary sm:p-6">
                  <Icon className="text-primary" size={22} strokeWidth={1.6} />
                  <h3 className="mt-4 text-base font-semibold text-ink sm:text-lg">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {service.description}
                  </p>
                </div>
              </article>
            );
          })}
        </Stagger>
        <Reveal delay={0.1} className="mt-10">
          <Link href="/hizmetler">
            <Button variant="outline" className="min-h-11">
              Tüm hizmetler
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** Kept for later re-enable when public talent roster is ready. */
export function FeaturedActors({ actors }: { actors: Actor[] }) {
  if (!actors.length) return null;
  return (
    <section className="section-pad">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Oyuncular</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Öne çıkan yetenekler
            </h2>
          </div>
          <Link
            href="/oyuncular"
            className="hidden cursor-pointer text-sm font-medium text-ink underline-offset-4 hover:text-primary hover:underline sm:inline"
          >
            Tümünü gör
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {actors.map((actor) => (
            <Link
              key={actor.id}
              href={`/oyuncular/${actor.slug}`}
              className="group block cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-bg-muted">
                <Image
                  src={actor.coverPhotoUrl}
                  alt={fullName(actor.firstName, actor.lastName)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 50vw, 16vw"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-ink group-hover:text-primary">
                {fullName(actor.firstName, actor.lastName)}
              </p>
              <p className="text-xs text-ink-muted">
                {actor.city} · {actor.age}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Kept for later re-enable when public references are ready. */
export function FeaturedReferences({ items }: { items: ReferenceProject[] }) {
  if (!items.length) return null;
  return (
    <section className="section-pad petrol-band">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-white/45">Referanslar</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Seçilmiş projeler
            </h2>
          </div>
          <Link
            href="/referanslar"
            className="hidden cursor-pointer text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline sm:inline"
          >
            Tüm referanslar
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <article key={item.id} className="group overflow-hidden bg-white/5">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <p className="text-xs tracking-wide text-primary-soft/80 uppercase">
                  {CATEGORY_LABELS[item.category]} · {item.year}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/65">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhySection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="section-pad relative overflow-hidden">
      <FloatDecor className="-right-4 top-16 h-24 w-24 border border-primary/15 opacity-60" />
      <div className="container-wide">
        <Reveal direction="up" className="max-w-2xl min-w-0">
          <p className="eyebrow">Neden +Akademi</p>
          <h2 className="font-display mt-3 text-[clamp(1.5rem,5.5vw,2.25rem)] font-semibold tracking-tight">
            Güvenilir süreç, profesyonel yaklaşım
          </h2>
        </Reveal>
        <Stagger className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {settings.aboutFeatures.map((item) => (
            <article key={item.id} className="border-l-2 border-primary pl-4">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </article>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <Reveal as="section" direction="up" className="relative overflow-hidden border-y border-border bg-primary-soft">
      <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rotate-12 border border-primary/15" />
      <div className="container-wide flex flex-col items-start justify-between gap-6 py-12 sm:py-14 md:flex-row md:items-center">
        <div className="max-w-xl min-w-0">
          <h2 className="font-display text-[clamp(1.5rem,5.5vw,1.875rem)] font-semibold tracking-tight">
            Kariyerine bir adımla başla
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Oyuncu, model veya yetenek adayıysan kısa ön kayıt formunu doldur.
            Uygun adaylarla telefon üzerinden iletişime geçilir.
          </p>
        </div>
        <Link href="/basvuru" className="w-full sm:w-auto">
          <Button size="lg" className="min-h-11 w-full sm:w-auto">
            Oyuncu Başvurusu
          </Button>
        </Link>
      </div>
    </Reveal>
  );
}

export function ContactTeaser({ settings }: { settings: SiteSettings }) {
  return (
    <section className="section-pad">
      <div className="container-wide grid gap-8 sm:gap-10 lg:grid-cols-2">
        <Reveal direction="left" className="min-w-0">
          <p className="eyebrow">İletişim</p>
          <h2 className="font-display mt-3 text-[clamp(1.5rem,5.5vw,2.25rem)] font-semibold tracking-tight">
            Ofisimiz İzmir Alsancak&apos;ta
          </h2>
          <address className="mt-6 space-y-1 text-sm not-italic text-ink-muted sm:text-base">
            {settings.addressLines.map((line) => (
              <p key={line} className="break-words">
                {line}
              </p>
            ))}
          </address>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {hasValue(settings.instagram) ? (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" className="min-h-11 w-full sm:w-auto">
                  Instagram
                </Button>
              </a>
            ) : null}
            {hasValue(settings.facebook) ? (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" className="min-h-11 w-full sm:w-auto">
                  Facebook
                </Button>
              </a>
            ) : null}
            <Link href="/iletisim" className="w-full sm:w-auto">
              <Button className="min-h-11 w-full sm:w-auto">İletişim formu</Button>
            </Link>
          </div>
        </Reveal>
        <Reveal
          direction="right"
          delay={0.08}
          className="relative min-h-56 overflow-hidden bg-secondary p-6 text-white sm:min-h-64 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rotate-12 border border-white/15" />
          <p className="relative text-sm leading-relaxed text-white/75">
            Yapım şirketleri, reklam ajansları ve profesyonel iş ortakları için
            casting ve menajerlik süreçlerinde hızlı iletişim kuruyoruz.
            Detaylı taleplerinizi iletişim formu üzerinden iletebilirsiniz.
          </p>
          {hasValue(settings.googleMapsUrl) ? (
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-6 inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-white underline-offset-4 hover:underline"
            >
              Haritada aç
            </a>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
