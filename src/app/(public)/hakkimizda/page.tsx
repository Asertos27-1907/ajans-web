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

  return (
    <div>
      <section className="border-b border-border bg-bg-warm/50">
        <div className="container-wide py-14 md:py-20">
          <p className="eyebrow">Kurumsal</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            {settings.aboutTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {settings.fullName}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm">
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
            <p>{settings.aboutContent}</p>
            <p>
              Amacımız; adaylara güven veren bir başvuru deneyimi sunmak ve iş
              ortaklarına kurumsal, düzenli ve profesyonel bir casting /
              menajerlik yapısı sağlamaktır.
            </p>
            <div className="grid gap-5 pt-4 sm:grid-cols-2">
              {settings.whyUs.map((item) => (
                <div key={item.title} className="border-t border-border pt-4">
                  <h2 className="text-base font-semibold text-ink">{item.title}</h2>
                  <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                </div>
              ))}
            </div>
            <Link href="/basvuru" className="inline-flex pt-4">
              <Button>Oyuncu Başvurusu</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
