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
import { settingsRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";

export const metadata = createMetadata({
  title: "Hizmetler",
  description:
    "Oyunculuk eğitimi, ajans, model, prodüksiyon, menajerlik ve cast hizmetleri.",
  path: "/hizmetler",
});

const icons = {
  GraduationCap,
  Drama,
  Sparkles,
  Film,
  Briefcase,
  Clapperboard,
} as const;

const FALLBACK_IMAGES = [
  "/assets/services-edu.jpg",
  "/assets/photos/p02.jpg",
  "/assets/photos/p08.jpg",
  "/assets/services-prod.jpg",
  "/assets/photos/p12.jpg",
  "/assets/services-cast.jpg",
];

export default async function ServicesPage() {
  const settings = await settingsRepository.get();
  const services = settings.services
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-secondary text-white">
        <div className="pointer-events-none absolute top-10 right-[12%] h-20 w-20 rotate-6 border border-white/15" />
        <div className="container-wide py-14 md:py-20">
          <p className="eyebrow text-white/50">Hizmetler</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            {settings.servicesSectionTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Profesyonel eğitim, geniş sektör ağı ve kariyer desteğiyle yetenekleri
            prodüksiyon dünyasıyla buluşturuyoruz.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide space-y-10">
          {services.map((service, idx) => {
            const Icon = icons[service.icon as keyof typeof icons] ?? Clapperboard;
            const image =
              service.imageUrl ?? FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
            const reverse = idx % 2 === 1;
            return (
              <article
                key={service.id}
                className={`grid items-center gap-6 overflow-hidden border border-border bg-surface lg:grid-cols-2 ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[16/11] bg-bg-muted">
                  <Image
                    src={image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 md:p-10">
                  <Icon className="text-primary" size={26} strokeWidth={1.6} />
                  <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-ink-muted">
                    {service.description}
                  </p>
                </div>
              </article>
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
