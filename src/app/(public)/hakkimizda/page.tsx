import Image from "next/image";
import Link from "next/link";
import { settingsRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";

export const metadata = createMetadata({
  title: "Hakkımızda",
  description:
    "+Akademi Oyunculuk & Menajerlik hakkında: profesyonel eğitim, casting, menajerlik ve sektör ağı.",
  path: "/hakkimizda",
});

export default async function AboutPage() {
  const settings = await settingsRepository.get();
  const paragraphs = [...settings.aboutParagraphs].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-bg-warm/50">
        <div className="pointer-events-none absolute -top-8 right-8 h-28 w-28 rotate-12 border border-primary/20" />
        <div className="container-wide py-14 md:py-20">
          <p className="eyebrow">Kurumsal</p>
          <h1 className="font-display title-accent mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            {settings.aboutTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {settings.companyName}
          </p>
        </div>
      </section>

      <section className="section-pad decor-section">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm">
            <div className="pointer-events-none absolute -bottom-4 -left-4 z-10 h-24 w-24 border border-primary/25" />
            <Image
              src={settings.aboutImageUrl}
              alt="+Akademi ofis ve prodüksiyon atmosferi"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="prose-site space-y-5 text-base">
            {settings.aboutVision ? (
              <p className="text-lg font-medium text-ink">{settings.aboutVision}</p>
            ) : null}
            {paragraphs.map((p) => (
              <p key={p.id}>{p.text}</p>
            ))}
            <div className="grid gap-5 pt-4 sm:grid-cols-2">
              {settings.aboutFeatures.map((item) => (
                <div key={item.id} className="border-t border-border pt-4">
                  <h2 className="text-base font-semibold text-ink">{item.title}</h2>
                  <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                </div>
              ))}
            </div>
            <Link href="/basvuru" className="inline-flex cursor-pointer pt-4">
              <Button>Oyuncu Başvurusu</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
