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

const FEATURE_IMAGES = [
  "/assets/services-edu.jpg",
  "/assets/services-cast.jpg",
  "/assets/photos/p10.jpg",
  "/assets/about-editorial.jpg",
];

export default async function AboutPage() {
  const settings = await settingsRepository.get();
  const paragraphs = [...settings.aboutParagraphs].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div>
      <section className="relative min-h-[48vh] overflow-hidden bg-bg-deep text-white">
        <Image
          src="/assets/about-editorial.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-secondary/50 to-transparent" />
        <div className="container-wide relative flex min-h-[48vh] flex-col justify-end py-16 md:py-20">
          <p className="eyebrow text-white/55">Kurumsal</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            {settings.aboutTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            {settings.companyName}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="frame-corner relative aspect-[4/5] overflow-hidden bg-bg-muted lg:col-span-5">
            <Image
              src={settings.aboutImageUrl}
              alt="+Akademi ofis ve prodüksiyon atmosferi"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 42vw"
              priority
            />
          </div>
          <div className="lg:col-span-7">
            {settings.aboutVision ? (
              <p className="font-display text-2xl leading-snug font-medium tracking-tight text-ink md:text-3xl">
                {settings.aboutVision}
              </p>
            ) : null}
            <div className="prose-site mt-8 space-y-5 text-base">
              {paragraphs.map((p) => (
                <p key={p.id}>{p.text}</p>
              ))}
            </div>
            <Link href="/basvuru" className="mt-8 inline-flex cursor-pointer">
              <Button>Oyuncu Başvurusu</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad bg-bg-muted">
        <div className="container-wide">
          <p className="eyebrow">Yaklaşımımız</p>
          <h2 className="font-display title-accent mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Vizyon ve değerler
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {settings.aboutFeatures.map((item, idx) => (
              <article
                key={item.id}
                className="group overflow-hidden bg-surface"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={FEATURE_IMAGES[idx % FEATURE_IMAGES.length]}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 font-display text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="p-5 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
