import Image from "next/image";
import Link from "next/link";
import { settingsRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { SITE_IMAGES } from "@/config/site-images";
import { AboutSections } from "@/components/public/AboutSections";

export const metadata = createMetadata({
  title: "Hakkımızda",
  description:
    "+Akademi; oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarını aynı çatı altında buluşturan profesyonel oluşum.",
  path: "/hakkimizda",
  image: SITE_IMAGES.about.main,
});

export default async function AboutPage() {
  const settings = await settingsRepository.get();

  return (
    <div>
      <section className="relative min-h-[38svh] overflow-hidden bg-bg-deep text-white sm:min-h-[42vh] md:min-h-[48vh]">
        <Image
          src={SITE_IMAGES.about.main}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-secondary/50 to-transparent" />
        <div className="container-wide relative flex min-h-[38svh] flex-col justify-end py-12 sm:min-h-[42vh] sm:py-16 md:min-h-[48vh] md:py-20">
          <p className="eyebrow text-white/55">Kurumsal</p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2rem,7vw,3.75rem)] font-semibold tracking-tight break-words">
            Hakkımızda
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/75 sm:text-lg">
            {settings.companyName}
          </p>
        </div>
      </section>

      <AboutSections aboutImageUrl={settings.aboutImageUrl || SITE_IMAGES.about.main} />

      <section className="border-t border-border bg-primary-soft">
        <div className="container-wide flex flex-col items-stretch justify-between gap-5 py-10 sm:gap-6 sm:py-12 md:flex-row md:items-center">
          <div className="max-w-xl min-w-0">
            <h2 className="font-display text-[clamp(1.35rem,4vw,1.875rem)] font-semibold tracking-tight break-words">
              Yolculuğuna bizimle başla
            </h2>
            <p className="mt-2 text-ink-muted">
              Kısa ön kayıt formunu doldur; uygun adaylarla telefon üzerinden
              iletişime geçilir.
            </p>
          </div>
          <Link href="/basvuru" className="inline-flex w-full cursor-pointer md:w-auto">
            <Button size="lg" className="w-full md:w-auto">
              Oyuncu Başvurusu
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
