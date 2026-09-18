import Image from "next/image";
import Link from "next/link";
import { getMergedSiteSettings } from "@/lib/settings/service";
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
  const settings = await getMergedSiteSettings();

  return (
    <div>
      <section className="relative min-h-[48vh] overflow-hidden bg-bg-deep text-white">
        <Image
          src={SITE_IMAGES.about.main}
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
            Hakkımızda
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            {settings.companyName}
          </p>
        </div>
      </section>

      <AboutSections aboutImageUrl={settings.aboutImageUrl || SITE_IMAGES.about.main} />

      <section className="border-t border-border bg-primary-soft">
        <div className="container-wide flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Yolculuğuna bizimle başla
            </h2>
            <p className="mt-2 text-ink-muted">
              Kısa ön kayıt formunu doldur; uygun adaylarla telefon üzerinden
              iletişime geçilir.
            </p>
          </div>
          <Link href="/basvuru" className="inline-flex cursor-pointer">
            <Button size="lg">Oyuncu Başvurusu</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
