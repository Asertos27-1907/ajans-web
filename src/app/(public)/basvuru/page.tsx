import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { settingsRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Oyuncu Başvurusu",
  description:
    "+Akademi kısa oyuncu ön kayıt formu. Temel bilgilerinizi ve fotoğraflarınızı gönderin.",
  path: "/basvuru",
});

export default async function ApplicationPage() {
  const settings = await settingsRepository.get();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-secondary text-white">
        <div className="pointer-events-none absolute top-8 right-10 h-24 w-24 rotate-12 border border-white/15" />
        <div className="container-site py-12 md:py-16">
          <p className="eyebrow text-white/55">Ön kayıt</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Oyuncu Başvurusu
          </h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Kısa ön kayıt formudur. Uygun adaylarla telefon üzerinden iletişime
            geçilir. Fotoğraf seçimi hariç yaklaşık 1–1.5 dakika sürer.
          </p>
        </div>
      </section>
      <section className="section-pad pt-10">
        <div className="container-site max-w-4xl">
          <ApplicationForm
            settings={{
              phone: settings.phone,
              email: settings.email,
              whatsapp: settings.whatsapp,
            }}
          />
        </div>
      </section>
    </div>
  );
}
