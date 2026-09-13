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

export default async function ServicesPage() {
  const settings = await settingsRepository.get();
  const services = settings.services
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <section className="border-b border-border bg-bg-warm/50">
        <div className="container-wide py-14 md:py-20">
          <p className="eyebrow">Hizmetler</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Faaliyet alanlarımız
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Profesyonel eğitim, geniş sektör ağı ve kariyer desteğiyle yetenekleri
            prodüksiyon dünyasıyla buluşturuyoruz.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid gap-8 md:grid-cols-2">
          {services.map((service) => {
            const Icon = icons[service.icon as keyof typeof icons] ?? Clapperboard;
            return (
              <article
                key={service.id}
                className="border border-border bg-surface p-7 md:p-8"
              >
                <Icon className="text-accent" size={24} strokeWidth={1.6} />
                <h2 className="mt-5 text-xl font-semibold">{service.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
        <div className="container-wide mt-12">
          <Link href="/basvuru">
            <Button size="lg">Oyuncu Başvurusu</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
