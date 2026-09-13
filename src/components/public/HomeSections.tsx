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
    <section className="relative isolate min-h-[78vh] overflow-hidden bg-bg-deep text-white">
      <Image
        src={imageUrl}
        alt=""
        fill
        priority
        className="object-cover opacity-55"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(122,31,43,0.22),transparent_50%)]" />
      <div className="pointer-events-none absolute top-16 right-10 hidden h-40 w-40 rotate-12 border border-primary/30 md:block" />

      <div className="container-wide relative flex min-h-[78vh] flex-col justify-end pb-16 pt-28 md:pb-20">
        <p className="eyebrow animate-fade-up text-white/55">
          {settings.companyName}
        </p>
        <h1 className="font-display animate-fade-up-delay mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
          {description}
        </p>
        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
          <Link href={ctaLink}>
            <Button size="lg">{ctaText}</Button>
          </Link>
          <Link href="/hizmetler">
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
            >
              Hizmetlerimizi İncele
            </Button>
          </Link>
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
      <div className="container-wide grid grid-cols-2 gap-6 py-10 md:grid-cols-4 md:gap-8 md:py-12">
        {stats.map((stat) => (
          <div key={stat.id}>
            <p className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              {stat.value}
              <span className="text-primary">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutTeaser({ settings }: { settings: SiteSettings }) {
  return (
    <section className="section-pad">
      <div className="container-wide grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm md:aspect-[5/6]">
          <Image
            src={settings.aboutImageUrl}
            alt="+Akademi hakkında"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="eyebrow">Kurumsal</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {settings.aboutTitle}
          </h2>
          <div className="prose-site mt-5 space-y-4 text-base">
            {settings.aboutParagraphs.map((p) => (
            <p key={p.id}>{p.text}</p>
          ))}
          </div>
          <Link href="/hakkimizda" className="mt-7 inline-flex">
            <Button variant="outline">
              Daha fazla <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ settings }: { settings: SiteSettings }) {
  const services = settings.services
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <section className="section-pad relative overflow-hidden bg-bg-warm/60">
      <div className="pointer-events-none absolute -bottom-10 left-8 h-32 w-32 rotate-6 border border-primary/15" />
      <div className="container-wide">
        <div className="max-w-2xl">
          <p className="eyebrow">Hizmetler</p>
          <h2 className="font-display title-accent mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {settings.servicesSectionTitle}
          </h2>
          <p className="mt-3 text-ink-muted">
            Profesyonel eğitimden cast hizmetlerine, menajerlikten prodüksiyon
            desteğine kadar uçtan uca yetenek yönetimi.
          </p>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon =
              icons[service.icon as keyof typeof icons] ?? Clapperboard;
            return (
              <article key={service.id} className="border-t border-border-strong pt-5">
                <Icon className="text-primary" size={22} strokeWidth={1.6} />
                <h3 className="mt-4 text-lg font-semibold text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
        <div className="mt-10">
          <Link href="/hizmetler">
            <Button variant="outline">Tüm hizmetler</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

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
            className="hidden text-sm font-medium text-ink underline-offset-4 hover:underline sm:inline"
          >
            Tümünü gör
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {actors.map((actor) => (
            <Link
              key={actor.id}
              href={`/oyuncular/${actor.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-bg-warm">
                <Image
                  src={actor.coverPhotoUrl}
                  alt={fullName(actor.firstName, actor.lastName)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 50vw, 16vw"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                {fullName(actor.firstName, actor.lastName)}
              </p>
              <p className="text-xs text-ink-muted">
                {actor.city} · {actor.heightCm} cm
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedReferences({ items }: { items: ReferenceProject[] }) {
  if (!items.length) return null;
  return (
    <section className="section-pad bg-bg-deep text-white">
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
            className="hidden text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline sm:inline"
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
                <p className="text-xs tracking-wide text-white/45 uppercase">
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
    <section className="section-pad">
      <div className="container-wide">
        <div className="max-w-2xl">
          <p className="eyebrow">Neden +Akademi</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Güvenilir süreç, profesyonel yaklaşım
          </h2>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {settings.aboutFeatures.map((item) => (
            <article key={item.id} className="border-l-2 border-primary/80 pl-4">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="border-y border-border bg-bg-warm">
      <div className="container-wide flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Kariyerine bir adımla başla
          </h2>
          <p className="mt-3 text-ink-muted">
            Oyuncu, model veya yetenek adayıysan başvurunu birkaç dakikada
            tamamla. Ekibimiz başvurunu değerlendirir.
          </p>
        </div>
        <Link href="/basvuru">
          <Button size="lg">Oyuncu Başvurusu</Button>
        </Link>
      </div>
    </section>
  );
}

export function ContactTeaser({ settings }: { settings: SiteSettings }) {
  return (
    <section className="section-pad">
      <div className="container-wide grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">İletişim</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Ofisimiz İzmir Alsancak&apos;ta
          </h2>
          <address className="mt-6 space-y-1 text-base not-italic text-ink-muted">
            {settings.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            {hasValue(settings.instagram) ? (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Instagram</Button>
              </a>
            ) : null}
            {hasValue(settings.facebook) ? (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Facebook</Button>
              </a>
            ) : null}
            <Link href="/iletisim">
              <Button>İletişim formu</Button>
            </Link>
          </div>
        </div>
        <div className="min-h-64 border border-border bg-[linear-gradient(135deg,#efebe4,#e7e1d6)] p-8">
          <p className="text-sm leading-relaxed text-ink-muted">
            Yapım şirketleri, reklam ajansları ve profesyonel iş ortakları için
            casting ve menajerlik süreçlerinde hızlı iletişim kuruyoruz.
            Detaylı taleplerinizi iletişim formu üzerinden iletebilirsiniz.
          </p>
          {hasValue(settings.googleMapsUrl) ? (
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex text-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              Haritada aç
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
